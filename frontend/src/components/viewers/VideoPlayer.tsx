'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  X, Play, Pause, Volume2, VolumeX, Maximize, Settings, 
  SkipBack, SkipForward, Download 
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { progressService } from '@/lib/api/progress'

interface VideoPlayerProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  title: string
  contentId: number
  duration?: number
}

export function VideoPlayer({ isOpen, onClose, fileUrl, title, contentId, duration }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(duration || 0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  // Save progress to database
  useEffect(() => {
    if (currentTime > 0 && totalDuration > 0) {
      const progressPercentage = (currentTime / totalDuration) * 100
      const isCompleted = progressPercentage >= 95
      
      // Debounce: save every 2 seconds
      const timer = setTimeout(() => {
        progressService.saveProgress({
          content_id: contentId,
          playback_position: currentTime,
          total_duration: totalDuration,
          progress_percentage: progressPercentage,
          is_completed: isCompleted
        }).catch(error => {
          // Silently fail - progress feature might not be available yet
          if (process.env.NODE_ENV === 'development') {
            console.warn('Progress saving failed:', error.response?.status)
          }
        })
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [currentTime, contentId, totalDuration])

  // Load saved progress from database
  useEffect(() => {
    if (isOpen) {
      progressService.getProgress(contentId)
        .then(progress => {
          if (progress && progress.playback_position > 0 && videoRef.current) {
            videoRef.current.currentTime = progress.playback_position
          }
        })
        .catch(error => {
          // Silently fail - progress feature might not be available yet
          if (process.env.NODE_ENV === 'development') {
            console.warn('Progress tracking not available:', error.response?.status)
          }
        })
    }
  }, [isOpen, contentId])

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause()
          setIsPlaying(false)
          // Save progress immediately on pause
          saveProgressNow()
        } else {
          await videoRef.current.play()
          setIsPlaying(true)
        }
      } catch (error) {
        console.error('Error playing video:', error)
        toast.error('Unable to play video. The file may be unavailable or in an unsupported format.')
        setIsPlaying(false)
      }
    }
  }

  // Save progress immediately
  const saveProgressNow = () => {
    if (currentTime > 0 && totalDuration > 0) {
      const progressPercentage = (currentTime / totalDuration) * 100
      const isCompleted = progressPercentage >= 95
      
      progressService.saveProgress({
        content_id: contentId,
        playback_position: currentTime,
        total_duration: totalDuration,
        progress_percentage: progressPercentage,
        is_completed: isCompleted
      }).catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Progress saving failed:', error.response?.status)
        }
      })
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setTotalDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0]
    setVolume(vol)
    if (videoRef.current) {
      videoRef.current.volume = vol / 100
    }
    setIsMuted(vol === 0)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds))
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const changePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    setPlaybackSpeed(nextSpeed)
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Video downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download video')
    }
  }

  // Validate fileUrl
  useEffect(() => {
    if (isOpen && !fileUrl) {
      toast.error('Video file is not available')
      onClose()
    }
  }, [isOpen, fileUrl, onClose])

  const handleError = () => {
    toast.error('Failed to load video. The file may be unavailable or in an unsupported format.')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-full h-[98vh] p-0 overflow-hidden bg-black flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gray-900/95 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-white truncate pr-4">
              {title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleDownload} className="text-white hover:bg-gray-800">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-gray-800">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Video Container */}
        <div 
          className="relative flex-1 bg-black flex items-center justify-center min-h-0"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(isPlaying ? false : true)}
          onMouseMove={() => {
            setShowControls(true)
            // Auto-hide controls after 3s of inactivity when playing
            if (isPlaying) {
              setTimeout(() => setShowControls(false), 3000)
            }
          }}
        >
          <video
            ref={videoRef}
            src={fileUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleError}
            onClick={togglePlay}
            preload="metadata"
          />

          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
            >
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-[#002366] ml-2" />
              </div>
            </button>
          )}

          {/* Custom Controls */}
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 md:p-6 pb-4 md:pb-6">
              {/* Progress Bar */}
              <Slider
                value={[currentTime]}
                max={totalDuration}
                step={1}
                onValueChange={handleSeek}
                className="mb-4"
              />

              {/* Control Buttons */}
              <div className="flex items-center justify-between text-white flex-wrap gap-2">
                <div className="flex items-center gap-2 md:gap-4">
                  {/* Play/Pause */}
                  <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  {/* Skip Buttons */}
                  <Button variant="ghost" size="icon" onClick={() => skip(-10)} className="text-white hover:bg-white/20">
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => skip(10)} className="text-white hover:bg-white/20">
                    <SkipForward className="h-5 w-5" />
                  </Button>

                  {/* Volume - Hidden on mobile */}
                  <div className="hidden md:flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
                      {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <Slider
                      value={[volume]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="w-20 lg:w-24"
                    />
                  </div>

                  {/* Mobile Volume Toggle */}
                  <Button variant="ghost" size="icon" onClick={toggleMute} className="md:hidden text-white hover:bg-white/20">
                    {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>

                  {/* Time */}
                  <span className="text-xs md:text-sm whitespace-nowrap">
                    {formatTime(currentTime)} / {formatTime(totalDuration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Playback Speed */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={changePlaybackSpeed}
                    className="text-white hover:bg-white/20"
                  >
                    {playbackSpeed}x
                  </Button>

                  {/* Fullscreen */}
                  <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                    <Maximize className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
