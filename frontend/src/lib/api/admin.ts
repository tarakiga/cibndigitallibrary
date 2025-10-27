import apiClient from './client';
import axios from 'axios';

// Types
export interface PaymentSettingsResponse {
  active_mode: 'test' | 'live';
  test_public_key?: string | null;
  live_public_key?: string | null;
  has_test_secret: boolean;
  has_live_secret: boolean;
}

export interface PaymentSettingsUpdate {
  active_mode?: 'test' | 'live';
  test_public_key?: string;
  test_secret_key?: string;
  live_public_key?: string;
  live_secret_key?: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'document' | 'video';
  category: string;
  tags: string[];
  fileUrl: string;
  thumbnailUrl?: string;
  isExclusive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryItemCreate {
  title: string;
  description: string;
  type: 'image' | 'document' | 'video';
  category: string;
  tags: string[];
  file: File;
  isExclusive: boolean;
}

export interface LibraryItemUpdate extends Partial<LibraryItemCreate> {
  id: string;
}

export interface UploadResponse {
  url: string;
  key: string;
  type: string;
  size: number;
}

// Admin API service
export const adminSettingsApi = {
  // Payment Settings
  async getPaymentSettings(): Promise<PaymentSettingsResponse> {
    const res = await apiClient.get<PaymentSettingsResponse>('/admin/settings/payments');
    return res.data;
  },

  async updatePaymentSettings(payload: PaymentSettingsUpdate): Promise<PaymentSettingsResponse> {
    const res = await apiClient.put<PaymentSettingsResponse>('/admin/settings/payments', payload);
    return res.data;
  },

  async testPaymentSettings(): Promise<{ ok: boolean; message?: string; reference?: string }> {
    const res = await apiClient.post<{ ok: boolean; message?: string; reference?: string }>(
      '/admin/settings/payments/test',
      {}
    );
    return res.data;
  },

  // Library Items
  async getLibraryItems(): Promise<LibraryItem[]> {
    const res = await apiClient.get<LibraryItem[]>('/admin/library');
    return res.data;
  },

  async getLibraryItem(id: string): Promise<LibraryItem> {
    const res = await apiClient.get<LibraryItem>(`/admin/library/${id}`);
    return res.data;
  },

  async createLibraryItem(data: Omit<LibraryItemCreate, 'file'> & { fileUrl: string }): Promise<LibraryItem> {
    const res = await apiClient.post<LibraryItem>('/admin/library', data);
    return res.data;
  },

  async updateLibraryItem(id: string, data: Partial<LibraryItemCreate>): Promise<LibraryItem> {
    const res = await apiClient.put<LibraryItem>(`/admin/library/${id}`, data);
    return res.data;
  },

  async deleteLibraryItem(id: string): Promise<void> {
    await apiClient.delete(`/admin/library/${id}`);
  },

  // File Upload
  async uploadFile(file: File, type: 'image' | 'document' | 'video'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const res = await apiClient.post<UploadResponse>('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        // Progress can be handled via event emitters or context if needed
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    return res.data;
  },

  // Membership Plans
  async getMembershipPlans(): Promise<any[]> {
    const res = await apiClient.get('/admin/membership/plans');
    return res.data;
  },

  async createMembershipPlan(data: any): Promise<any> {
    const res = await apiClient.post('/admin/membership/plans', data);
    return res.data;
  },

  async updateMembershipPlan(id: string, data: any): Promise<any> {
    const res = await apiClient.put(`/admin/membership/plans/${id}`, data);
    return res.data;
  },

  async deleteMembershipPlan(id: string): Promise<void> {
    await apiClient.delete(`/admin/membership/plans/${id}`);
  },

  // Page Management
  async getPages(): Promise<Record<string, any>> {
    const res = await apiClient.get('/admin/pages');
    return res.data;
  },

  async updatePage(slug: string, data: any): Promise<any> {
    const res = await apiClient.put(`/admin/pages/${slug}`, data);
    return res.data;
  },
};

// Helper function to handle file uploads with progress
export const uploadFileWithProgress = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; key: string }> => {
  // First get a pre-signed URL from your server
  const { data } = await apiClient.post<{ url: string; key: string; uploadUrl: string }>('/admin/upload/request', {
    filename: file.name,
    fileType: file.type,
  });

  // Upload the file directly to the storage service (e.g., S3)
  await axios.put(data.uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
      onProgress?.(percentCompleted);
    },
  });

  return { url: data.url, key: data.key };
};
