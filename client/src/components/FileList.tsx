import { useState, useEffect } from 'react'
import { RefreshCw, FolderOpen } from 'lucide-react'
import axios, { AxiosError } from 'axios'
import { useToast } from './Toast'
import { API_CONFIG } from '../config/api'
import { useServer } from './serverContext'
import FileTree from './FileTree'
import type { FileNode } from '../types'

interface FileListResponse {
  success: boolean
  files: FileNode[]
}

interface FileListProps {
  refreshTrigger: number
}

const FileList = ({ refreshTrigger }: FileListProps) => {
  const [files, setFiles] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()
  const { serverReady } = useServer()

  const fetchFiles = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get<FileListResponse>(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.files}`)

      if (response.data.success) {
        setFiles(response.data.files || [])
      } else {
        setError('获取文件列表失败')
      }
    } catch (err) {
      console.error('获取文件列表错误:', err)
      setError('无法连接到服务器')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 等待服务器地址发现完成后再加载，避免请求到旧的端口
    if (serverReady === 'ready') {
      fetchFiles()
    }
  }, [refreshTrigger, serverReady])

  const handleDownload = async (filePath: string) => {
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/api/download/${encodeURIComponent(filePath)}`, {
        responseType: 'blob'
      })

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filePath.split('/').pop() || '') // 使用文件名
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      showToast({
        title: '下载成功',
        description: `文件 ${filePath.split('/').pop()} 下载完成`,
        type: 'success'
      })
    } catch (error) {
      console.error('下载失败:', error)
      const message = (error as AxiosError<{ message?: string }>).response?.data?.message
      showToast({
        title: '下载失败',
        description: message || '文件下载时发生错误',
        type: 'error'
      })
    }
  }

  const handleDelete = async (filePath: string) => {
    try {
      const response = await axios.delete(`${API_CONFIG.baseURL}/api/files/${encodeURIComponent(filePath)}`)

      if (response.data.success) {
        // 刷新文件列表
        fetchFiles()
        showToast({
          title: '删除成功',
          description: `${filePath.split('/').pop()} 已删除`,
          type: 'success'
        })
      }
    } catch (error) {
      console.error('删除失败:', error)
      const message = (error as AxiosError<{ message?: string }>).response?.data?.message
      showToast({
        title: '删除失败',
        description: message || '删除时发生错误',
        type: 'error'
      })
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-gray-600">加载中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchFiles}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  if (files.length === 0 && !loading && !error) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <FolderOpen className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 mb-2">暂无文件</p>
        <p className="text-sm text-gray-400">上传一些文件开始使用</p>
      </div>
    )
  }

  return (
    <div className="min-h-[300px]">
      {loading ? (
        <div className="p-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>加载中...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchFiles}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            重试
          </button>
        </div>
      ) : (
        <FileTree
          files={files}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default FileList
