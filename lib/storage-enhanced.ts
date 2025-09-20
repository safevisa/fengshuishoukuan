// 增强版数据存储服务
// 支持 localStorage + 服务器端存储的混合方案

interface StorageData {
  users: any[]
  paymentLinks: any[]
  orders: any[]
  payments: any[]
  withdrawals: any[]
  lastSync: number
}

class EnhancedDataStorage {
  private localStorageKey = 'fengshui_data_v2'
  private serverEndpoint = '/api/data' // 服务器端数据同步端点
  
  constructor() {
    this.initializeData()
  }

  private initializeData() {
    // 初始化默认数据
    const defaultData: StorageData = {
      users: [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@jinshiying.com',
          phone: '+852 12345678',
          password: 'admin123456',
          role: 'admin',
          userType: 'admin_created',
          createdAt: new Date().toISOString()
        }
      ],
      paymentLinks: [],
      orders: [],
      payments: [],
      withdrawals: [],
      lastSync: Date.now()
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.localStorageKey)
      if (!stored) {
        this.saveToLocalStorage(defaultData)
      }
    }
  }

  private saveToLocalStorage(data: StorageData) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.localStorageKey, JSON.stringify(data))
    }
  }

  private loadFromLocalStorage(): StorageData {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.localStorageKey)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (error) {
          console.error('Failed to parse stored data:', error)
        }
      }
    }
    
    // 返回默认数据
    return {
      users: [],
      paymentLinks: [],
      orders: [],
      payments: [],
      withdrawals: [],
      lastSync: Date.now()
    }
  }

  // 同步数据到服务器（如果可用）
  private async syncToServer(data: StorageData) {
    try {
      if (typeof window !== 'undefined') {
        await fetch(this.serverEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      }
    } catch (error) {
      console.warn('Failed to sync to server:', error)
      // 服务器同步失败不影响本地操作
    }
  }

  // 从服务器加载数据（如果可用）
  private async loadFromServer(): Promise<StorageData | null> {
    try {
      if (typeof window !== 'undefined') {
        const response = await fetch(this.serverEndpoint)
        if (response.ok) {
          return await response.json()
        }
      }
    } catch (error) {
      console.warn('Failed to load from server:', error)
    }
    return null
  }

  // 支付链接管理
  createPaymentLink(linkData: any) {
    const data = this.loadFromLocalStorage()
    const newLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...linkData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usedCount: 0
    }
    
    data.paymentLinks.push(newLink)
    data.lastSync = Date.now()
    
    this.saveToLocalStorage(data)
    this.syncToServer(data) // 异步同步到服务器
    
    return newLink
  }

  getPaymentLinkById(id: string) {
    const data = this.loadFromLocalStorage()
    return data.paymentLinks.find(link => link.id === id)
  }

  getPaymentLinksByUserId(userId: string) {
    const data = this.loadFromLocalStorage()
    return data.paymentLinks.filter(link => link.userId === userId)
  }

  // 用户管理
  createUser(userData: any) {
    const data = this.loadFromLocalStorage()
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
      createdAt: new Date().toISOString()
    }
    
    data.users.push(newUser)
    data.lastSync = Date.now()
    
    this.saveToLocalStorage(data)
    this.syncToServer(data)
    
    return newUser
  }

  getUserByEmail(email: string) {
    const data = this.loadFromLocalStorage()
    return data.users.find(user => user.email === email)
  }

  getAllUsers() {
    const data = this.loadFromLocalStorage()
    return data.users
  }

  // 数据导出/导入
  exportData() {
    const data = this.loadFromLocalStorage()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    if (typeof window !== 'undefined') {
      const a = document.createElement('a')
      a.href = url
      a.download = `fengshui-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  importData(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          this.saveToLocalStorage(data)
          this.syncToServer(data)
          resolve(true)
        } catch (error) {
          console.error('Failed to import data:', error)
          resolve(false)
        }
      }
      reader.readAsText(file)
    })
  }

  // 数据清理
  clearAllData() {
    const defaultData: StorageData = {
      users: [],
      paymentLinks: [],
      orders: [],
      payments: [],
      withdrawals: [],
      lastSync: Date.now()
    }
    this.saveToLocalStorage(defaultData)
    this.syncToServer(defaultData)
  }

  // 获取存储统计
  getStorageStats() {
    const data = this.loadFromLocalStorage()
    return {
      users: data.users.length,
      paymentLinks: data.paymentLinks.length,
      orders: data.orders.length,
      payments: data.payments.length,
      withdrawals: data.withdrawals.length,
      lastSync: new Date(data.lastSync).toLocaleString(),
      storageSize: JSON.stringify(data).length
    }
  }
}

export const enhancedStorage = new EnhancedDataStorage()
