'use client';

import { useState } from 'react';
import { SidebarNav } from './settings/components/SidebarNav';
import { LibraryManager } from '@/components/library/LibraryManager';
import { PaymentsSection } from './settings/components/PaymentsSection';
import { BookOpen, FileText, Users, CreditCard, Settings } from 'lucide-react';

type ActiveTab = 'library' | 'pages' | 'membership' | 'payments' | 'settings';

// Mock data for testing
const mockLibraryItems = [
  {
    id: '1',
    title: 'Getting Started Guide',
    description: 'A comprehensive guide to get started with our platform',
    type: 'document' as const,
    category: 'Guides',
    tags: ['beginner', 'tutorial'],
    fileUrl: '/documents/guide.pdf',
    isExclusive: false,
    createdAt: '2023-05-15T10:00:00Z',
    updatedAt: '2023-05-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Advanced Techniques',
    description: 'Learn advanced techniques and best practices',
    type: 'video' as const,
    category: 'Tutorials',
    tags: ['advanced', 'video'],
    fileUrl: '/videos/advanced.mp4',
    isExclusive: true,
    createdAt: '2023-05-10T14:30:00Z',
    updatedAt: '2023-05-12T09:15:00Z',
  },
];

const navItems = [
  { id: 'library' as const, label: 'Library', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'pages' as const, label: 'Pages', icon: <FileText className="w-4 h-4" /> },
  { id: 'membership' as const, label: 'Membership', icon: <Users className="w-4 h-4" /> },
  { id: 'payments' as const, label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'settings' as const, label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function TestPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('library');
  const [libraryItems, setLibraryItems] = useState(mockLibraryItems);
  const [selectedLibraryItems, setSelectedLibraryItems] = useState<string[]>([]);
  const [isEditingLibrary, setIsEditingLibrary] = useState(false);
  const [libraryForm, setLibraryForm] = useState({
    title: '',
    description: '',
    type: 'document' as 'document' | 'image' | 'video',
    category: '',
    tags: [] as string[],
    fileUrl: '',
    image: '',
    isExclusive: false,
  });
  const [librarySearch, setLibrarySearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({
    active_mode: 'test' as 'test' | 'live',
    test_public_key: 'pk_test_1234567890',
    live_public_key: '',
    has_test_secret: false,
    has_live_secret: false,
  });
  const [testSecretInput, setTestSecretInput] = useState('');
  const [liveSecretInput, setLiveSecretInput] = useState('');

  // Mock file upload function
  const mockFileUpload = async (file: File, type: 'image' | 'content', field: 'image' | 'fileUrl') => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 20;
        if (newProgress >= 90) {
          clearInterval(interval);
          return 90;
        }
        return newProgress;
      });
    }, 200);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    clearInterval(interval);
    setUploadProgress(100);
    
    // Create a URL for the file
    const fileUrl = URL.createObjectURL(file);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsUploading(false);
    setUploadProgress(0);
    
    return fileUrl;
  };

  // Library handlers
  const handleLibrarySubmit = () => {
    if (isEditingLibrary) {
      // Update existing item
      setLibraryItems(prev =>
        prev.map(item =>
          item.id === libraryForm.id ? { ...item, ...libraryForm, updatedAt: new Date().toISOString() } : item
        )
      );
    } else {
      // Add new item
      const newItem = {
        ...libraryForm,
        id: `item-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLibraryItems(prev => [...prev, newItem]);
    }
    
    // Reset form
    setLibraryForm({
      title: '',
      description: '',
      type: 'document',
      category: '',
      tags: [],
      fileUrl: '',
      image: '',
      isExclusive: false,
    });
    setIsEditingLibrary(false);
  };

  const handleEditLibrary = (id: string) => {
    const itemToEdit = libraryItems.find(item => item.id === id);
    if (itemToEdit) {
      setLibraryForm({
        ...itemToEdit,
        image: itemToEdit.image || '',
      });
      setIsEditingLibrary(true);
    }
  };

  const handleDeleteLibrary = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setLibraryItems(prev => prev.filter(item => item.id !== id));
      setSelectedLibraryItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedLibraryItems.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedLibraryItems.length} item(s)?`)) {
      setLibraryItems(prev => prev.filter(item => !selectedLibraryItems.includes(item.id)));
      setSelectedLibraryItems([]);
    }
  };

  const handleMoveLibrary = (id: string, direction: 'up' | 'down') => {
    setLibraryItems(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index === -1) return prev;

      const newItems = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;

      if (newIndex >= 0 && newIndex < newItems.length) {
        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      }

      return newItems;
    });
  };

  // Payment handlers
  const savePaymentSettings = async () => {
    // In a real app, you would save these settings to your backend
    console.log('Saving payment settings:', paymentSettings);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Panel - Component Testing</h1>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-medium">Sidebar Navigation</h2>
            <div className="mt-4">
              <SidebarNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                items={navItems}
                className="border rounded-lg p-2"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Current tab: <span className="font-medium">{activeTab}</span>
            </p>
          </div>

          <div className="p-6 border-b">
            <h2 className="text-lg font-medium mb-4">Library Manager</h2>
            <div className="border rounded-lg p-4">
              <LibraryManager
                items={libraryItems}
                searchTerm={librarySearch}
                onSearchChange={setLibrarySearch}
                selectedItems={selectedLibraryItems}
                onSelectItem={(id, selected) => {
                  if (selected) {
                    setSelectedLibraryItems(prev => [...prev, id]);
                  } else {
                    setSelectedLibraryItems(prev => prev.filter(itemId => itemId !== id));
                  }
                }}
                onBulkDelete={handleBulkDelete}
                formData={libraryForm}
                onFormChange={(data) => setLibraryForm(prev => ({ ...prev, ...data }))}
                onFileUpload={mockFileUpload}
                onSubmit={handleLibrarySubmit}
                onEdit={handleEditLibrary}
                onDelete={handleDeleteLibrary}
                onMove={handleMoveLibrary}
                isEditing={isEditingLibrary}
                onCancelEdit={() => {
                  setLibraryForm({
                    title: '',
                    description: '',
                    type: 'document',
                    category: '',
                    tags: [],
                    fileUrl: '',
                    image: '',
                    isExclusive: false,
                  });
                  setIsEditingLibrary(false);
                }}
                categories={['Guides', 'Tutorials', 'Resources']}
                availableTags={['beginner', 'intermediate', 'advanced', 'tutorial', 'video', 'guide']}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Payments Section</h2>
            <div className="border rounded-lg p-4">
              <PaymentsSection
                paymentSettings={paymentSettings}
                onPaymentSettingsChange={(updates) => 
                  setPaymentSettings(prev => ({ ...prev, ...updates }))
                }
                onSave={savePaymentSettings}
                loading={false}
                saving={false}
                testSecretInput={testSecretInput}
                onTestSecretInputChange={setTestSecretInput}
                liveSecretInput={liveSecretInput}
                onLiveSecretInputChange={setLiveSecretInput}
                hasTestSecret={paymentSettings.has_test_secret}
                hasLiveSecret={paymentSettings.has_live_secret}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
