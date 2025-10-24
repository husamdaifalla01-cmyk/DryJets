import axios, { AxiosInstance, AxiosError } from 'axios'
import * as Cookies from 'js-cookie'

interface ApiResponse<T = any> {
  data: T
  status: number
}

class ApiClient {
  private instance: AxiosInstance

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') {
    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add token to requests
    this.instance.interceptors.request.use((config) => {
      const token = Cookies.default.get('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle errors
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          Cookies.default.remove('authToken')
          typeof window !== 'undefined' && window.location.replace('/login')
        }
        throw error
      }
    )
  }

  // Marketing API methods

  // Campaigns
  async getCampaigns(status?: string) {
    return this.instance.get('/marketing/campaigns', { params: { status } })
  }

  async createCampaign(data: any) {
    return this.instance.post('/marketing/campaigns', data)
  }

  async getCampaign(id: string) {
    return this.instance.get(`/marketing/campaigns/${id}`)
  }

  async updateCampaignStatus(id: string, status: string) {
    return this.instance.patch(`/marketing/campaigns/${id}/status`, { status })
  }

  // Blogs
  async listBlogs(status?: string) {
    return this.instance.get('/marketing/blog', { params: { status } })
  }

  async createBlog(data: any) {
    return this.instance.post('/marketing/blog', data)
  }

  async getBlog(idOrSlug: string) {
    return this.instance.get(`/marketing/blog/${idOrSlug}`)
  }

  async updateBlogContent(id: string, data: any) {
    return this.instance.patch(`/marketing/blog/${id}/content`, data)
  }

  async updateBlogStatus(id: string, status: string) {
    return this.instance.patch(`/marketing/blog/${id}/status`, { status })
  }

  async generateBlog(data: any) {
    return this.instance.post('/marketing/blog/generate', data)
  }

  // Content
  async repurposeContent(blogPostId: string, platforms?: string[]) {
    return this.instance.post('/marketing/content/repurpose', {
      blogPostId,
      platforms,
    })
  }

  // Analytics
  async getSEOMetrics(blogPostId: string) {
    return this.instance.get(`/marketing/analytics/seo/${blogPostId}`)
  }

  async updateSEOMetric(blogPostId: string, data: any) {
    return this.instance.patch(`/marketing/analytics/seo/${blogPostId}`, data)
  }

  async getAnalyticsInsights() {
    return this.instance.get('/marketing/analytics/insights')
  }

  async getPerformanceMetrics(dateRange?: 'week' | 'month' | 'year') {
    return this.instance.get('/marketing/analytics/performance', { params: { dateRange } })
  }

  async getKeywordRankings(limit?: number, offset?: number) {
    return this.instance.get('/marketing/analytics/keywords', { params: { limit, offset } })
  }

  async getSerpRankings(dateRange?: 'week' | 'month' | 'year') {
    return this.instance.get('/marketing/analytics/serp', { params: { dateRange } })
  }

  async getWeeklyReport() {
    return this.instance.get('/marketing/analytics/report/weekly')
  }

  async exportAnalyticsReport(format: 'pdf' | 'csv' = 'pdf') {
    return this.instance.get('/marketing/analytics/export', {
      params: { format },
      responseType: 'blob',
    })
  }

  async sendWeeklyReportEmail() {
    return this.instance.post('/marketing/analytics/email-report')
  }

  // Logs & Monitoring
  async getAgentLogs(agent?: string, action?: string) {
    return this.instance.get('/marketing/logs', { params: { agent, action } })
  }

  async getWorkflows(name?: string, status?: string) {
    return this.instance.get('/marketing/workflows', { params: { name, status } })
  }

  // Auth
  async login(email: string, password: string) {
    return this.instance.post('/auth/login', { email, password })
  }

  // Generic methods
  async get<T = any>(url: string, config?: any) {
    const response = await this.instance.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: any) {
    const response = await this.instance.post<T>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: any) {
    const response = await this.instance.patch<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: any) {
    const response = await this.instance.delete<T>(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()

// Export for use in components
export { ApiClient }
