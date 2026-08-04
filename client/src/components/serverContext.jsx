import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCurrentServerUrl, discoverServer } from '../config/api'
import { useToast } from './Toast'

const ServerContext = createContext()

export const useServer = () => {
  const context = useContext(ServerContext)
  if (!context) {
    throw new Error('useServer must be used within a ServerProvider')
  }
  return context
}

export const ServerProvider = ({ children }) => {
  const [serverUrl, setServerUrl] = useState(getCurrentServerUrl())
  const [serverReady, setServerReady] = useState('pending') // 'pending', 'ready', 'failed'
  const { showToast } = useToast()

  // 发现服务器并更新状态
  // 返回 { found, portChanged }，由调用方决定如何提示
  const refreshServer = useCallback(async () => {
    const beforeUrl = getCurrentServerUrl()
    setServerReady('pending')

    const found = await discoverServer()
    const afterUrl = getCurrentServerUrl()
    setServerUrl(afterUrl)
    setServerReady(found ? 'ready' : 'failed')

    return { found, portChanged: found && beforeUrl !== afterUrl }
  }, [])

  // 启动时自动发现服务器（端口可能因被占用而切换）
  useEffect(() => {
    let cancelled = false
    const beforeUrl = getCurrentServerUrl()

    refreshServer().then(({ found, portChanged }) => {
      if (cancelled) return

      if (found && portChanged) {
        showToast({
          title: '已自动连接服务器',
          description: `端口被占用，已自动切换到 ${getCurrentServerUrl()}`,
          type: 'success'
        })
      } else if (!found) {
        showToast({
          title: '未找到服务器',
          description: `无法连接到 ${beforeUrl}，请检查服务器是否已启动`,
          type: 'error'
        })
      }
    })

    return () => { cancelled = true }
  }, []) // 仅挂载时执行一次

  return (
    <ServerContext.Provider value={{ serverUrl, serverReady, refreshServer }}>
      {children}
    </ServerContext.Provider>
  )
}
