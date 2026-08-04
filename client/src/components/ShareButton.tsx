import { useState } from 'react'
import { Share2, Copy, Check, X } from 'lucide-react'
import { useToast } from './Toast'

// 复制文本到剪贴板
// 局域网 http 环境不属于安全上下文（isSecureContext），navigator.clipboard 不可用，需降级为 execCommand
const copyToClipboard = async (text: string): Promise<void> => {
  // 优先使用异步 Clipboard API（https / localhost 安全上下文可用）
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch (e) {
      // 权限被拒绝等场景，降级到 execCommand
    }
  }
  // 降级方案：非安全上下文或权限受限时使用 execCommand
  return new Promise<void>((resolve, reject) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    try {
      const success = document.execCommand('copy')
      if (success) {
        resolve()
      } else {
        reject(new Error('execCommand copy failed'))
      }
    } catch (err) {
      reject(err)
    } finally {
      document.body.removeChild(textarea)
    }
  })
}

const ShareButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  // 分享链接 = 用户当前访问的前端页面地址。
  // 注意不能分享后端 serverUrl（如 http://localhost:3003），
  // 后端 GET / 只返回 JSON，其他设备打开会看不到界面；
  // 前端会自动探测同一主机上的文件传输服务器（3001-3020），所以分享页面地址即可。
  const shareUrl = window.location.origin

  const handleCopy = async () => {
    try {
      await copyToClipboard(shareUrl)
      setCopied(true)
      showToast({
        title: '已复制',
        description: '分享链接已复制到剪贴板',
        type: 'success'
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
      showToast({
        title: '复制失败',
        description: '无法复制链接，请手动复制',
        type: 'error'
      })
    }
  }

  return (
    <div className="relative">
      {/* 分享按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="分享链接"
        aria-label="分享链接"
      >
        <Share2 className="h-5 w-5" />
      </button>

      {/* 分享面板 */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-800">分享链接</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                title="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              在同一局域网内的其他设备浏览器中打开以下链接，即可访问文件传输助手。
            </p>

            <div className="flex items-center space-x-2">
              <div className="flex-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors flex-shrink-0"
                title="复制链接"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? '已复制' : '复制'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShareButton
