// 客户端共享类型定义

// 文件树节点（与后端 /api/files 返回结构对应）
export interface FileNode {
  name: string
  type: 'file' | 'directory'
  path: string
  size?: number
  uploadTime?: string
  modifyTime?: string
  children?: FileNode[]
}

// 实时共享图片
export interface SharedImage {
  id: string
  blobUrl: string | null
  timestamp: string
}

// 上传状态
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error'

// 待上传文件条目
export interface SelectedFile {
  id: string
  file: File
  status: UploadStatus
  relativePath: string
}
