import { useEffect } from 'react'
import { Copy, Trash2, X } from 'lucide-react'
import type { SharedImage } from '../types'

interface ImageLightboxProps {
  image: SharedImage | null
  onClose: () => void
  onCopy: () => void
  onDelete: (id: string) => void
}

/**
 * 图片预览弹层：点击遮罩、关闭按钮或 Esc 均可关闭。
 * image: { id, blobUrl, timestamp }，blobUrl 为空时显示加载占位。
 */
export default function ImageLightbox({ image, onClose, onCopy, onDelete }: ImageLightboxProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!image) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-full max-h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {image.blobUrl ? (
          <img
            src={image.blobUrl}
            alt="图片预览"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <div className="flex items-center justify-center">
            <div className="animate-spin h-10 w-10 border-2 border-white border-t-transparent rounded-full" />
          </div>
        )}

        {/* 顶部操作栏 */}
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <button
            onClick={onCopy}
            className="p-2.5 bg-white/10 hover:bg-white/25 text-white rounded-lg backdrop-blur transition-colors"
            title="复制图片到剪贴板"
          >
            <Copy className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(image.id)}
            className="p-2.5 bg-white/10 hover:bg-red-600 text-white rounded-lg backdrop-blur transition-colors"
            title="删除图片"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-white/25 text-white rounded-lg backdrop-blur transition-colors"
            title="关闭 (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
