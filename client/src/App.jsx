import React from 'react'
import FileUploader from './components/FileUploader'
import FileList from './components/FileList'
import TextShare from './components/TextShare'
import ServerSettings from './components/ServerSettings'
import ShareButton from './components/ShareButton'
import { ToastProvider } from './components/Toast'
import { ServerProvider, useServer } from './components/serverContext'
import { useState } from 'react'
import { FolderOpen, Upload, Server, FileText, File } from 'lucide-react'

function AppContent() {
  const [refreshFiles, setRefreshFiles] = useState(0)
  const [activeTab, setActiveTab] = useState('files') // 'files', 'text'
  const { serverUrl } = useServer()

  const handleUploadSuccess = () => {
    setRefreshFiles(prev => prev + 1)
  }

  const handleServerChange = () => {
    setRefreshFiles(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {/* 顶部导航栏 */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">文件传输</h1>
              </div>
              {/* <div className="text-sm text-gray-500">
                文档和附件已上传到此项目
              </div> */}
            </div>
            <div className="flex items-center space-x-4">
              <ShareButton />
              <ServerSettings onServerChange={handleServerChange} />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* 功能导航标签 */}
          <div className="flex space-x-1 mb-6 bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'files'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              <span>文件传输</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>文本共享</span>
            </button>
          </div>

          {activeTab === 'files' ? (
            <>
              {/* 上传区域卡片 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">点击上传或拖拽文件</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      SVG, PNG, JPG 或 GIF (最大 800×400px)
                    </p>
                    <FileUploader onUploadSuccess={handleUploadSuccess} />
                  </div>
                </div>
              </div>

              {/* 附加文件区域 */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">附加文件</h2>
                    {/* 右侧操作按钮暂不启用，注释保留待后续功能完善后再放开 */}
                    {/* <div className="flex items-center space-x-2">
                      <button className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border-b-2 border-transparent hover:border-gray-300">
                        查看全部
                      </button>
                      <button className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded">
                        我的文件
                      </button>
                      <button className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded">
                        共享文件
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div> */}
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      已附加到此项目的文件和资源。
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 pl-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                        {/* 文件名列：结构镜像 FileTree 行（复选框+展开占位+文件图标，含 pr-4），使表头文字与行内文件名对齐 */}
                        <div className="flex items-center space-x-3 flex-1 min-w-0 pr-4">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" />
                          <div className="w-6"></div>
                          <div className="flex-shrink-0">
                            <File className="h-5 w-5 text-transparent" />
                          </div>
                          <span className="flex-1 min-w-0 truncate">文件名</span>
                        </div>
                        {/* 右侧列宽与 FileTree 行保持一致（含行末操作列占位），保证表头与内容对齐 */}
                        <div className="flex items-center flex-shrink-0">
                          <div className="w-24 text-right pr-8">
                            <span>文件大小</span>
                          </div>
                          <div className="w-28 text-right pr-8">
                            <span>上传日期</span>
                          </div>
                          <div className="w-28 text-right pr-8">
                            <span>最后更新</span>
                          </div>
                          <div className="w-32 text-right pr-8">
                            <span>上传者</span>
                          </div>
                          {/* 行末操作列（下载/删除/更多）占位，宽度与表格行一致 */}
                          <div className="w-20"></div>
                        </div>
                      </div>
                    </div>

                    <FileList refreshTrigger={refreshFiles} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <TextShare key={serverUrl} />
          )}

          {/* 服务器状态信息 */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Server className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">连接状态</p>
                <p className="text-sm text-blue-700">已连接到: {serverUrl}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <ServerProvider>
        <AppContent />
      </ServerProvider>
    </ToastProvider>
  )
}

export default App
