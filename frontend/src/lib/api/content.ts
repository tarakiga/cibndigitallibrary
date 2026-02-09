/**
 * Content API Service
 * Handles all content-related API calls
 */

import apiClient from './client'

export type ContentType = 'document' | 'video' | 'audio' | 'physical'
export type ContentCategory = 'exam_text' | 'cibn_publication' | 'research_paper' | 'stationery' | 'souvenir' | 'other'

export interface Content {
  id: number
  title: string
  description: string
  content_type: ContentType
  category: ContentCategory
  price: number
  is_exclusive: boolean
  is_active: boolean
  file_url?: string
  file_size?: number
  thumbnail_url?: string
  stock_quantity?: number
  duration?: number  // in seconds, for video/audio
  purchase_count?: number  // number of users who purchased this content
  created_at: string
  updated_at?: string
}

export interface ContentListResponse {
  items: Content[]
  total: number
  page: number
  page_size: number
}

export interface ContentFilters {
  page?: number
  page_size?: number
  content_type?: ContentType
  category?: ContentCategory
  search?: string
  min_price?: number
  max_price?: number
}

export const contentService = {
  /**
   * Get user's purchased content
   */
  async getPurchasedContent(): Promise<Content[]> {
    const response = await apiClient.get<Content[]>('/content/me/purchased')
    return response.data
  },

  /**
  /**
   * Get list of content with filters
   */
  async getContent(filters?: ContentFilters): Promise<ContentListResponse> {
    const params = new URLSearchParams()
    
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.page_size) params.append('page_size', filters.page_size.toString())
    if (filters?.content_type) params.append('content_type', filters.content_type)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.min_price !== undefined) params.append('min_price', filters.min_price.toString())
    if (filters?.max_price !== undefined) params.append('max_price', filters.max_price.toString())
    
    const response = await apiClient.get<ContentListResponse>(`/content?${params.toString()}`)
    return response.data
  },
  
  async getPublicContent(filters?: ContentFilters): Promise<ContentListResponse> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.page_size) params.append('page_size', filters.page_size.toString())
    if (filters?.content_type) params.append('content_type', filters.content_type)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.min_price !== undefined) params.append('min_price', filters.min_price.toString())
    if (filters?.max_price !== undefined) params.append('max_price', filters.max_price.toString())
    const response = await apiClient.get<ContentListResponse>(`/content/public?${params.toString()}`)
    return response.data
  },

  /**
   * Get single content item by ID
   */
  async getContentById(id: number): Promise<Content> {
    const response = await apiClient.get<Content>(`/content/${id}`)
    return response.data
  },

  /**
   * Create new content (admin only)
   */
  async createContent(data: Omit<Content, 'id' | 'created_at' | 'updated_at'>): Promise<Content> {
    const response = await apiClient.post<Content>('/content', data)
    return response.data
  },

  /**
   * Update content (admin only)
   */
  async updateContent(id: number, data: Partial<Content>): Promise<Content> {
    const response = await apiClient.patch<Content>(`/content/${id}`, data)
    return response.data
  },

  /**
   * Delete content (admin only)
   */
  async deleteContent(id: number): Promise<void> {
    await apiClient.delete(`/content/${id}`)
  },

  /**
   * Download content file
   */
  async downloadContent(id: number, filename: string): Promise<void> {
    try {
      const response = await apiClient.get(`/content/me/${id}/download`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/octet-stream',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      // Get the filename from the Content-Disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let downloadFilename = filename || 'download';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create a blob URL for the file
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadFilename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      
      // Revoke the blob URL after a short delay to ensure the download starts
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error: any) {
      console.error('Download error:', error);
      throw error;
    }
  },
}

export default contentService
