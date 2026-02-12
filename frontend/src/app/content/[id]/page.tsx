'use client'

import { Navbar } from '@/components/layout/navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { useAuth } from '@/contexts/AuthContext'
import { Content, contentService } from '@/lib/api/content'
import { AnimatePresence, motion } from 'framer-motion'
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    Crown,
    Download,
    FileText,
    HardDrive,
    Headphones,
    Heart,
    Lock,
    Maximize,
    Package,
    Pause,
    Play,
    Repeat,
    RotateCw,
    Share2,
    Shield,
    ShoppingCart,
    SkipBack,
    SkipForward,
    Users,
    Video,
    Volume2,
    VolumeX,
    ZoomIn,
    ZoomOut
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

/* ─── helpers ─── */
const typeConfig: Record<string, { icon: typeof FileText; color: string; bg: string; label: string }> = {
  document: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Document' },
  video:    { icon: Video,    color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', label: 'Video' },
  audio:    { icon: Headphones, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Audio' },
  physical: { icon: Package,  color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Physical' },
}

const categoryLabels: Record<string, string> = {
  exam_text: 'Exam Text',
  cibn_publication: 'CIBN Publication',
  research_paper: 'Research Paper',
  stationery: 'Stationery',
  souvenir: 'Souvenir',
  other: 'Other',
}

function formatBytes(bytes?: number) {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDuration(seconds?: number) {
  if (!seconds) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/* ═══════════════════════════════════════════════════
   INLINE VIDEO PLAYER — Premium Cinema-grade
   ═══════════════════════════════════════════════════ */
function InlineVideoPlayer({ fileUrl, title, contentId }: { fileUrl: string; title: string; contentId: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const hideTimer = useRef<NodeJS.Timeout | null>(null)

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setShowControls(true)
    if (isPlaying) hideTimer.current = setTimeout(() => setShowControls(false), 3000)
  }, [isPlaying])

  const togglePlay = async () => {
    if (!videoRef.current) return
    try {
      if (isPlaying) { videoRef.current.pause(); setIsPlaying(false) }
      else { await videoRef.current.play(); setIsPlaying(true) }
    } catch { toast.error('Unable to play video') }
  }

  const handleSeek = (val: number[]) => { if (videoRef.current) { videoRef.current.currentTime = val[0]; setCurrentTime(val[0]) } }
  const handleVolume = (val: number[]) => { setVolume(val[0]); if (videoRef.current) videoRef.current.volume = val[0] / 100; setIsMuted(val[0] === 0) }
  const toggleMute = () => { if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted) } }
  const skip = (s: number) => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + s)) }

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length]
    setPlaybackSpeed(next)
    if (videoRef.current) videoRef.current.playbackRate = next
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) { containerRef.current.requestFullscreen(); setIsFullscreen(true) }
    else { document.exitFullscreen(); setIsFullscreen(false) }
  }

  const handleDownload = async () => {
    try {
      toast.info('Starting download…')
      const res = await fetch(fileUrl); const blob = await res.blob()
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${title}.mp4`
      document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href); document.body.removeChild(a)
      toast.success('Download complete')
    } catch { toast.error('Download failed') }
  }

  if (hasError) return (
    <div className="aspect-video rounded-2xl bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white/70">
        <Video className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="font-medium">Unable to load video</p>
        <p className="text-sm mt-1 text-white/40">The file may be unavailable or in an unsupported format</p>
        <Button variant="outline" size="sm" className="mt-4 text-white border-white/20 hover:bg-white/10" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" /> Download Instead
        </Button>
      </div>
    </div>
  )

  return (
    <div ref={containerRef} className="relative group rounded-2xl overflow-hidden bg-black shadow-2xl" onMouseMove={scheduleHide} onMouseLeave={() => isPlaying && setShowControls(false)}>
      <video
        ref={videoRef}
        src={fileUrl}
        className="w-full aspect-video object-contain bg-black cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
        onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        preload="metadata"
      />

      {/* Big play overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 z-10"
          >
            <motion.div
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl"
            >
              <Play className="w-10 h-10 text-[#002366] ml-1.5" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Controls bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12 z-20"
          >
            {/* Progress */}
            <Slider value={[currentTime]} max={duration || 1} step={0.1} onValueChange={handleSeek} className="mb-3" />
            {/* Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20 h-9 w-9">
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => skip(-10)} className="text-white hover:bg-white/20 h-9 w-9 hidden sm:inline-flex"><SkipBack className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => skip(10)} className="text-white hover:bg-white/20 h-9 w-9 hidden sm:inline-flex"><SkipForward className="h-4 w-4" /></Button>
                <div className="hidden md:flex items-center gap-1.5 ml-1">
                  <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20 h-9 w-9">
                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider value={[volume]} max={100} step={1} onValueChange={handleVolume} className="w-20" />
                </div>
                <span className="text-xs ml-2 text-white/70 tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={changeSpeed} className="text-white hover:bg-white/20 text-xs px-2 h-8">{playbackSpeed}×</Button>
                <Button variant="ghost" size="icon" onClick={handleDownload} className="text-white hover:bg-white/20 h-9 w-9"><Download className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20 h-9 w-9"><Maximize className="h-4 w-4" /></Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   INLINE AUDIO PLAYER — Premium Spotify-inspired
   ═══════════════════════════════════════════════════ */
function InlineAudioPlayer({ fileUrl, title, thumbnailUrl, contentId }: { fileUrl: string; title: string; thumbnailUrl?: string; contentId: number }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isRepeat, setIsRepeat] = useState(false)
  const [hasError, setHasError] = useState(false)

  const togglePlay = async () => {
    if (!audioRef.current) return
    try {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false) }
      else { await audioRef.current.play(); setIsPlaying(true) }
    } catch { toast.error('Unable to play audio') }
  }

  const handleSeek = (val: number[]) => { if (audioRef.current) { audioRef.current.currentTime = val[0]; setCurrentTime(val[0]) } }
  const handleVolume = (val: number[]) => { setVolume(val[0]); if (audioRef.current) audioRef.current.volume = val[0] / 100; setIsMuted(val[0] === 0) }
  const toggleMute = () => { if (audioRef.current) { audioRef.current.muted = !isMuted; setIsMuted(!isMuted) } }
  const skip = (s: number) => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, audioRef.current.currentTime + s)) }

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length]
    setPlaybackSpeed(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }

  const handleEnded = () => {
    if (isRepeat && audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play() }
    else { setIsPlaying(false) }
  }

  const handleDownload = async () => {
    try {
      toast.info('Starting download…')
      const res = await fetch(fileUrl); const blob = await res.blob()
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${title}.mp3`
      document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href); document.body.removeChild(a)
      toast.success('Download complete')
    } catch { toast.error('Download failed') }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (hasError) return (
    <Card className="rounded-2xl overflow-hidden border-gray-100">
      <CardContent className="p-8 text-center">
        <Headphones className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="font-medium text-gray-700">Unable to load audio</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={handleDownload}><Download className="w-4 h-4 mr-2" /> Download Instead</Button>
      </CardContent>
    </Card>
  )

  return (
    <Card className="rounded-2xl overflow-hidden border-gray-100 shadow-xl bg-gradient-to-br from-[#002366] via-[#001a4d] to-[#003380]">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
          {/* Album art */}
          <div className="relative shrink-0">
            <div className={`w-44 h-44 md:w-52 md:h-52 rounded-2xl bg-gradient-to-br from-[#059669] to-[#002366] shadow-2xl flex items-center justify-center overflow-hidden ${isPlaying ? 'animate-pulse-slow' : ''}`}>
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-white">
                  <Headphones className="w-16 h-16 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-medium opacity-60">Audio</p>
                </div>
              )}
            </div>
            {/* Animated ring when playing */}
            {isPlaying && (
              <div className="absolute -inset-2 rounded-2xl border-2 border-[#059669]/40 animate-ping" style={{ animationDuration: '2s' }} />
            )}
          </div>

          {/* Controls area */}
          <div className="flex-1 w-full space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{title}</h3>
              <p className="text-sm text-white/50">Audio • {formatTime(duration)}</p>
            </div>

            {/* Progress bar */}
            <div>
              <Slider value={[currentTime]} max={duration || 1} step={0.1} onValueChange={handleSeek} className="mb-1.5" />
              <div className="flex justify-between text-xs text-white/40 tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => skip(-15)} className="text-white hover:bg-white/10 h-10 w-10"><SkipBack className="h-5 w-5" /></Button>
                <Button size="icon" onClick={togglePlay} className="h-14 w-14 rounded-full bg-white text-[#002366] hover:bg-white/90 shadow-lg transition-transform hover:scale-105">
                  {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => skip(15)} className="text-white hover:bg-white/10 h-10 w-10"><SkipForward className="h-5 w-5" /></Button>
              </div>
              <div className="flex items-center gap-1">
                <div className="hidden sm:flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white/70 hover:bg-white/10 h-9 w-9">
                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider value={[volume]} max={100} step={1} onValueChange={handleVolume} className="w-20" />
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsRepeat(!isRepeat)} className={`h-9 w-9 ${isRepeat ? 'text-[#059669]' : 'text-white/50'} hover:bg-white/10`}>
                  <Repeat className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={changeSpeed} className="text-white/70 hover:bg-white/10 text-xs px-2 h-8">{playbackSpeed}×</Button>
                <Button variant="ghost" size="icon" onClick={handleDownload} className="text-white/70 hover:bg-white/10 h-9 w-9"><Download className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={fileUrl}
          onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
          onEnded={handleEnded}
          onError={() => setHasError(true)}
          preload="metadata"
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}

/* ═══════════════════════════════════════════════════
   INLINE DOCUMENT VIEWER — Premium Reader
   ═══════════════════════════════════════════════════ */
function InlineDocumentViewer({ fileUrl, title, contentId }: { fileUrl: string; title: string; contentId: number }) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const ext = fileUrl.split('.').pop()?.toLowerCase() || ''
  const canPreview = ['pdf', 'txt'].includes(ext)

  const handleDownload = async () => {
    try {
      toast.info('Starting download…')
      await contentService.downloadContent(contentId, `${title}.${ext}`)
      toast.success('Download complete')
    } catch { toast.error('Download failed') }
  }

  if (!canPreview) return (
    <Card className="rounded-2xl overflow-hidden border-gray-100 shadow-lg">
      <CardContent className="p-12 text-center bg-gradient-to-br from-gray-50 to-white">
        <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-2xl flex items-center justify-center">
          <FileText className="w-12 h-12 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Preview Not Available</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          This file type (.{ext}) cannot be previewed in the browser. Download the file to open it in a compatible application.
        </p>
        <Button onClick={handleDownload} className="bg-[#059669] hover:bg-[#047857] text-white h-12 px-8 rounded-xl text-base gap-2">
          <Download className="w-5 h-5" /> Download File
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <Card className="rounded-2xl overflow-hidden border-gray-100 shadow-lg">
      {/* Viewer toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{title}.{ext}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(50, z - 25))} className="h-8 w-8"><ZoomOut className="h-4 w-4" /></Button>
          <span className="text-xs text-gray-500 w-10 text-center tabular-nums">{zoom}%</span>
          <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(200, z + 25))} className="h-8 w-8"><ZoomIn className="h-4 w-4" /></Button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <Button variant="ghost" size="icon" onClick={() => setRotation(r => (r + 90) % 360)} className="h-8 w-8"><RotateCw className="h-4 w-4" /></Button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
        </div>
      </div>

      {/* Document frame */}
      <div className="bg-gray-100 overflow-auto" style={{ height: 'min(70vh, 700px)' }}>
        <div
          className="mx-auto bg-white shadow-sm"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'top center',
            transition: 'transform 0.3s ease',
          }}
        >
          {isLoading && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#059669] mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading document…</p>
              </div>
            </div>
          )}
          <iframe
            src={ext === 'pdf' ? `${fileUrl}#toolbar=1&navpanes=0&scrollbar=1` : fileUrl}
            className="w-full border-0"
            style={{ height: 'min(70vh, 700px)', display: isLoading ? 'none' : 'block' }}
            title={title}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    </Card>
  )
}


/* ═══════════════════════════════════════════════════
   LOCKED CONTENT PREVIEW — Teaser for unpurchased
   ═══════════════════════════════════════════════════ */
function LockedContentPreview({ content, onAddToCart }: { content: Content; onAddToCart: () => void }) {
  const cfg = typeConfig[content.content_type] || typeConfig.document
  const TypeIcon = cfg.icon

  return (
    <Card className="rounded-2xl overflow-hidden border-gray-100 shadow-lg relative">
      <div className="relative">
        {/* Blurred preview background */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 flex items-center justify-center overflow-hidden">
          {content.thumbnail_url ? (
            <img src={content.thumbnail_url} alt="" className="w-full h-full object-cover filter blur-md scale-110 opacity-50" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#002366]/5 to-[#059669]/5" />
          )}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#002366]/10 to-[#059669]/10 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-9 h-9 text-[#002366]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase to Access</h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              {content.content_type === 'video' ? 'Watch this video with our premium player — includes playback speed, fullscreen, and download.' :
               content.content_type === 'audio' ? 'Listen with our premium audio player — speed controls, repeat, and direct download.' :
               'View this document with our reader — zoom, rotate, print, and download.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Badge className={`${cfg.bg} ${cfg.color} border px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5`}>
                <TypeIcon className="w-3.5 h-3.5" />
                {cfg.label}
              </Badge>
              {content.price > 0 && (
                <Badge className="bg-[#002366]/10 text-[#002366] px-3 py-1 rounded-full text-xs font-bold">
                  ₦{content.price.toLocaleString()}
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Card>
  )
}


/* ═══════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════ */
export default function ContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const id = Number(params?.id)

  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPurchased, setIsPurchased] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const isAdmin = user?.role === 'admin'
  const canAccessContent = isAdmin || isPurchased || content?.price === 0

  /* ─ fetch content ─ */
  useEffect(() => {
    if (!id || isNaN(id)) { setError('Invalid content ID'); setLoading(false); return }
    const fetch = async () => {
      try {
        setLoading(true)
        const data = await contentService.getContentById(id)
        setContent(data)
      } catch (err: any) {
        console.warn('Error fetching content detail:', err)
        setError('Content not found or unavailable.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  /* ─ check purchased & cart state ─ */
  useEffect(() => {
    if (!id) return
    try {
      const rawP = sessionStorage.getItem('purchasedContent')
      if (rawP) { const p = JSON.parse(rawP); setIsPurchased(Array.isArray(p) && p.some((x: any) => x.id === id)) }
      const rawC = localStorage.getItem('cart_items')
      if (rawC) { const c = JSON.parse(rawC); setIsInCart(Array.isArray(c) && c.some((x: any) => x.id === id)) }
      const rawF = localStorage.getItem('library_favorites')
      if (rawF) { const f = JSON.parse(rawF); setIsFavorite(Array.isArray(f) && f.includes(id)) }
    } catch {}

    const syncCart = () => {
      try { const c = JSON.parse(localStorage.getItem('cart_items') || '[]'); setIsInCart(Array.isArray(c) && c.some((x: any) => x.id === id)) } catch {}
    }
    window.addEventListener('cart:changed', syncCart)
    return () => window.removeEventListener('cart:changed', syncCart)
  }, [id])

  /* ─ actions ─ */
  const handleAddToCart = () => {
    if (!content) return
    try {
      const cart = JSON.parse(localStorage.getItem('cart_items') || '[]')
      if (cart.some((c: any) => c.id === content.id)) { toast.info('Already in cart'); return }
      cart.push({ id: content.id, title: content.title, price: content.price, quantity: 1 })
      localStorage.setItem('cart_items', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart:changed'))
      setIsInCart(true)
      toast.success('Added to cart!')
    } catch { toast.error('Failed to add to cart') }
  }

  const toggleFavorite = () => {
    try {
      let favs: number[] = JSON.parse(localStorage.getItem('library_favorites') || '[]')
      if (favs.includes(id)) { favs = favs.filter(f => f !== id); setIsFavorite(false); toast.success('Removed from favorites') }
      else { favs.push(id); setIsFavorite(true); toast.success('Added to favorites') }
      localStorage.setItem('library_favorites', JSON.stringify(favs))
    } catch {}
  }

  /* ─ derived ─ */
  const cfg = content ? (typeConfig[content.content_type] || typeConfig.document) : typeConfig.document
  const TypeIcon = cfg.icon
  const isOutOfStock = content?.content_type === 'physical' && content?.stock_quantity === 0

  /* ─── loading state ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50"><Navbar />
        <div className="container mx-auto px-4 pt-28 pb-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#059669] mx-auto mb-4" />
              <p className="text-gray-600">Loading content…</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ─── error / not found ─── */
  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50"><Navbar />
        <div className="container mx-auto px-4 pt-28 pb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-sm border p-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The content you are looking for does not exist.'}</p>
              <Button onClick={() => router.push('/library')}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Library</Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  /* ─── main render ─── */
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002366]/95 via-[#002366]/85 to-[#059669]/80" />
        {content.thumbnail_url && (
          <div className="absolute inset-0 opacity-15">
            <img src={content.thumbnail_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="container mx-auto px-4 relative py-12 lg:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
              <Link href="/library" className="hover:text-white transition-colors">Library</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white/90 capitalize">{content.content_type}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white truncate max-w-[200px]">{content.title}</span>
            </nav>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className={`${cfg.bg} ${cfg.color} border px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5`}>
                <TypeIcon className="w-3.5 h-3.5" />
                {cfg.label}
              </Badge>
              {content.category && (
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-3 py-1 rounded-full text-xs">
                  {categoryLabels[content.category] || content.category}
                </Badge>
              )}
              {content.is_exclusive && (
                <Badge className="bg-[#FFD700] text-[#002366] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Exclusive
                </Badge>
              )}
              {canAccessContent && (
                <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {isAdmin ? 'Admin Access' : 'Purchased'}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 max-w-3xl">{content.title}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-5 text-white/70 text-sm">
              {content.purchase_count !== undefined && (
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {content.purchase_count} purchased</span>
              )}
              {formatDuration(content.duration) && (
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDuration(content.duration)}</span>
              )}
              {formatBytes(content.file_size) && (
                <span className="flex items-center gap-1.5"><HardDrive className="w-4 h-4" /> {formatBytes(content.file_size)}</span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(content.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="container mx-auto px-4 -mt-6 pb-16 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main column */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* ═══ INLINE PLAYER / VIEWER ═══ */}
            {content.content_type !== 'physical' && (
              <div>
                {canAccessContent && content.file_url ? (
                  <>
                    {content.content_type === 'video' && (
                      <InlineVideoPlayer fileUrl={content.file_url} title={content.title} contentId={content.id} />
                    )}
                    {content.content_type === 'audio' && (
                      <InlineAudioPlayer fileUrl={content.file_url} title={content.title} thumbnailUrl={content.thumbnail_url} contentId={content.id} />
                    )}
                    {content.content_type === 'document' && (
                      <InlineDocumentViewer fileUrl={content.file_url} title={content.title} contentId={content.id} />
                    )}
                  </>
                ) : (
                  <LockedContentPreview content={content} onAddToCart={handleAddToCart} />
                )}
              </div>
            )}

            {/* Description */}
            <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#059669]" />
                  About this Resource
                </h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
                  {content.description ? (
                    content.description.split('\n').map((para, i) => (
                      <p key={i} className="mb-3">{para}</p>
                    ))
                  ) : (
                    <p className="italic text-gray-400">No description available for this content.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Details grid */}
            <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#059669]" />
                  Content Details
                </h2>
                <div className="grid sm:grid-cols-2 gap-y-5 gap-x-10">
                  <Detail label="Content Type" value={cfg.label} />
                  {content.category && <Detail label="Category" value={categoryLabels[content.category] || content.category} />}
                  {formatBytes(content.file_size) && <Detail label="File Size" value={formatBytes(content.file_size)!} />}
                  {formatDuration(content.duration) && <Detail label="Duration" value={formatDuration(content.duration)!} />}
                  {content.purchase_count !== undefined && <Detail label="Total Purchases" value={String(content.purchase_count)} />}
                  <Detail label="Published" value={new Date(content.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
                  {content.content_type === 'physical' && content.stock_quantity !== undefined && (
                    <Detail label="Stock" value={content.stock_quantity > 0 ? `${content.stock_quantity} available` : 'Out of stock'} />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Pricing card */}
            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
              <CardContent className="p-6 space-y-5">
                {/* Price — hidden for admins */}
                {!isAdmin && (
                  <div className="text-center">
                    <p className="text-4xl font-extrabold text-[#002366]">
                      {content.price === 0 ? 'Free' : `₦${content.price.toLocaleString()}`}
                    </p>
                  </div>
                )}

                {/* CTA */}
                {isAdmin ? (
                  <div className="space-y-3">
                    <Badge className="w-full justify-center bg-[#002366]/10 text-[#002366] py-2 rounded-xl text-sm font-medium">
                      <Shield className="w-4 h-4 mr-2" /> Admin Access
                    </Badge>
                    {content.content_type !== 'physical' && content.file_url && (
                      <Button
                        className="w-full gap-2 bg-[#002366] hover:bg-[#001a4d] text-white h-12 text-base rounded-xl"
                        onClick={async () => {
                          try {
                            toast.info('Starting download…')
                            const res = await fetch(content.file_url!); const blob = await res.blob()
                            const ext = content.content_type === 'video' ? 'mp4' : content.content_type === 'audio' ? 'mp3' : 'pdf'
                            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${content.title}.${ext}`
                            document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href); document.body.removeChild(a)
                            toast.success('Download complete')
                          } catch { toast.error('Download failed') }
                        }}
                      >
                        <Download className="w-5 h-5" /> Download File
                      </Button>
                    )}
                  </div>
                ) : isPurchased ? (
                  <div className="space-y-3">
                    <Button
                      className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base rounded-xl"
                      onClick={() => router.push('/my-library')}
                    >
                      <CheckCircle className="w-5 h-5" /> Go to My Library
                    </Button>
                    {content.file_url && content.content_type !== 'physical' && (
                      <Button
                        variant="outline"
                        className="w-full gap-2 h-11 text-base rounded-xl border-gray-200"
                        onClick={async () => {
                          try {
                            toast.info('Starting download…')
                            const res = await fetch(content.file_url!); const blob = await res.blob()
                            const ext = content.content_type === 'video' ? 'mp4' : content.content_type === 'audio' ? 'mp3' : 'pdf'
                            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${content.title}.${ext}`
                            document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href); document.body.removeChild(a)
                            toast.success('Download complete')
                          } catch { toast.error('Download failed') }
                        }}
                      >
                        <Download className="w-5 h-5" /> Download
                      </Button>
                    )}
                  </div>
                ) : isInCart ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2 h-12 text-base rounded-xl border-[#059669] text-[#059669]"
                    onClick={() => toast.info('Item is already in your cart')}
                  >
                    <ShoppingCart className="w-5 h-5" /> Already in Cart
                  </Button>
                ) : (
                  <Button
                    className="w-full gap-2 bg-[#059669] hover:bg-[#047857] text-white h-12 text-base rounded-xl"
                    disabled={content.is_exclusive || isOutOfStock}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isOutOfStock ? 'Out of Stock' : content.is_exclusive ? 'Exclusive Content' : content.price === 0 ? 'Get for Free' : 'Add to Cart'}
                  </Button>
                )}

                {/* Quick actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-1.5 text-sm" onClick={toggleFavorite}>
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFavorite ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5 text-sm"
                    onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </div>

                {/* Trust signals */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Instant access after purchase</span>
                  </div>
                  {content.content_type !== 'physical' && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Download className="w-4 h-4 text-emerald-500" />
                      <span>Download for offline access</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Back link */}
            <Button
              variant="ghost"
              className="w-full gap-2 text-gray-500 hover:text-gray-700"
              onClick={() => router.push('/library')}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Library
            </Button>
          </motion.aside>
        </div>
      </section>
    </div>
  )
}

/* ─── small detail row component ─── */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</dt>
      <dd className="text-sm font-medium text-gray-800">{value}</dd>
    </div>
  )
}
