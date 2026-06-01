'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  X, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, 
  Download, Repeat, Shuffle 
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { progressService } from '@/lib/api/progress'

interface AudioPlayerProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  title: string
  contentId: number
  duration?: number
  author?: string
}

export function AudioPlayer({ 
  isOpen, 
  onClose, 
  fileUrl, 
  title, 
  contentId, 
  duration,
  author 
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(duration || 0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isRepeat, setIsRepeat] = useState(false)

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
          if (progress && progress.playback_position > 0 && audioRef.current) {
            audioRef.current.currentTime = progress.playback_position
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
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
          // Save progress immediately on pause
          saveProgressNow()
        } else {
          await audioRef.current.play()
          setIsPlaying(true)
        }
      } catch (error) {
        console.error('Error playing audio:', error)
        toast.error('Unable to play audio. The file may be unavailable or in an unsupported format.')
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
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTotalDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    } else {
      setIsPlaying(false)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0]
    setVolume(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol / 100
    }
    setIsMuted(vol === 0)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, audioRef.current.currentTime + seconds))
    }
  }

  const changePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    setPlaybackSpeed(nextSpeed)
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed
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
      a.download = `${title}.mp3`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Audio downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download audio')
    }
  }

  const progressPercent = (currentTime / totalDuration) * 100 || 0

  // Validate fileUrl
  useEffect(() => {
    if (isOpen && !fileUrl) {
      toast.error('Audio file is not available')
      onClose()
    }
  }, [isOpen, fileUrl, onClose])

  const handleError = () => {
    toast.error('Failed to load audio. The file may be unavailable or in an unsupported format.')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900 truncate pr-4">
              Audio Player
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Player Content */}
        <div className="p-8 bg-gradient-to-br from-[#002366]/5 to-[#059669]/5">
          {/* Album Art / Visualization */}
          <div className="mb-8">
            <div className="w-64 h-64 mx-auto bg-gradient-to-br from-[#002366] to-[#059669] rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden">
              {/* Animated circles for playing state */}
              {isPlaying && (
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute inset-4 bg-white/10 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                </div>
              )}
              
              <div className="relative z-10 text-center text-white">
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="font-bold text-xl mb-1 px-4">{title}</h3>
                {author && <p className="text-sm text-white/80">{author}</p>}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Slider
              value={[currentTime]}
              max={totalDuration}
              step={1}
              onValueChange={handleSeek}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => skip(-15)}
              className="h-12 w-12"
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              onClick={togglePlay}
              className="h-16 w-16 rounded-full bg-gradient-to-r from-[#002366] to-[#059669] hover:opacity-90 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="h-7 w-7 text-white" />
              ) : (
                <Play className="h-7 w-7 text-white ml-1" />
              )}
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => skip(15)}
              className="h-12 w-12"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-between">
            {/* Volume Control */}
            <div className="flex items-center gap-2 flex-1">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="flex-shrink-0">
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>

            {/* Playback Options */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRepeat(!isRepeat)}
                className={isRepeat ? 'text-[#059669]' : ''}
              >
                <Repeat className="h-5 w-5" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={changePlaybackSpeed}
              >
                {playbackSpeed}x
              </Button>

              <Button variant="ghost" size="icon" onClick={handleDownload}>
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={fileUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onError={handleError}
            className="hidden"
            preload="metadata"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
