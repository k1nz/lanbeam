import { useState, useRef, type ChangeEvent, type DragEvent, type InputHTMLAttributes } from 'react'
import { Upload, File, Folder, X, CheckCircle, AlertCircle } from 'lucide-react'
import axios, { AxiosError } from 'axios'
import { useToast } from './Toast'
import { API_CONFIG } from '../config/api'
import ConflictModal from './ConflictModal'
import type { SelectedFile } from '../types'

interface UploadResponse {
  success: boolean
  message?: string
  files?: unknown[]
}

interface FileUploaderProps {
  onUploadSuccess?: () => void
}

const FileUploader = ({ onUploadSuccess }: FileUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'files' | 'folder'>('files')
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [conflicts, setConflicts] = useState<string[]>([])
  const [pendingUpload, setPendingUpload] = useState<SelectedFile[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  // 递归读取文件夹内容
  const readDirectoryRecursively = async (entry: FileSystemEntry, path = ''): Promise<File[]> => {
    const files: File[] = []

    if (entry.isFile) {
      return new Promise<File[]>((resolve) => {
        (entry as FileSystemFileEntry).file((file) => {
          // 设置文件的相对路径
          Object.defineProperty(file, 'webkitRelativePath', {
            value: path + file.name,
            writable: false
          })
          resolve([file])
        })
      })
    } else if (entry.isDirectory) {
      const dirReader = (entry as FileSystemDirectoryEntry).createReader()
      const entries = await new Promise<FileSystemEntry[]>((resolve) => {
        dirReader.readEntries((children) => resolve(children))
      })

      for (const childEntry of entries) {
        const childFiles = await readDirectoryRecursively(childEntry, path + entry.name + '/')
        files.push(...childFiles)
      }
    }

    return files
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)

    const items = Array.from(e.dataTransfer.items)
    const allFiles: File[] = []

    // 处理拖拽的项目（可能包含文件和文件夹）
    for (const item of items) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry()
        if (entry) {
          try {
            const files = await readDirectoryRecursively(entry)
            allFiles.push(...files)
          } catch (error) {
            console.error('读取文件夹失败:', error)
            showToast({
              title: '文件夹读取失败',
              description: `无法读取 "${entry.name}"`,
              type: 'error'
            })
          }
        }
      }
    }

    // 如果没有通过 webkitGetAsEntry 获取到文件，回退到传统方式
    if (allFiles.length === 0) {
      const files = Array.from(e.dataTransfer.files)
      allFiles.push(...files)
    }

    if (allFiles.length > 0) {
      addFiles(allFiles)

      // 检查是否包含文件夹
      const hasFolderFiles = allFiles.some(file => file.webkitRelativePath && file.webkitRelativePath.includes('/'))
      if (hasFolderFiles) {
        showToast({
          title: '文件夹拖拽成功',
          description: `成功读取 ${allFiles.length} 个文件`,
          type: 'success'
        })
      }
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    addFiles(files)
  }

  const addFiles = (files: File[]) => {
    const newFiles: SelectedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending', // pending, uploading, success, error
      relativePath: file.webkitRelativePath || file.name // 保存相对路径用于文件夹上传
    }))
    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileId]
      return newProgress
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 检查文件冲突
  const checkConflicts = async (files: SelectedFile[]): Promise<string[]> => {
    try {
      const fileNames = files.map(fileItem => fileItem.relativePath || fileItem.file.name)
      const response = await axios.post<{ success: boolean; conflicts: string[] }>(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.checkFiles}`, {
        fileNames
      })

      if (response.data.success) {
        return response.data.conflicts || []
      }
      return []
    } catch (error) {
      console.error('检查文件冲突失败:', error)
      return []
    }
  }

  // 执行实际上传
  const performUpload = async (filesToUpload: SelectedFile[]) => {
    setIsUploading(true)
    const formData = new FormData()

    // 添加文件和路径信息
    filesToUpload.forEach((fileItem, index) => {
      formData.append('files', fileItem.file)
      // 添加相对路径信息
      if (fileItem.relativePath && fileItem.relativePath !== fileItem.file.name) {
        formData.append(`relativePath[files[${index}]]`, fileItem.relativePath)
      }
    })

    try {
      const response = await axios.post<UploadResponse>(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.upload}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total ?? 1
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / total
          )

          // 为所有文件设置相同的进度
          const newProgress: Record<string, number> = {}
          filesToUpload.forEach(fileItem => {
            newProgress[fileItem.id] = percentCompleted
          })
          setUploadProgress(newProgress)
        }
      })

      if (response.data.success) {
        // 标记所有文件为成功
        setSelectedFiles(prev =>
          prev.map(fileItem => ({ ...fileItem, status: 'success' }))
        )

        showToast({
          title: '上传成功',
          description: `成功上传 ${filesToUpload.length} 个文件`,
          type: 'success'
        })

        // 清空文件列表
        setTimeout(() => {
          setSelectedFiles([])
          setUploadProgress({})
          onUploadSuccess && onUploadSuccess()
        }, 2000)
      }
    } catch (error) {
      console.error('上传失败:', error)

      // 标记所有文件为错误
      setSelectedFiles(prev =>
        prev.map(fileItem => ({ ...fileItem, status: 'error' }))
      )

      const message = (error as AxiosError<{ message?: string }>).response?.data?.message
      showToast({
        title: '上传失败',
        description: message || '文件上传时发生错误',
        type: 'error'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    // 检查文件冲突
    const conflictFiles = await checkConflicts(selectedFiles)

    if (conflictFiles.length > 0) {
      // 有冲突，显示确认对话框
      setConflicts(conflictFiles)
      setPendingUpload(selectedFiles)
      setShowConflictModal(true)
    } else {
      // 没有冲突，直接上传
      await performUpload(selectedFiles)
    }
  }

  // 处理冲突确认
  const handleConflictConfirm = async () => {
    setShowConflictModal(false)
    if (pendingUpload) {
      await performUpload(pendingUpload)
    }
    setPendingUpload(null)
    setConflicts([])
  }

  // 处理冲突取消
  const handleConflictCancel = () => {
    setShowConflictModal(false)
    setPendingUpload(null)
    setConflicts([])
  }

  const getStatusIcon = (status: SelectedFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  // webkitdirectory 不是 React 标准属性，用类型化展开传入
  const folderInputProps = { webkitdirectory: '' } as InputHTMLAttributes<HTMLInputElement>

  return (
    <div className="space-y-4">
      {/* 冲突确认模态框 */}
      <ConflictModal
        conflicts={conflicts}
        onConfirm={handleConflictConfirm}
        onCancel={handleConflictCancel}
        isVisible={showConflictModal}
      />

      {/* 上传模式选择 */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            value="files"
            checked={uploadMode === 'files'}
            onChange={(e) => setUploadMode(e.target.value as 'files' | 'folder')}
            className="h-4 w-4 text-gray-950 focus:ring-gray-950 border-gray-300"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">选择文件</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            value="folder"
            checked={uploadMode === 'folder'}
            onChange={(e) => setUploadMode(e.target.value as 'files' | 'folder')}
            className="h-4 w-4 text-gray-950 focus:ring-gray-950 border-gray-300"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">选择文件夹</span>
        </label>
      </div>

      {/* 拖拽上传区域 */}
      <div
        className={`
          border border-dashed rounded-lg transition-all duration-200 cursor-pointer
          ${isDragOver
            ? 'border-gray-950 bg-gray-50'
            : 'border-gray-300 hover:border-gray-950 hover:bg-gray-50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (uploadMode === 'files') {
            fileInputRef.current?.click()
          } else {
            folderInputRef.current?.click()
          }
        }}
      >
        <div className="p-8 text-center sm:p-10">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <Upload className="h-5 w-5 text-gray-700" />
          </div>
          <button
            type="button"
            className="bg-gray-950 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors mb-2"
          >
            {uploadMode === 'files' ? '选择文件' : '选择文件夹'}
          </button>
          <p className="text-sm text-gray-500">
            或拖拽{uploadMode === 'files' ? '文件' : '文件夹'}到此处 · 单文件最大 200MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          {...folderInputProps}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 选中文件列表 */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">
                待上传文件 ({selectedFiles.length})
              </h3>
              <button
                onClick={uploadFiles}
                disabled={isUploading}
                className="bg-gray-950 hover:bg-gray-800 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed"
              >
                {isUploading ? '上传中...' : '开始上传'}
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {selectedFiles.map((fileItem) => (
              <div
                key={fileItem.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getStatusIcon(fileItem.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileItem.relativePath || fileItem.file.name}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{formatFileSize(fileItem.file.size)}</span>
                        {fileItem.relativePath && fileItem.relativePath !== fileItem.file.name && (
                          <span className="inline-flex items-center gap-1 font-medium text-gray-600">
                            <Folder className="h-3.5 w-3.5" />
                            文件夹上传
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* 进度条 */}
                    {uploadProgress[fileItem.id] !== undefined && (
                      <div className="w-32">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>进度</span>
                          <span>{uploadProgress[fileItem.id]}%</span>
                        </div>
                          <div className="bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gray-950 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[fileItem.id]}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {!isUploading && fileItem.status === 'pending' && (
                      <button
                        onClick={() => removeFile(fileItem.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        title="移除文件"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUploader
