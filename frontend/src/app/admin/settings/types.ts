export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'audio' | 'other';
  category: string;
  tags: string[];
  image: string;
  fileUrl: string;
  isExclusive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryFormData {
  id?: string;
  title: string;
  description: string;
  type: string;
  category: string;
  tags: string[];
  image: string;
  fileUrl: string;
  isExclusive: boolean;
}

export interface UploadProgress {
  file: File;
  progress: number;
  preview: string;
  type: 'image' | 'content';
  field: 'image' | 'fileUrl';
}

export type ActiveTab = 'library' | 'courses' | 'membership' | 'payments';

export interface PageSettings {
  title: string;
  content: string;
  heroImage: string;
  metaDescription: string;
}

export interface Pages {
  help: PageSettings;
  contact: PageSettings;
  faqs: PageSettings;
}

export interface PaymentSettings {
  active_mode: 'test' | 'live';
  test_public_key: string;
  live_public_key: string;
  has_test_secret: boolean;
  has_live_secret: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  color: string;
  popular: boolean;
  features: string[];
  description: string;
}
