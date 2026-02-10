'use client';

import { useAuth } from '@/contexts/AuthContext';
import { adminSettingsApi, type PaymentSettingsResponse } from '@/lib/api/admin';
import { contentService, type Content, type ContentCategory, type ContentType } from '@/lib/api/content';
import { uploadService } from '@/lib/api/upload';
import { BarChart3, BookOpen, CreditCard, FileText, Mail, Package } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Lazy load components
const LibraryManager = dynamic(
  () => import('@/components/library/LibraryManager').then(mod => mod.LibraryManager),
  { ssr: false, loading: () => <div>Loading library manager...</div> }
);

const PaymentsSection = dynamic(
  () => import('./components/PaymentsSection').then(mod => mod.PaymentsSection),
  { ssr: false, loading: () => <div>Loading payments section...</div> }
);

const EmailSettingsSection = dynamic(
  () => import('./components/EmailSettingsSection').then(mod => mod.EmailSettingsSection),
  { ssr: false, loading: () => <div>Loading email settings...</div> }
);

const SidebarNav = dynamic(
  () => import('./components/SidebarNav').then(mod => mod.SidebarNav),
  { ssr: false, loading: () => <div>Loading navigation...</div> }
);

const StatCard = dynamic(
  () => import('@/components/admin/StatCard').then(mod => mod.StatCard),
  { ssr: false }
);

const ContentManagementCard = dynamic(
  () => import('@/components/admin/ContentManagementCard').then(mod => mod.ContentManagementCard),
  { ssr: false }
);

const AdminLibraryToolbar = dynamic(
  () => import('@/components/admin/AdminLibraryToolbar').then(mod => mod.AdminLibraryToolbar),
  { ssr: false }
);

const EmptyState = dynamic(
  () => import('@/components/admin/EmptyState').then(mod => mod.EmptyState),
  { ssr: false }
);

const ContentFormSlideout = dynamic(
  () => import('@/components/admin/ContentFormSlideout').then(mod => mod.ContentFormSlideout),
  { ssr: false }
);

// Types
type ActiveTab = 'library' | 'payments' | 'settings';

interface LibraryItem {
  id: string
  title: string
  description: string
  type: 'document' | 'image' | 'video' | 'audio' | 'physical'
  category: string
  tags: string[]
  fileUrl: string
  image: string
  isExclusive: boolean
  isActive: boolean
  price: number
  isFree: boolean
  createdAt: string
  updatedAt: string
}

interface LibraryFormData {
  title: string
  description: string
  content_type: ContentType
  category: ContentCategory
  price: number
  is_exclusive: boolean
  is_active: boolean
  stock_quantity?: number
}

const navItems = [
  { id: 'library' as const, label: 'Library', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'payments' as const, label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'settings' as const, label: 'Email Setup', icon: <Mail className="w-4 h-4" /> },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('library');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Handle tab change
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as ActiveTab);
  }, []);

  // Library Manager State
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'price'>('date');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [currentContent, setCurrentContent] = useState<Partial<Content>>({
    title: '',
    description: '',
    content_type: 'document',
    category: 'other',
    price: 0,
    is_exclusive: false,
    is_active: true,
    stock_quantity: 0
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch library items from the server
  const fetchLibraryItems = useCallback(async () => {
    try {
      setIsLoadingContent(true);
      const response = await contentService.getContent({
        search: searchTerm,
        page_size: 100,
        include_inactive: true
      });
      
      // Transform the API response to match LibraryItem format
      const items = response.items.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        description: item.description || '',
        type: item.content_type as 'document' | 'image' | 'video',
        category: item.category || 'other',
        tags: item.tags || [],
        fileUrl: item.file_url || '',
        image: item.thumbnail_url || item.image_url || '',
        isExclusive: item.is_exclusive || false,
        isActive: item.is_active !== undefined ? item.is_active : true,
        price: item.price || 0,
        isFree: item.is_free !== undefined ? item.is_free : (item.price === 0),
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString()
      }));
      
      setLibraryItems(items);
    } catch (error) {
      console.error('Failed to fetch library items:', error);
      toast.error('Failed to load library items');
    } finally {
      setIsLoadingContent(false);
    }
  }, [searchTerm]);

  // Load library items on component mount and when search term changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchLibraryItems();
    }
  }, [fetchLibraryItems, isAuthenticated]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle form field changes
  const handleFormChange = (data: Partial<LibraryFormData>) => {
    setCurrentContent(prev => ({ ...prev, ...data }));
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!selectedContentIds.length) {
      toast.info('No items selected');
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedContentIds.length} item(s)?`)) {
      try {
        // Delete each item sequentially to better handle errors
        for (const id of selectedContentIds) {
          try {
            await contentService.deleteContent(parseInt(id));
          } catch (err) {
            console.error(`Failed to delete item ${id}:`, err);
            throw new Error(`Failed to delete item ${id}`);
          }
        }
        toast.success(`Successfully deleted ${selectedContentIds.length} item(s)`);
        setSelectedContentIds([]);
        await fetchLibraryItems();
      } catch (error: any) {
        console.error('Bulk delete error:', error);
        toast.error(error?.response?.data?.detail || error?.message || 'Failed to delete some items');
      }
    }
  };

  // Handle edit content
  const handleEditContent = (content: Content) => {
    setCurrentContent(content);
    setIsEditing(true);
  };

  // Handle save content
  const handleSaveContent = async (formData: any) => {
    try {
      // Use the uploaded file URLs from the form (already uploaded via ContentFormSlideout)
      const fileUrl = formData.file_url || formData.fileUrl || '';
      const thumbnailUrl = formData.image_url || formData.thumbnail_url || formData.image || '';
      
      // Prepare data for API
      const contentData = {
        title: formData.title,
        description: formData.description,
        content_type: formData.content_type,
        category: formData.category,
        price: formData.price || 0,
        is_exclusive: formData.is_exclusive || false,
        is_active: formData.is_active ?? true,
        stock_quantity: formData.stock_quantity || 0,
        file_url: fileUrl,
        thumbnail_url: thumbnailUrl,
      };
      
      if (formData.id) {
        // Update existing content
        await contentService.updateContent(formData.id, contentData as any);
        toast.success('Content updated successfully');
      } else {
        // Create new content
        await contentService.createContent(contentData as any);
        toast.success('Content created successfully');
      }
      
      setIsEditing(false);
      setCurrentContent({
        title: '',
        description: '',
        content_type: 'document',
        category: 'other',
        price: 0,
        is_exclusive: false,
        is_active: true,
        stock_quantity: 0
      });
      await fetchLibraryItems();
    } catch (error) {
      console.error('Failed to save content:', error);
      toast.error('Failed to save content');
      throw error;
    }
  };

  // Handle delete content
  const handleDeleteContent = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await contentService.deleteContent(id);
        toast.success('Content deleted successfully');
        await fetchLibraryItems();
      } catch (error: any) {
        console.error('Failed to delete content:', error);
        toast.error(error?.response?.data?.detail || 'Failed to delete content');
      }
    }
  };

  // Handle toggle active status
  const handleToggleActiveStatus = async (item: any) => {
    const action = item.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} "${item.title}"?`)) {
      try {
        await contentService.updateContent(parseInt(item.id), { is_active: !item.isActive });
        toast.success(`Content ${action}d successfully`);
        await fetchLibraryItems();
      } catch (error: any) {
        console.error(`Failed to ${action} content:`, error);
        toast.error(error?.response?.data?.detail || `Failed to ${action} content`);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Show upload started
      toast.info('Uploading file...');
      
      // Upload file
      const response = await uploadService.uploadFile(file);
      
      // Update progress
      setUploadProgress(100);
      
      // Show success
      toast.success(`File uploaded successfully: ${response.original_filename}`);
      
      // Return the file URL
      return response.file_url;
    } catch (error: any) {
      console.error('File upload error:', error);
      
      // Show specific error message
      const errorMessage = error?.data?.detail || error?.message || 'Failed to upload file';
      toast.error(errorMessage);
      
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsResponse>({
    active_mode: 'test',
    test_public_key: '',
    live_public_key: '',
    has_test_secret: false,
    has_live_secret: false
  });
  const [testSecretInput, setTestSecretInput] = useState('');
  const [liveSecretInput, setLiveSecretInput] = useState('');
  const [isSavingPayments, setIsSavingPayments] = useState(false);
  const [isTestingPayment, setIsTestingPayment] = useState(false);

  // Fetch payment settings
  const fetchPaymentSettings = useCallback(async () => {
    try {
      const settings = await adminSettingsApi.getPaymentSettings();
      setPaymentSettings(settings);
    } catch (error) {
      console.error('Failed to fetch payment settings:', error);
      toast.error('Failed to load payment settings');
    }
  }, []);

  // Load payment settings on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchLibraryItems();
      fetchPaymentSettings();
    }
  }, [fetchLibraryItems, fetchPaymentSettings, isAuthenticated]);

  const handleSavePaymentSettings = useCallback(async () => {
    setIsSavingPayments(true);
    try {
      const payload: any = {
        active_mode: paymentSettings.active_mode,
        test_public_key: paymentSettings.test_public_key,
        live_public_key: paymentSettings.live_public_key,
      };

      if (testSecretInput) payload.test_secret_key = testSecretInput;
      if (liveSecretInput) payload.live_secret_key = liveSecretInput;

      const updated = await adminSettingsApi.updatePaymentSettings(payload);
      setPaymentSettings(updated);
      setTestSecretInput('');
      setLiveSecretInput('');
      toast.success('Payment settings saved successfully');
    } catch (error: any) {
      console.error('Failed to save payment settings:', error);
      toast.error(error?.response?.data?.detail || 'Failed to save payment settings');
    } finally {
      setIsSavingPayments(false);
    }
  }, [paymentSettings, testSecretInput, liveSecretInput]);

  const handleTestPayment = useCallback(async () => {
    setIsTestingPayment(true);
    try {
      const result = await adminSettingsApi.testPaymentSettings();
      if (result.ok) {
        toast.success(result.message || 'Test payment successful', {
          description: result.reference ? `Reference: ${result.reference}` : undefined
        });
      } else {
        toast.error(result.message || 'Test payment failed');
      }
    } catch (error: any) {
      console.error('Test payment failed:', error);
      toast.error(error?.response?.data?.detail || 'Test payment failed');
    } finally {
      setIsTestingPayment(false);
    }
  }, []);

  if (isLoading || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // Will redirect from the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your content, payments, and settings</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-[#002366] to-[#059669] text-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">{libraryItems.length} Total Items</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Premium Horizontal Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            <SidebarNav
              activeTab={activeTab}
              onTabChange={handleTabChange}
              items={navItems}
              className=""
            />
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          <div className="p-8">
            {activeTab === 'library' && (
              <div className="space-y-6">
                {/* Statistics Row */}
                {!isLoadingContent && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                      title="Total Content"
                      value={libraryItems.length.toString()}
                      icon={Package}
                      color="blue"
                      index={0}
                    />
                    <StatCard
                      title="Active Items"
                      value={libraryItems.filter(item => item.isFree || item.price > 0).length.toString()}
                      icon={BookOpen}
                      color="green"
                      index={1}
                    />
                    <StatCard
                      title="Exclusive"
                      value={libraryItems.filter(item => item.isExclusive).length.toString()}
                      icon={FileText}
                      color="gold"
                      index={2}
                    />
                    <StatCard
                      title="Total Revenue"
                      value={`₦${libraryItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}`}
                      icon={CreditCard}
                      color="purple"
                      index={3}
                    />
                  </div>
                )}

                {/* Toolbar */}
                <AdminLibraryToolbar
                  searchQuery={searchTerm}
                  onSearchChange={setSearchTerm}
                  sortBy={sortBy}
                  onSortChange={(sort) => setSortBy(sort as 'title' | 'date' | 'price')}
                  selectedCount={selectedContentIds.length}
                  totalCount={libraryItems.length}
                  onBulkDelete={handleBulkDelete}
                  onSelectAll={() => setSelectedContentIds(libraryItems.map(item => item.id))}
                  onDeselectAll={() => setSelectedContentIds([])}
                  onAddNew={() => {
                    setCurrentContent({
                      title: '',
                      description: '',
                      content_type: 'document',
                      category: 'other',
                      price: 0,
                      is_exclusive: false,
                      is_active: true,
                      stock_quantity: 0
                    });
                    setIsEditing(true);
                  }}
                  activeFilters={{
                    type: filterType !== 'all' ? [filterType] : undefined,
                    category: filterCategory !== 'all' ? [filterCategory] : undefined,
                  }}
                  onFilterChange={(filters) => {
                    if (filters.type && filters.type.length > 0) {
                      setFilterType(filters.type[0])
                    } else {
                      setFilterType('all')
                    }
                    if (filters.category && filters.category.length > 0) {
                      setFilterCategory(filters.category[0])
                    } else {
                      setFilterCategory('all')
                    }
                  }}
                />
                
                {isLoadingContent ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : libraryItems.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No content yet"
                    description="Get started by adding your first content item to the library"
                    actionLabel="Add Content"
                    onAction={() => {
                      setCurrentContent({
                        title: '',
                        description: '',
                        content_type: 'document',
                        category: 'other',
                        price: 0,
                        is_exclusive: false,
                        is_active: true,
                        stock_quantity: 0
                      });
                      setIsEditing(true);
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {libraryItems.map((item) => (
                      <ContentManagementCard
                        key={item.id}
                        content={item}
                        isSelected={selectedContentIds.includes(item.id)}
                        onToggleSelect={(id) => {
                          if (selectedContentIds.includes(id)) {
                            setSelectedContentIds(prev => prev.filter(itemId => itemId !== id));
                          } else {
                            setSelectedContentIds(prev => [...prev, id]);
                          }
                        }}
                        onEdit={(content) => {
                          setCurrentContent({
                            id: content.id as any,
                            title: content.title,
                            description: content.description,
                            content_type: content.type as any,
                            category: content.category as ContentCategory,
                            price: content.price,
                            is_exclusive: content.isExclusive,
                            is_active: true,
                            stock_quantity: 0,
                            file_url: content.fileUrl,
                            thumbnail_url: content.image
                          });
                          setIsEditing(true);
                        }}
                        onDelete={(id) => handleDeleteContent(parseInt(id))}
                        onToggleActive={handleToggleActiveStatus}
                        onDuplicate={(content) => {
                          setCurrentContent({
                            title: `${content.title} (Copy)`,
                            description: content.description,
                            content_type: content.type as any,
                            category: content.category as ContentCategory,
                            price: content.price,
                            is_exclusive: content.isExclusive,
                            is_active: content.isActive !== undefined ? content.isActive : true,
                            stock_quantity: 0
                          });
                          setIsEditing(true);
                        }}
                        onPreview={(content) => {
                          // Preview functionality - could open in new tab or modal
                          if (content.fileUrl) {
                            window.open(content.fileUrl, '_blank');
                          }
                        }}
                        onViewStats={(content) => {
                          // Stats functionality - could open a modal with analytics
                          toast.info(`Stats for ${content.title} coming soon`);
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Content Form Slideout */}
                <ContentFormSlideout
                  isOpen={isEditing}
                  onClose={() => {
                    setIsEditing(false)
                    setCurrentContent({
                      title: '',
                      description: '',
                      content_type: 'document',
                      category: 'other',
                      price: 0,
                      is_exclusive: false,
                      is_active: true,
                      stock_quantity: 0
                    })
                  }}
                  onSave={handleSaveContent}
                  initialData={currentContent as any}
                  isEditing={!!currentContent.id}
                />
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <h2 className="text-xl font-medium">Payment Settings</h2>
                <PaymentsSection
                  paymentSettings={paymentSettings as any}
                  onPaymentSettingsChange={(updates) =>
                    setPaymentSettings(prev => ({ ...prev, ...updates }))
                  }
                  onSave={handleSavePaymentSettings}
                  onTestPayment={handleTestPayment}
                  loading={false}
                  saving={isSavingPayments}
                  testSecretInput={testSecretInput}
                  onTestSecretInputChange={setTestSecretInput}
                  liveSecretInput={liveSecretInput}
                  onLiveSecretInputChange={setLiveSecretInput}
                  hasTestSecret={paymentSettings.has_test_secret}
                  hasLiveSecret={paymentSettings.has_live_secret}
                  isTestingPayment={isTestingPayment}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <EmailSettingsSection />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
