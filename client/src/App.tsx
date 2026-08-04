import FileUploader from './components/FileUploader'
import FileList from './components/FileList'
import TextShare from './components/TextShare'
import ServerSettings from './components/ServerSettings'
import ShareButton from './components/ShareButton'
import { ToastProvider } from './components/Toast'
import { ServerProvider, useServer } from './components/serverContext'
import { useState } from 'react'
import { FolderOpen, Server, FileText, File, Wifi } from 'lucide-react'

type Tab = 'files' | 'text'

function AppContent() {
  const [refreshFiles, setRefreshFiles] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('files')
  const { serverUrl } = useServer()

  const handleUploadSuccess = () => {
    setRefreshFiles(prev => prev + 1)
  }

  const handleServerChange = () => {
    setRefreshFiles(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-10 h-16 border-b border-gray-200 bg-white/95 px-5 backdrop-blur">
          <div className="flex h-full items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-950 text-white">
                  <FolderOpen className="h-4 w-4" />
                </div>
                <h1 className="text-lg font-semibold tracking-tight text-gray-950">文件传输</h1>
              </div>
              {/* <div className="text-sm text-gray-500">
                文档和附件已上传到此项目
              </div> */}
            </div>
            <div className="flex items-center space-x-1">
              <ShareButton />
              <ServerSettings onServerChange={handleServerChange} />
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-5 py-8 lg:px-6">
          {/* 功能导航标签 */}
          <div className="mb-6 flex w-fit space-x-1 rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'files'
                  ? 'bg-gray-950 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-950'
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              <span>文件传输</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'text'
                  ? 'bg-gray-950 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-950'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>文本共享</span>
            </button>
          </div>

          {activeTab === 'files' ? (
            <>
              {/* 上传区域卡片 */}
              <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
                <FileUploader onUploadSuccess={handleUploadSuccess} />
              </div>

              {/* 附加文件区域 */}
              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
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

                <div className="p-5 sm:p-6">
                  <div className="mb-5">
                    <p className="text-sm text-gray-500">
                      已附加到此项目的文件和资源。
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <div className="min-w-[720px] border-b border-gray-200 bg-gray-50 py-3 pl-4">
                      <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                        {/* 文件名列：结构镜像 FileTree 行（复选框+展开占位+文件图标，含 pr-4），使表头文字与行内文件名对齐 */}
                        <div className="flex items-center space-x-3 flex-1 min-w-0 pr-4">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-gray-950 focus:ring-gray-950" aria-label="全选文件" />
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
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100">
                <Server className="h-4 w-4 text-gray-700" />
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                  <Wifi className="h-3.5 w-3.5 text-green-600" />
                  连接状态
                </p>
                <p className="font-mono text-xs text-gray-500">已连接到: {serverUrl}</p>
              </div>
            </div>
          </div>
        </main>
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
