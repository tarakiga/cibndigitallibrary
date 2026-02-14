'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminSettingsApi, type UploadSettingsResponse } from '@/lib/api/admin';
import { AlertTriangle, FileText, Image as ImageIcon, Loader2, Music, Save, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function UploadSettingsSection() {
  const [settings, setSettings] = useState<UploadSettingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to convert bytes to MB
  const bytesToMB = (bytes: number | null) => {
    if (bytes === null) return '';
    return (bytes / (1024 * 1024)).toFixed(0);
  };

  // Helper to convert MB to bytes
  const mbToBytes = (mb: string) => {
    if (!mb) return null;
    return parseInt(mb) * 1024 * 1024;
  };

  const [documentSize, setDocumentSize] = useState('');
  const [videoSize, setVideoSize] = useState('');
  const [audioSize, setAudioSize] = useState('');
  const [imageSize, setImageSize] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await adminSettingsApi.getUploadSettings();
      setSettings(data);
      setDocumentSize(bytesToMB(data.max_file_size_document));
      setVideoSize(bytesToMB(data.max_file_size_video));
      setAudioSize(bytesToMB(data.max_file_size_audio));
      setImageSize(bytesToMB(data.max_file_size_image));
    } catch (error) {
      console.error('Failed to fetch upload settings:', error);
      toast.error('Failed to load upload settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const payload = {
        max_file_size_document: mbToBytes(documentSize),
        max_file_size_video: mbToBytes(videoSize),
        max_file_size_audio: mbToBytes(audioSize),
        max_file_size_image: mbToBytes(imageSize),
      };

      const updated = await adminSettingsApi.updateUploadSettings(payload);
      setSettings(updated);
      toast.success('Upload settings saved successfully');
    } catch (error) {
      console.error('Failed to save upload settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Upload Settings</h2>
          <p className="text-muted-foreground">
            Configure default and maximum file sizes for different content types.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Documents
            </CardTitle>
            <CardDescription>PDFs, Docx, Text files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc-size">Max File Size (MB)</Label>
              <Input 
                id="doc-size" 
                type="number" 
                placeholder="e.g. 500" 
                value={documentSize}
                onChange={(e) => setDocumentSize(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Set to 0 or leave empty for unlimited (not recommended). 
                Default: 500 MB.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-purple-500" />
              Videos
            </CardTitle>
            <CardDescription>MP4, WebM, MOV</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-size">Max File Size (MB)</Label>
              <Input 
                id="video-size" 
                type="number" 
                placeholder="e.g. 2048" 
                value={videoSize}
                onChange={(e) => setVideoSize(e.target.value)}
              />
               <p className="text-xs text-muted-foreground">
                Leave empty for unlimited. Large videos may take time to process.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-pink-500" />
              Audio
            </CardTitle>
            <CardDescription>MP3, WAV, OGG</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audio-size">Max File Size (MB)</Label>
              <Input 
                id="audio-size" 
                type="number" 
                placeholder="e.g. 100" 
                value={audioSize}
                onChange={(e) => setAudioSize(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-green-500" />
              Images
            </CardTitle>
            <CardDescription>Thumbnails, Cover Art</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-size">Max File Size (MB)</Label>
              <Input 
                id="image-size" 
                type="number" 
                placeholder="e.g. 10" 
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
              />
               <p className="text-xs text-muted-foreground">
                Recommended: 10 MB or less for faster loading.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Important Note on Server Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-800">
            These settings control the application validation logic. 
            However, your web server (Nginx/Apache) or load balancer (Cloudflare) 
            may have its own strict limits (e.g., <code>client_max_body_size</code>). 
            Updates here will not override server-level configurations.
            If uploads fail immediately, check your server documentation or ask the DevOps team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
