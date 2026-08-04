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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-medium text-gray-800">文件名冲突</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">
            以下文件已存在，是否要覆盖？
          </p>
          <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
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
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
          >
            覆盖文件
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConflictModal
