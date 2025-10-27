'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, SlidersHorizontal, X, Plus, Trash2, Archive } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface AdminLibraryToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  selectedCount: number
  totalCount: number
  onBulkDelete?: () => void
  onBulkArchive?: () => void
  onAddNew: () => void
  onSelectAll?: () => void
  onDeselectAll?: () => void
  activeFilters?: {
    type?: string[]
    category?: string[]
    status?: string[]
  }
  onFilterChange?: (filters: any) => void
}

export function AdminLibraryToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedCount,
  totalCount,
  onBulkDelete,
  onBulkArchive,
  onAddNew,
  onSelectAll,
  onDeselectAll,
  activeFilters,
  onFilterChange,
}: AdminLibraryToolbarProps) {
  const hasActiveFilters = activeFilters && (
    (activeFilters.type && activeFilters.type.length > 0) ||
    (activeFilters.category && activeFilters.category.length > 0) ||
    (activeFilters.status && activeFilters.status.length > 0)
  )

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar (shows when items selected) */}
      {selectedCount > 0 && (
        <div className="bg-gradient-to-r from-[#002366] to-[#059669] text-white rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-white text-[#002366] hover:bg-white font-semibold">
              {selectedCount} selected
            </Badge>
            <span className="text-sm">Bulk actions available</span>
          </div>
          <div className="flex items-center gap-2">
            {onBulkArchive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBulkArchive}
                className="text-white hover:bg-white/20"
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            )}
            {onBulkDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBulkDelete}
                className="text-white hover:bg-white/20"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Left Side: Search & Filters */}
          <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10 h-10 border-gray-300 focus:border-[#059669] focus:ring-[#059669]"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters Dropdown */}
            {onFilterChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="default" className="h-10 relative">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge className="ml-2 bg-[#059669] text-white hover:bg-[#059669] h-5 w-5 p-0 flex items-center justify-center rounded-full">
                        {(activeFilters.type?.length || 0) + 
                         (activeFilters.category?.length || 0) + 
                         (activeFilters.status?.length || 0)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Content Type</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem>Documents</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Videos</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Audio</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Physical</DropdownMenuCheckboxItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem>Active</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuLabel>Access</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem>Public</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Exclusive</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Right Side: Sort & Add Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Sort */}
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[180px] h-10 border-gray-300">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title: A-Z</SelectItem>
                <SelectItem value="title-desc">Title: Z-A</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Add New Button */}
            <Button
              onClick={onAddNew}
              className="bg-gradient-to-r from-[#002366] to-[#059669] hover:opacity-90 text-white h-10 px-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Content
            </Button>
          </div>
        </div>

        {/* Results Count & Select All */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>
              Showing <span className="font-semibold text-gray-900">{totalCount}</span> content items
            </span>
            {onSelectAll && onDeselectAll && totalCount > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedCount === totalCount && totalCount > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSelectAll()
                    } else {
                      onDeselectAll()
                    }
                  }}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium text-gray-700 cursor-pointer hover:text-[#059669]"
                >
                  Select all
                </label>
              </div>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange?.({})}
              className="text-[#059669] hover:text-[#059669] hover:bg-[#059669]/10"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
