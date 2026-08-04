import { AlertTriangle, X } from 'lucide-react'

interface ConflictModalProps {
  conflicts: string[]
  onConfirm: () => void
  onCancel: () => void
  isVisible: boolean
}

const ConflictModal = ({ conflicts, onConfirm, onCancel, isVisible }: ConflictModalProps) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-semibold text-gray-950">文件名冲突</h3>
          </div>
          <button
            onClick={onCancel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">
            以下文件已存在，是否要覆盖？
          </p>
          <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-3">
            {conflicts.map((fileName, index) => (
              <div key={index} className="text-sm text-gray-800 py-1">
                • {fileName}
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            覆盖文件
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConflictModal
