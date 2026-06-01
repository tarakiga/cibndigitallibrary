import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'

export default function UploadConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  progress,
  isUploading,
  fileName,
  fileType,
  fileSize,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  progress: number
  isUploading: boolean
  fileName: string
  fileType: 'image' | 'document' | 'video' | 'audio'
  fileSize: string
}) {
  const [isConfirmed, setIsConfirmed] = useState(false)

  const handleConfirm = async () => {
    try {
      await onConfirm()
      setIsConfirmed(true)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {isConfirmed ? 'Upload Complete!' : 'Confirm Upload'}
                </Dialog.Title>
                
                <div className="mt-4">
                  {isConfirmed ? (
                    <div className="text-green-600">
                      <p>Your file has been uploaded successfully!</p>
                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                          onClick={onClose}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">
                          You are about to upload the following {fileType}:
                        </p>
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <p className="font-medium">{fileName}</p>
                          <p className="text-xs text-gray-500">Size: {fileSize}</p>
                        </div>
                      </div>

                      {isUploading && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 text-right">{Math.round(progress)}%</p>
                        </div>
                      )}

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={onClose}
                          disabled={isUploading}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleConfirm}
                          disabled={isUploading}
                        >
                          {isUploading ? 'Uploading...' : 'Confirm Upload'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
