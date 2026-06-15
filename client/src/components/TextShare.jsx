import React, { useState, useEffect, useRef, useCallback } from 'react'
import { getCurrentServerUrl } from '../config/api'
import { Wifi, WifiOff, Copy, Trash2 } from 'lucide-react'

export default function TextShare() {
  const [text, setText] = useState('')
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const textareaRef = useRef(null)
  const fromServerRef = useRef(false)

  const wsUrl = getCurrentServerUrl().replace(/^http/, 'ws')

  const connect = useCallback(() => {
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'text-update' || message.type === 'text-state') {
          fromServerRef.current = true
          setText(message.text)
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

  const handleChange = (e) => {
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

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
  }

  const handleClear = () => {
    setText('')
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text-update', text: '' }))
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
              className="text-sm text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-gray-100 flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>清空</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm text-gray-500 mb-4">
          在此输入文本，同一网络下的其他设备将实时看到您输入的内容。
        </p>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="在此输入文本..."
          rows={12}
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
    </div>
  )
}
