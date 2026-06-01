import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Switch } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    ChevronRight,
    Clock,
    DollarSign,
    Eye,
    FileText,
    Globe,
    Image as ImageIcon,
    Lock,
    Sparkles,
    Tag as TagIcon,
    Upload,
    Video,
    X
} from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { LibraryFormData } from './types';

const LibraryItemSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  type: z.enum(['document', 'image', 'video']),
  category: z.string().min(1, { message: "Category is required" }),
  fileUrl: z.string().optional(),
  image: z.string().optional(),
  isFree: z.boolean(),
  price: z.number().optional(),
  isExclusive: z.boolean(),
  isPublic: z.boolean(),
  publishAt: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).refine((data) => data.isFree || (data.price && data.price > 0), {
  message: "Price is required for paid content",
  path: ["price"],
}).refine((data) => data.fileUrl || data.type === 'document', { // Allow documents to adjust later potentially, or strictly require file
    message: "File is required",
    path: ["fileUrl"]
});

interface LibraryFormProps {
  formData: LibraryFormData;
  onFormChange: (data: Partial<LibraryFormData>) => void;
  onFileUpload: (file: File, type: 'image' | 'content', field: 'image' | 'fileUrl') => Promise<string>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onDelete?: () => void;
  categories: string[];
  availableTags: string[];
  isUploading: boolean;
  uploadProgress: number;
  isEditing: boolean;
}

export function LibraryForm({
  formData,
  onFormChange,
  onFileUpload,
  onSubmit: parentSubmit,
  onCancel,
  onDelete,
  categories,
  availableTags,
  isUploading,
  uploadProgress,
  isEditing,
}: LibraryFormProps) {
    const defaultValues = {
        title: formData.title || '',
        description: formData.description || '',
        type: formData.type || 'document',
        category: formData.category || '',
        fileUrl: formData.fileUrl || '',
        image: formData.image || '',
        isFree: formData.isFree ?? true,
        price: formData.price || 0,
        isExclusive: formData.isExclusive || false,
        isPublic: formData.isPublic ?? true,
        publishAt: formData.publishAt || '',
        tags: formData.tags || [],
    };

    const form = useForm<z.infer<typeof LibraryItemSchema>>({
        resolver: zodResolver(LibraryItemSchema),
        defaultValues,
        mode: "onChange",
    });

  const [selectedTags, setSelectedTags] = useState<string[]>(formData.tags || []);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'content') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const field = type === 'image' ? 'image' : 'fileUrl';
    
    try {
      const fileUrl = await onFileUpload(file, type, field);
      form.setValue(field, fileUrl); // Update react-hook-form state
      onFormChange({ [field]: fileUrl });
    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle error (e.g., show toast)
    }
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    form.setValue('tags', newTags);
    onFormChange({ tags: newTags });
  };

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!selectedTags.includes(newTag)) {
        const newTags = [...selectedTags, newTag];
        setSelectedTags(newTags);
        form.setValue('tags', newTags);
        onFormChange({ tags: newTags });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(newTags);
    form.setValue('tags', newTags);
    onFormChange({ tags: newTags });
  };

  const currentType = form.watch('type');
  const currentImage = form.watch('image');
  const isFree = form.watch('isFree');
  const isExclusive = form.watch('isExclusive');
  const isPublic = form.watch('isPublic');

  const getFileTypeIcon = () => {
    switch (currentType) {
      case 'image':
        return <ImageIcon className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleSubmit = (data: z.infer<typeof LibraryItemSchema>) => {
      // Sync form data to parent before submit, just in case
      onFormChange(data as any);
      // Construct a synthetic event because parent expects one
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      parentSubmit(syntheticEvent);
  };

  return (
    <Form {...form}>
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={form.handleSubmit(handleSubmit)} 
          className="space-y-8"
        >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl"
            >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-premium-navy/10 rounded-xl">
                    <FileText className="w-5 h-5 text-premium-navy dark:text-premium-emerald" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">General Information</h3>
                    <p className="text-sm text-gray-500 font-medium">Define the core attributes of your resource</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Resource Title *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Annual Financial Report 2024"
                                    className="border-gray-200/50 dark:border-white/10"
                                    {...field}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        onFormChange({ title: e.target.value });
                                    }}
                                />
                            </FormControl>
                            <FormMessage className="font-medium ml-1" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Comprehensive Description *</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={4}
                                    className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-gray-200/50 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-premium-emerald/20 transition-all min-h-[120px]"
                                    placeholder="Provide detailed context about this material..."
                                    {...field}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        onFormChange({ description: e.target.value });
                                    }}
                                />
                            </FormControl>
                            <FormMessage className="font-medium ml-1" />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Resource Category Type *</FormLabel>
                                <Select 
                                  onValueChange={(val) => {
                                    field.onChange(val);
                                    onFormChange({ type: val as any });
                                  }} 
                                  defaultValue={field.value}
                                >
                                    <FormControl>
                                      <SelectTrigger className="h-12 border-gray-200/50 dark:border-white/10 rounded-xl bg-white/50 dark:bg-white/5">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-2xl border-white/20 backdrop-blur-2xl">
                                        <SelectItem value="document" className="rounded-xl">Document</SelectItem>
                                        <SelectItem value="image" className="rounded-xl">Image</SelectItem>
                                        <SelectItem value="video" className="rounded-xl">Video</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage className="font-medium ml-1" />
                            </FormItem>
                        )}
                    />

                     <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Thematic Classification *</FormLabel>
                                <Select 
                                  onValueChange={(val) => {
                                    field.onChange(val);
                                    onFormChange({ category: val });
                                  }} 
                                  defaultValue={field.value}
                                >
                                    <FormControl>
                                      <SelectTrigger className="h-12 border-gray-200/50 dark:border-white/10 rounded-xl bg-white/50 dark:bg-white/5">
                                        <SelectValue placeholder="Select classification" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-2xl border-white/20 backdrop-blur-2xl">
                                        {categories.map((category) => (
                                        <SelectItem key={category} value={category} className="rounded-xl">
                                            {category}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="font-medium ml-1" />
                            </FormItem>
                        )}
                    />
                </div>
                </div>
            </motion.div>

            {/* File Upload Area */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl"
            >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-premium-emerald/10 rounded-xl">
                    <Upload className="w-5 h-5 text-premium-emerald" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Media Assets</h3>
                    <p className="text-sm text-gray-500 font-medium">Upload your resource files and thumbnails</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                <div>
                    <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1 mb-3 block">
                      Primary Content ({currentType})
                    </FormLabel>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10 p-12 text-center transition-all hover:border-premium-emerald hover:bg-premium-emerald/5"
                    >
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="space-y-4"
                      >
                        <div className="mx-auto w-16 h-16 bg-premium-emerald/10 rounded-2xl flex items-center justify-center text-premium-emerald group-hover:scale-110 transition-transform">
                          {getFileTypeIcon()}
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {isUploading ? 'Transferring Data...' : 'Drop your file here'}
                          </p>
                          <p className="text-sm text-gray-500 font-medium max-w-[240px] mx-auto">
                            Support for {currentType === 'image' ? 'high-res JPG/PNG' : currentType === 'video' ? 'MP4/WebM' : 'PDF/DOCX'} up to 50MB
                          </p>
                        </div>
                        <Button type="button" variant="outline" className="rounded-xl border-gray-200 dark:border-white/10 font-bold">
                          Select Local File
                        </Button>
                      </motion.div>

                      <input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={(e) => handleFileChange(e, 'content')}
                        accept={
                            currentType === 'image' 
                            ? 'image/*' 
                            : currentType === 'video' 
                                ? 'video/*' 
                                : '.pdf,.doc,.docx,.txt'
                        }
                        ref={fileInputRef}
                      />
                    </div>

                    {isUploading && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 space-y-3"
                      >
                        <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                          <span>Progress</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                          <motion.div
                            className="h-full bg-gradient-to-r from-premium-navy to-premium-emerald rounded-full"
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                          />
                        </div>
                      </motion.div>
                    )}

                    <AnimatePresence>
                      {form.formState.errors.fileUrl && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-sm font-bold text-red-500 mt-4 flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {form.formState.errors.fileUrl.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                </div>

                {currentType === 'video' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1 mb-3 block">
                        Custom Thumbnail (Optional)
                      </FormLabel>
                      <div 
                        onClick={() => imageInputRef.current?.click()}
                        className="flex items-center gap-6 p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-premium-gold/50 hover:bg-premium-gold/5 transition-all cursor-pointer group"
                      >
                        <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-xl text-gray-400 group-hover:text-premium-gold transition-colors">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Brand your video</p>
                          <p className="text-xs text-gray-500 font-medium">PNG or JPG up to 5MB</p>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, 'image')}
                          accept="image/*"
                          ref={imageInputRef}
                        />
                      </div>
                    </motion.div>
                )}
                </div>
            </motion.div>

            {/* Pricing & Access */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl"
            >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-premium-gold/10 rounded-xl">
                    <DollarSign className="w-5 h-5 text-premium-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Access & Monetization</h3>
                    <p className="text-sm text-gray-500 font-medium">Configure how users consume this content</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                <FormField
                    control={form.control}
                    name="isFree"
                    render={({ field }) => (
                        <FormItem>
                         <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-3 rounded-xl transition-colors",
                                field.value ? "bg-premium-emerald/10 text-premium-emerald" : "bg-premium-navy/10 text-premium-navy"
                              )}>
                                {field.value ? <Globe className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {field.value ? 'Open Access' : 'Commercial License'}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                  {field.value ? 'Visible to all library patrons' : 'Requires payment per access'}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={field.value}
                              onChange={(checked) => {
                                  field.onChange(checked);
                                  onFormChange({ isFree: checked });
                              }}
                              className={cn(
                                  field.value ? 'bg-premium-emerald' : 'bg-premium-navy',
                                  'relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-offset-2 ring-premium-emerald'
                              )}
                            >
                              <span className="sr-only">Free content toggle</span>
                              <span
                                  className={cn(
                                  field.value ? 'translate-x-6' : 'translate-x-0',
                                  'pointer-events-none relative inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out'
                                  )}
                              />
                            </Switch>
                        </div>
                        </FormItem>
                    )}
                />

                <AnimatePresence mode="wait">
                  {!isFree && (
                       <motion.div
                          key="price-input"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                       >
                         <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Asset Valuation (₦) *</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-premium-emerald group-focus-within:text-premium-gold transition-colors">
                                              <span className="font-bold">₦</span>
                                            </div>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="pl-10 h-14 bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10 rounded-2xl text-lg font-bold"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    field.onChange(val);
                                                    onFormChange({ price: val || 0 });
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription className="ml-1 mt-1 font-medium">Standard marketplace price with tax inclusive.</FormDescription>
                                    <FormMessage className="font-medium ml-1" />
                                </FormItem>
                            )}
                        />
                       </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                      control={form.control}
                      name="isExclusive"
                      render={({ field }) => (
                           <FormItem>
                              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "p-2 rounded-lg",
                                      field.value ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400"
                                    )}>
                                      <Lock className="w-4 h-4" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Exclusive</p>
                                  </div>
                                  <Switch
                                    checked={field.value}
                                    onChange={(checked) => {
                                        field.onChange(checked);
                                        onFormChange({ isExclusive: checked });
                                    }}
                                    className={cn(
                                        field.value ? 'bg-purple-500' : 'bg-gray-200 dark:bg-white/10',
                                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200'
                                    )}
                                  >
                                    <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ui-checked:translate-x-5" />
                                  </Switch>
                              </div>
                           </FormItem>
                      )}
                  />

                  <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                           <FormItem>
                              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "p-2 rounded-lg",
                                      field.value ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                                    )}>
                                      <Eye className="w-4 h-4" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Public</p>
                                  </div>
                                  <Switch
                                    checked={field.value}
                                    onChange={(checked) => {
                                        field.onChange(checked);
                                        onFormChange({ isPublic: checked });
                                    }}
                                    className={cn(
                                        field.value ? 'bg-blue-500' : 'bg-gray-200 dark:bg-white/10',
                                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200'
                                    )}
                                  >
                                    <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ui-checked:translate-x-5" />
                                  </Switch>
                              </div>
                          </FormItem>
                      )}
                  />
                </div>

                {isPublic && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <FormField
                          control={form.control}
                          name="publishAt"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Scheduled Release</FormLabel>
                                  <FormControl>
                                      <div className="relative group">
                                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-premium-emerald transition-colors">
                                            <Clock className="h-5 w-5" />
                                          </div>
                                          <input
                                            type="datetime-local"
                                            className="h-14 w-full pl-12 bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10 rounded-2xl font-semibold focus:ring-2 focus:ring-premium-emerald/20 transition-all"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                onFormChange({ publishAt: e.target.value });
                                            }}
                                          />
                                      </div>
                                  </FormControl>
                                  <FormDescription className="ml-1 mt-1 font-medium">Leave empty for immediate broadcast visibility.</FormDescription>
                                  <FormMessage className="font-medium ml-1" />
                              </FormItem>
                          )}
                      />
                    </motion.div>
                )}
                </div>
            </motion.div>
            </div>

            {/* Right column */}
            <div className="space-y-8">
            {/* Real-time Preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-premium-navy dark:bg-gray-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl sticky top-8"
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-premium-emerald" />
                    Live Preview
                  </h3>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-tighter border-white/20 text-white/60">
                    Draft State
                  </Badge>
                </div>
                <div className="p-6">
                  <div className="relative group aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                    {currentType === 'image' && currentImage ? (
                      <img
                        src={currentImage}
                        alt="Preview"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                        {currentType === 'video' ? <Video className="w-12 h-12 mb-2" /> : <FileText className="w-12 h-12 mb-2" />}
                        <span className="text-xs font-bold uppercase tracking-widest">{currentType} Preview</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-premium-emerald text-white rounded-lg border-none font-bold">
                        {isFree ? 'Free' : `₦${form.watch('price')?.toLocaleString() || '0'}`}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-white line-clamp-1">
                        {form.watch('title') || 'Untitled Resource'}
                      </h4>
                      <p className="text-sm text-white/50 font-medium line-clamp-2 leading-relaxed">
                        {form.watch('description') || 'Define your content description to see how it renders for library patrons...'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-white/10 text-white/80 border-none rounded-lg h-7">
                        {form.watch('category') || 'Uncategorized'}
                      </Badge>
                      {selectedTags.slice(0, 2).map(tag => (
                        <Badge key={tag} className="bg-white/5 text-white/40 border-none rounded-lg h-7">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                        <span>Visibility: {isPublic ? 'Broad' : 'Internal'}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{form.watch('publishAt') ? 'Scheduled' : 'Instant'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </motion.div>

            {/* Smart Tags Management */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 shadow-xl"
            >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-premium-navy/10 rounded-xl">
                    <TagIcon className="w-5 h-5 text-premium-navy" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Classification</h3>
                    <p className="text-xs text-gray-500 font-medium">Add meta tags for search engine discoverability</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence mode="popLayout">
                      {selectedTags.map((tag) => (
                        <motion.div
                          key={tag}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <Badge className="bg-premium-navy/5 text-premium-navy border-none h-8 pl-3 pr-1 rounded-xl flex items-center gap-1 group">
                             <span className="font-bold text-xs">{tag}</span>
                             <Button
                               type="button"
                               onClick={() => handleRemoveTag(tag)}
                               variant="ghost"
                               className="h-6 w-6 p-0 rounded-lg hover:bg-premium-navy/10 text-premium-navy/40 hover:text-premium-navy transition-all"
                             >
                                <X className="h-3 w-3" />
                             </Button>
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Add Search Tags</Label>
                    <div className="relative group">
                      <Input
                          type="text"
                          className="pl-10 h-12 bg-gray-50 dark:bg-white/5 border-gray-200/50 dark:border-white/10 rounded-xl text-sm"
                          placeholder="e.g. business, banking..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                      />
                      <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-premium-emerald transition-colors" />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {availableTags
                        .filter((tag) => !selectedTags.includes(tag))
                        .slice(0, 4)
                        .map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className="text-[10px] font-bold text-premium-navy/60 hover:text-premium-navy bg-premium-navy/5 px-2.5 py-1.5 rounded-lg transition-all border border-transparent hover:border-premium-navy/20"
                          >
                            + {tag}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
            </motion.div>
            </div>
        </div>

        {/* Global Action Orchestrator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-gray-100 dark:border-white/10"
        >
            <Button
              type="submit"
              disabled={isUploading}
              className="h-14 px-10 text-lg font-bold bg-premium-navy hover:scale-[1.02] active:scale-[0.98] transition-all rounded-[1.25rem] flex-1 shadow-xl shadow-premium-navy/20"
            >
              {isUploading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synchronizing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>{isEditing ? 'Commit Changes' : 'Publish to Library'}</span>
                  <ChevronRight className="w-5 h-5 ml-1 opacity-50" />
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isUploading}
              className="h-14 px-10 text-lg font-bold border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-[1.25rem] transition-all"
            >
              Dismiss
            </Button>

            {isEditing && onDelete && (
              <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isUploading}
                  className="h-14 px-8 text-lg font-bold bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white dark:bg-red-950/20 dark:border-red-900/50 rounded-[1.25rem] transition-all"
              >
                  Delete Asset
              </Button>
            )}
        </motion.div>
        </motion.form>
    </Form>
  );
}
