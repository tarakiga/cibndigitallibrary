import { apiClient } from './client';

export interface UploadResponse {
  success: boolean;
  filename: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  message: string;
}

export const uploadService = {
  /**
   * Upload a file to the server
   * @param file - The file to upload
   * @returns Promise with the upload response including file_url
   */
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Delete an uploaded file
   * @param filename - The filename to delete
   */
  async deleteFile(filename: string): Promise<void> {
    await apiClient.delete(`/upload/file/${filename}`);
  },
};

export default uploadService;
