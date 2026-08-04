import { useState } from 'react'
import { Download, Trash2, File, Folder, FolderOpen, ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react'
import type { FileNode } from '../types'

interface FileTreeNodeProps {
  item: FileNode
  onDownload: (path: string) => void
  onDelete: (path: string) => void
  level?: number
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '--'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const FileTreeNode = ({ item, onDownload, onDelete, level = 0 }: FileTreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!item) {
    return null
  }

  const handleToggle = () => {
    if (item.type === 'directory') {
      setIsExpanded(!isExpanded)
    }
  }

  const handleDelete = () => {
    const message = item.type === 'directory'
      ? `确定要删除文件夹 "${item.name}" 及其所有内容吗？此操作不可撤销。`
      : `确定要删除文件 "${item.name}" 吗？此操作不可撤销。`

    if (confirm(message)) {
      onDelete(item.path)
    }
  }

  const getFileIcon = () => {
    if (item.type === 'directory') {
      return isExpanded ?
        <FolderOpen className="h-5 w-5 text-blue-500" /> :
        <Folder className="h-5 w-5 text-blue-500" />
    }

    const extension = item.name?.split('.').pop()?.toLowerCase() || ''

    switch (extension) {
      case 'pdf':
        return <div className="file-icon-pdf">PDF</div>
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <div className="file-icon-image">IMG</div>
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
        return <div className="file-icon-video">VID</div>
      case 'fig':
      case 'sketch':
      case 'xd':
        return <div className="file-icon-design">FIG</div>
      case 'docx':
      case 'doc':
      case 'txt':
      case 'rtf':
        return <div className="file-icon-document">DOC</div>
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <div className="file-icon-document">XLS</div>
      case 'pptx':
      case 'ppt':
        return <div className="file-icon-document">PPT</div>
      case 'zip':
      case 'rar':
      case '7z':
        return <div className="file-icon-document">ZIP</div>
      default:
        return <File className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div>
      {/* 当前节点 - 表格行样式 */}
      <div
        className="flex items-center hover:bg-gray-50 transition-colors group"
        style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
      >
        {/* 文件名列 */}
        <div className="flex items-center space-x-3 flex-1 min-w-0 py-4 pr-4">
          <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" />

          {/* 展开/折叠图标 */}
          {item.type === 'directory' ? (
            <button
              onClick={handleToggle}
              className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-6"></div>
          )}

          {/* 文件/文件夹图标 */}
          <div className="flex-shrink-0">
            {getFileIcon()}
          </div>

          {/* 文件/文件夹名称 */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.name || 'Unknown'}
            </p>
          </div>
        </div>

        {/* 文件大小列 */}
        <div className="w-24 text-right pr-8">
          <span className="text-sm text-gray-600">
            {item.type === 'file' && item.size ? formatFileSize(item.size) : '--'}
          </span>
        </div>

        {/* 上传日期列 */}
        <div className="w-28 text-right pr-8">
          <span className="text-sm text-gray-600">
            {formatDate(item.uploadTime)}
          </span>
        </div>

        {/* 最后更新列 */}
        <div className="w-28 text-right pr-8">
          <span className="text-sm text-gray-600">
            {formatDate(item.modifyTime || item.uploadTime)}
          </span>
        </div>

        {/* 上传者列 */}
        <div className="w-32 text-right pr-8">
          <div className="flex items-center justify-end space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              U
            </div>
            <span className="text-sm text-gray-600">用户</span>
          </div>
        </div>

        {/* 操作列 */}
        <div className="w-20 text-right">
          <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.type === 'file' && (
              <button
                onClick={() => onDownload(item.path)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="下载"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="删除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="更多选项"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 子节点 */}
      {item.type === 'directory' && isExpanded && item.children && item.children.length > 0 && (
        <div>
          {item.children.map((child, index) => (
            <FileTreeNode
              key={`${child.path || child.name}-${index}`}
              item={child}
              onDownload={onDownload}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface FileTreeProps {
  files: FileNode[]
  onDownload: (path: string) => void
  onDelete: (path: string) => void
}

const FileTree = ({ files, onDownload, onDelete }: FileTreeProps) => {
  if (!files || files.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <File className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600 mb-2">暂无文件</p>
        <p className="text-sm text-gray-500">上传一些文件后，它们将显示在这里</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {files.map((item, index) => (
        <FileTreeNode
          key={`${item.path || item.name}-${index}`}
          item={item}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default FileTree
