/**
 * Progress API Service
 * Handles content progress tracking (video/audio watch progress)
 */

import apiClient from './client'

export interface ContentProgress {
  id: number
  user_id: number
  content_id: number
  playback_position: number
  total_duration: number | null
  progress_percentage: number
  is_completed: boolean
  last_watched: string
  created_at: string
  updated_at: string
}

export interface ProgressUpdate {
  content_id: number
  playback_position: number
  total_duration?: number
  progress_percentage: number
  is_completed?: boolean
}

export const progressService = {
  /**
   * Get all progress for current user
   */
  async getAllProgress(): Promise<ContentProgress[]> {
    const response = await apiClient.get<ContentProgress[]>('/progress')
    return response.data
  },

  /**
   * Get progress for specific content
   */
  async getProgress(contentId: number): Promise<ContentProgress | null> {
    try {
      const response = await apiClient.get<ContentProgress>(`/progress/${contentId}`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Create or update progress
   */
  async saveProgress(data: ProgressUpdate): Promise<ContentProgress> {
    const response = await apiClient.post<ContentProgress>('/progress', data)
    return response.data
  },

  /**
   * Update existing progress
   */
  async updateProgress(contentId: number, data: Partial<ProgressUpdate>): Promise<ContentProgress> {
    const response = await apiClient.patch<ContentProgress>(`/progress/${contentId}`, data)
    return response.data
  },

  /**
   * Delete progress
   */
  async deleteProgress(contentId: number): Promise<void> {
    await apiClient.delete(`/progress/${contentId}`)
  },
}

export default progressService
