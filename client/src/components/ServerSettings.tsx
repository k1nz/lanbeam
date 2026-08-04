import { useState } from 'react'
import { Settings, Check, X, RotateCcw, Wifi, WifiOff, Search } from 'lucide-react'
import { getCurrentServerUrl, updateServerUrl, resetServerUrl } from '../config/api'
import { useServer } from './serverContext'
import { useToast } from './Toast'

type ConnectionStatus = 'unknown' | 'connected' | 'disconnected'

interface ServerSettingsProps {
  onServerChange: () => void
}

const ServerSettings = ({ onServerChange }: ServerSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [serverUrl, setServerUrl] = useState(getCurrentServerUrl())
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown')
  const { showToast } = useToast()
  const { refreshServer } = useServer()

  // 测试服务器连接
  const testConnection = async (url: string): Promise<boolean> => {
    setIsConnecting(true)
    try {
      const response = await fetch(`${url}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })

      if (response.ok) {
        setConnectionStatus('connected')
        return true
      } else {
        setConnectionStatus('disconnected')
        return false
      }
    } catch (error) {
      console.error('连接测试失败:', error)
      setConnectionStatus('disconnected')
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  // 保存服务器设置
  const handleSave = async () => {
    if (!serverUrl.trim()) {
      showToast({
        title: '错误',
        description: '请输入服务器地址',
        type: 'error'
      })
      return
    }

    // 确保 URL 格式正确
    let formattedUrl = serverUrl.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `http://${formattedUrl}`
    }

    // 测试连接
    const isConnected = await testConnection(formattedUrl)

    if (isConnected) {
      updateServerUrl(formattedUrl)
      setServerUrl(formattedUrl)
      setIsOpen(false)

      showToast({
        title: '设置已保存',
        description: `服务器地址已更新为: ${formattedUrl}`,
        type: 'success'
      })

      // 通知父组件服务器地址已更改
      onServerChange()
    } else {
      showToast({
        title: '连接失败',
        description: '无法连接到指定的服务器，请检查地址是否正确',
        type: 'error'
      })
    }
  }

  // 自动检测服务器（服务器可能因端口被占用而切换到其他端口）
  const handleAutoDetect = async () => {
    setIsConnecting(true)

    try {
      const { found, portChanged } = await refreshServer()
      const afterUrl = getCurrentServerUrl()

      if (found) {
        setServerUrl(afterUrl)
        setConnectionStatus('connected')
        showToast({
          title: '已找到服务器',
          description: portChanged
            ? `端口已变化，自动切换到 ${afterUrl}`
            : `服务器连接正常: ${afterUrl}`,
          type: 'success'
        })
        onServerChange()
      } else {
        setConnectionStatus('disconnected')
        showToast({
          title: '未找到服务器',
          description: `扫描端口 ${3001}-${3020} 未发现文件传输服务器，请确认服务器已启动`,
          type: 'error'
        })
      }
    } catch (error) {
      console.error('自动检测失败:', error)
      setConnectionStatus('disconnected')
      showToast({
        title: '自动检测失败',
        description: '扫描过程中发生错误，请稍后重试',
        type: 'error'
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // 重置为默认设置
  const handleReset = () => {
    resetServerUrl()
    setServerUrl(getCurrentServerUrl())
    setConnectionStatus('unknown')

    showToast({
      title: '设置已重置',
      description: '服务器地址已重置为默认值',
      type: 'success'
    })

    onServerChange()
  }

  // 取消更改
  const handleCancel = () => {
    setServerUrl(getCurrentServerUrl())
    setConnectionStatus('unknown')
    setIsOpen(false)
  }

  const getConnectionIcon = () => {
    if (isConnecting) {
      return <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-950 border-t-transparent"></div>
    }

    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return <Settings className="h-4 w-4 text-gray-500" />
    }
  }

  const getConnectionText = () => {
    if (isConnecting) return '连接中...'

    switch (connectionStatus) {
      case 'connected':
        return '已连接'
      case 'disconnected':
        return '连接失败'
      default:
        return '点击测试连接'
    }
  }

  return (
    <div className="relative">
      {/* 设置按钮 */}
      <button
        onClick={() => {
          setServerUrl(getCurrentServerUrl())
          setIsOpen(!isOpen)
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950"
        title="服务器设置"
        aria-label="服务器设置"
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* 设置面板 */}
      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="p-5">
            <h3 className="mb-4 text-base font-semibold text-gray-950">
              服务器设置
            </h3>

            <div className="space-y-4">
              {/* 当前服务器地址显示 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  当前服务器地址
                </label>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-2 font-mono text-xs text-gray-600">
                  {getCurrentServerUrl()}
                </div>
              </div>

              {/* 服务器地址输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新服务器地址
                </label>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder={getCurrentServerUrl()}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                />
                <p className="text-xs text-gray-500 mt-1">
                  示例: http://192.168.1.100:3001
                </p>
              </div>

              {/* 连接状态 */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => testConnection(serverUrl)}
                  disabled={isConnecting}
                  className="flex items-center space-x-2 px-2 py-1 text-sm text-gray-700 hover:text-gray-950 disabled:text-gray-400"
                >
                  {getConnectionIcon()}
                  <span>{getConnectionText()}</span>
                </button>

                <button
                  onClick={handleAutoDetect}
                  disabled={isConnecting}
                  className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-700 hover:text-gray-950 disabled:text-gray-400"
                  title="自动扫描端口，查找文件传输服务器"
                >
                  <Search className="h-3 w-3" />
                  <span>自动检测</span>
                </button>
              </div>

              {/* 按钮组 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  title="重置为默认设置"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>重置</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    <X className="h-3 w-3" />
                    <span>取消</span>
                  </button>
                  <button
                    onClick={handleSave}
                  className="flex items-center space-x-1 rounded-md bg-gray-950 px-3 py-1.5 text-sm text-white transition-colors hover:bg-gray-800"
                  >
                    <Check className="h-3 w-3" />
                    <span>保存</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServerSettings
