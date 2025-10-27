'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, 
  Printer, Search, Bookmark, RotateCw, FileText, AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { contentService } from '@/lib/api/content'

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  title: string
  contentId: number
}

export function DocumentViewer({ isOpen, onClose, fileUrl, title, contentId }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [fileExtension, setFileExtension] = useState('')
  const [canDisplay, setCanDisplay] = useState(true)

  useEffect(() => {
    if (isOpen) {
      if (!fileUrl) {
        toast.error('Document file is not available')
        onClose()
        return
      }
      
      // Get file extension
      const ext = fileUrl.split('.').pop()?.toLowerCase() || ''
      setFileExtension(ext)
      
      // Check if file can be displayed in browser
      const displayableTypes = ['pdf', 'txt']
      setCanDisplay(displayableTypes.includes(ext))
      
      setIsLoading(true)
      // Simulate loading
      setTimeout(() => setIsLoading(false), 1000)
    }
  }, [isOpen, fileUrl, onClose])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = async () => {
    try {
      toast.info('Starting download...')
      
      // Use contentService download method
      await contentService.downloadContent(contentId, `${title}.${fileExtension}`)
      
      toast.success('Document downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download document. Please try again.')
    }
  }

  const handlePrint = () => {
    window.print()
    toast.info('Opening print dialog...')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-4 md:px-6 py-3 md:py-4 border-b bg-white shrink-0">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-base md:text-lg font-semibold text-gray-900 truncate flex-1 min-w-0">
              {title}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3 border-b bg-gray-50 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2">
            {/* Page Navigation */}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[100px] text-center">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {zoom}%
            </span>
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>

            {/* Rotate */}
            <Button variant="outline" size="icon" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>

            {/* Actions */}
            <div className="border-l pl-2 ml-2 flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleDownload} className="whitespace-nowrap">
                <Download className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Download</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="whitespace-nowrap">
                <Printer className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Print</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 overflow-auto bg-gray-100 p-3 md:p-6 min-h-0">
          <div 
            className="max-w-4xl mx-auto bg-white shadow-lg"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
              transition: 'transform 0.3s ease'
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-[800px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#059669] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading document...</p>
                </div>
              </div>
            ) : !canDisplay ? (
              <div className="flex items-center justify-center h-[800px]">
                <div className="text-center max-w-md">
                  <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Preview Not Available</h3>
                  <p className="text-gray-600 mb-6">
                    This file type (.{fileExtension}) cannot be previewed in the browser.
                    Please download the file to view it.
                  </p>
                  <Button onClick={handleDownload} className="bg-[#059669] hover:bg-[#048558]">
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                </div>
              </div>
            ) : (
              <iframe
                src={fileExtension === 'pdf' ? `${fileUrl}#toolbar=1&navpanes=0&scrollbar=1` : fileUrl}
                className="w-full min-h-[600px] h-full border-0"
                title={title}
                style={{ minHeight: '70vh' }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
