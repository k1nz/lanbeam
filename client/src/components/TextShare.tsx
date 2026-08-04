import { useState, useEffect, useRef, useCallback, type ChangeEvent, type ClipboardEvent } from 'react'
import { getCurrentServerUrl } from '../config/api'
import { useToast } from './Toast'
import ImageLightbox from './ImageLightbox'
import { Wifi, WifiOff, Copy, Trash2, ClipboardPaste, Image as ImageIcon, X } from 'lucide-react'
import type { SharedImage } from '../types'

// 待发送图片帧
interface SendQueueItem {
  id: string
  imageBytes: Uint8Array
  mimeType: string
}

// 收到/发出的文本消息
type WsMessage =
  | { type: 'text-update' | 'text-state'; text: string; images?: { id: string; timestamp: string }[] }
  | { type: 'image-delete'; id: string }

// 图片二进制帧头
interface ImageAddHeader {
  type: 'image-add-binary'
  image: { id: string; timestamp: string; mimeType?: string }
}

// 图片按添加时间从新到旧排序（新图片显示在最前）
const sortImages = (images: SharedImage[]): SharedImage[] =>
  [...images].sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))

export default function TextShare() {
  const [text, setText] = useState('')
  const [images, setImages] = useState<SharedImage[]>([])
  const [connected, setConnected] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null) // 正在预览的图片 id
  const { showToast } = useToast()
  const wsRef = useRef<WebSocket | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fromServerRef = useRef(false)
  // 网络字节（发送用）与 blobUrl（预览用）分开存，避免跨标签页共享
  const bytesRef = useRef(new Map<string, Uint8Array>())
  const blobUrlsRef = useRef(new Map<string, string>())
  // 每次事件循环处理一帧，保证粘贴多张图片时有序发送
  const sendQueueRef = useRef<SendQueueItem[]>([])
  const sendingRef = useRef(false)

  const wsUrl = getCurrentServerUrl().replace(/^http/, 'ws')

  const connect = useCallback(() => {
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
    }

    // 新连接（含重连）时清理上一轮的预览和网络字节
    const clearImages = () => {
      blobUrlsRef.current.forEach((blobUrl) => URL.revokeObjectURL(blobUrl))
      bytesRef.current.clear()
      blobUrlsRef.current.clear()
      setImages([])
    }

    ws.onmessage = (event: MessageEvent) => {
      if (event.data instanceof Blob) {
        handleImageMessage(event.data)
        return
      }

      try {
        const message = JSON.parse(event.data) as WsMessage
        if (message.type === 'text-update' || message.type === 'text-state') {
          fromServerRef.current = true
          setText(message.text)
          if (message.type === 'text-state') {
            clearImages()
            message.images?.forEach((img) => addPendingImage(img.id, img.timestamp))
          }
        } else if (message.type === 'image-delete') {
          removeLocalImage(message.id)
        }
      } catch (e) {
        console.error('消息解析错误:', e)
      }
    }

    ws.onclose = () => {
      setConnected(false)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [wsUrl])

  useEffect(() => {
    connect()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  // ===== 图片相关逻辑 =====

  // 收到二进制帧：2 字节头部长度 + JSON 头 + 图片字节
  const handleImageMessage = async (blob: Blob) => {
    try {
      const buf = await blob.arrayBuffer()
      const headerLen = new DataView(buf).getUint16(0)
      const header = JSON.parse(new TextDecoder().decode(buf.slice(2, 2 + headerLen))) as ImageAddHeader
      if (header.type === 'image-add-binary') {
        const { id, timestamp } = header.image
        const imageBytes = new Uint8Array(buf, 2 + headerLen)
        const blobUrl = URL.createObjectURL(new Blob([imageBytes], { type: header.image.mimeType || 'image/png' }))
        bytesRef.current.set(id, imageBytes)
        blobUrlsRef.current.set(id, blobUrl)
        setImages((prev) => {
          const next = [...prev.filter((img) => img.id !== id), { id, blobUrl, timestamp }]
          return sortImages(next)
        })
      }
    } catch (e) {
      console.error('图片消息解析错误:', e)
    }
  }

  // 为待接收的图片注册占位信息（数据到达后再生成预览）
  const addPendingImage = (id: string, timestamp: string) => {
    setImages((prev) => {
      if (prev.some((img) => img.id === id)) return prev
      const next = [...prev, { id, blobUrl: null, timestamp }]
      return sortImages(next)
    })
  }

  const removeLocalImage = (id: string) => {
    const blobUrl = blobUrlsRef.current.get(id)
    if (blobUrl) URL.revokeObjectURL(blobUrl)
    blobUrlsRef.current.delete(id)
    bytesRef.current.delete(id)
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const sendImage = (id: string, imageBytes: Uint8Array, mimeType: string) => {
    const header = JSON.stringify({
      type: 'image-add-binary',
      image: { id, mimeType }
    })
    const headerBuf = new TextEncoder().encode(header)
    const lenBuf = new Uint8Array(2)
    new DataView(lenBuf.buffer).setUint16(0, headerBuf.length)
    const frame = new Uint8Array(2 + headerBuf.length + imageBytes.length)
    frame.set(lenBuf, 0)
    frame.set(headerBuf, 2)
    frame.set(imageBytes, 2 + headerBuf.length)
    wsRef.current?.send(frame.buffer)
  }

  // 队列发送：同一时间只发一张，保证多张图片按顺序到达
  const processSendQueue = () => {
    if (sendingRef.current) return
    const item = sendQueueRef.current.shift()
    if (!item) return
    sendingRef.current = true
    try {
      sendImage(item.id, item.imageBytes, item.mimeType)
    } finally {
      sendingRef.current = false
      // 下一帧处理下一条
      setTimeout(processSendQueue, 0)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)

    if (fromServerRef.current) {
      fromServerRef.current = false
      return
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text-update', text: newText }))
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return
    let hasImage = false

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        hasImage = true
        const file = item.getAsFile()
        if (!file) continue
        const mimeType = file.type
        const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        file.arrayBuffer().then((buf) => {
          const imageBytes = new Uint8Array(buf)
          // 本地立即预览
          const blobUrl = URL.createObjectURL(new Blob([imageBytes], { type: mimeType }))
          bytesRef.current.set(id, imageBytes)
          blobUrlsRef.current.set(id, blobUrl)
          const timestamp = new Date().toISOString()
          setImages((prev) => {
            const next = [...prev.filter((img) => img.id !== id), { id, blobUrl, timestamp }]
            return sortImages(next)
          })
          // 入队发送
          sendQueueRef.current.push({ id, imageBytes, mimeType })
          processSendQueue()
        }).catch((err) => {
          console.error('读取剪贴板图片失败:', err)
        })
      }
    }

    if (hasImage) {
      e.preventDefault() // 阻止粘贴事件在文本框中插入图片路径之类的内容
    }
  }

  const handleRemoveImage = (id: string) => {
    removeLocalImage(id)
    if (previewId === id) setPreviewId(null)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'image-delete', id }))
    }
  }

  // 把图片复制到剪贴板（ClipboardItem 需在 https 或 localhost 下可用）
  const copyImageToClipboard = async (id: string | null) => {
    if (!id) return
    try {
      const blobUrl = blobUrlsRef.current.get(id)
      if (!blobUrl) {
        showToast({ title: '图片尚未加载完成', type: 'warning' })
        return
      }
      const blob = await fetch(blobUrl).then((r) => r.blob())
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      showToast({ title: '已复制图片到剪贴板', type: 'success' })
    } catch (e) {
      console.error('复制图片失败:', e)
      showToast({
        title: '复制失败',
        description: '当前浏览器/地址不支持图片复制，请直接下载或长按保存',
        type: 'error'
      })
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
  }

  const handleClear = () => {
    setText('')
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text-update', text: '' }))
    }
  }

  const clearAll = () => {
    // 清空文本
    handleClear()
    // 清空图片：回收预览 URL，并通知所有端移除图片
    const ids = [...bytesRef.current.keys()]
    blobUrlsRef.current.forEach((blobUrl) => URL.revokeObjectURL(blobUrl))
    bytesRef.current.clear()
    blobUrlsRef.current.clear()
    setImages([])
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      ids.forEach((id) => wsRef.current?.send(JSON.stringify({ type: 'image-delete', id })))
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">实时文本共享</h2>
            {connected ? (
              <span className="inline-flex items-center text-xs text-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                已连接
              </span>
            ) : (
              <span className="inline-flex items-center text-xs text-red-500">
                <WifiOff className="h-3 w-3 mr-1" />
                未连接
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 flex items-center space-x-1"
            >
              <Copy className="h-4 w-4" />
              <span>复制</span>
            </button>
            <button
              onClick={handleClear}
              className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>清空</span>
            </button>
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-gray-100 flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>清空全部</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 文本区 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              在此输入文本，同一网络下的其他设备将实时看到您输入的内容。
            </p>
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onPaste={handlePaste}
            placeholder="在此输入文本，Ctrl+V 可直接粘贴图片..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>{text.length} 个字符</span>
            {!connected && (
              <button onClick={connect} className="text-blue-500 hover:text-blue-600">
                重新连接
              </button>
            )}
          </div>
        </div>

        {/* 图片区 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">共享图片</h3>
              <span className="text-xs text-gray-400">
                {images.length > 0 ? `${images.length} 张` : ''}
              </span>
            </div>
            <span className="inline-flex items-center text-xs text-gray-400">
              <ClipboardPaste className="h-3 w-3 mr-1" />
              在文本框中粘贴图片即可共享
            </span>
          </div>

          {images.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-lg py-8 flex flex-col items-center justify-center">
              <ClipboardPaste className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">暂无图片，在文本框中粘贴即可实时共享</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
                >
                  {img.blobUrl ? (
                    <button
                      onClick={() => setPreviewId(img.id)}
                      className="w-full h-full block cursor-pointer"
                      title="点击预览图片"
                    >
                      <img
                        src={img.blobUrl}
                        alt="共享图片"
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                  )}

                  {/* 悬停操作：复制 + 删除 */}
                  <div className="absolute top-1.5 right-1.5 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyImageToClipboard(img.id)
                      }}
                      className="p-1.5 bg-black/50 hover:bg-blue-600 text-white rounded-full transition-colors"
                      title="复制图片"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage(img.id)
                      }}
                      className="p-1.5 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors"
                      title="删除图片"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 图片预览弹层 */}
      <ImageLightbox
        image={images.find((img) => img.id === previewId) || null}
        onClose={() => setPreviewId(null)}
        onCopy={() => copyImageToClipboard(previewId)}
        onDelete={handleRemoveImage}
      />
    </div>
  )
}
