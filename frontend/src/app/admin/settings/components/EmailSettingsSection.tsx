'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { adminSettingsApi, EmailSettingsResponse, EmailSettingsUpdate } from '@/lib/api/admin';
import { AlertCircle, Check, Eye, EyeOff, Loader2, Mail, Send, Server } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface EmailSettingsSectionProps {
  className?: string;
}

export function EmailSettingsSection({ className }: EmailSettingsSectionProps) {
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  // Form state
  const [settings, setSettings] = useState<EmailSettingsResponse>({
    smtp_host: null,
    smtp_port: 587,
    smtp_user: null,
    has_password: false,
    smtp_tls: true,
    emails_from_email: null,
    emails_from_name: 'CIBN Digital Library',
  });
  const [passwordInput, setPasswordInput] = useState('');

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await adminSettingsApi.getEmailSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load email settings:', error);
        toast.error('Failed to load email settings');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Handle form changes
  const handleChange = (field: keyof EmailSettingsUpdate, value: string | number | boolean | null) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Save settings
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload: EmailSettingsUpdate = {
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_user: settings.smtp_user,
        smtp_tls: settings.smtp_tls,
        emails_from_email: settings.emails_from_email,
        emails_from_name: settings.emails_from_name,
      };
      
      // Only include password if user entered one
      if (passwordInput.trim()) {
        payload.smtp_password = passwordInput.trim();
      }
      
      const updatedSettings = await adminSettingsApi.updateEmailSettings(payload);
      setSettings(updatedSettings);
      setPasswordInput(''); // Clear password field after save
      toast.success('Email settings saved successfully');
    } catch (error: any) {
      console.error('Failed to save email settings:', error);
      toast.error(error?.response?.data?.detail || 'Failed to save email settings');
    } finally {
      setSaving(false);
    }
  }, [settings, passwordInput]);

  // Send test email
  const handleTestEmail = useCallback(async () => {
    if (!testEmail.trim()) {
      toast.error('Please enter a test email address');
      return;
    }
    
    setTesting(true);
    try {
      const result = await adminSettingsApi.testEmailSettings(testEmail.trim());
      if (result.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Test email failed');
      }
    } catch (error: any) {
      console.error('Test email failed:', error);
      toast.error(error?.response?.data?.detail || 'Failed to send test email');
    } finally {
      setTesting(false);
    }
  }, [testEmail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Email Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure Microsoft 365 or custom SMTP settings for system emails
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Status Alert */}
      <Alert className={settings.has_password 
        ? 'bg-green-50 border-green-200 border-l-4 border-l-green-500' 
        : 'bg-amber-50 border-amber-200 border-l-4 border-l-amber-500'
      }>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-medium">
          {settings.has_password ? 'Email configured' : 'Configuration required'}
        </AlertTitle>
        <AlertDescription className="text-sm">
          {settings.has_password
            ? 'SMTP credentials are configured. The system can send emails.'
            : 'Please configure your SMTP settings to enable email functionality.'}
        </AlertDescription>
      </Alert>

      {/* SMTP Server Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            SMTP Server
          </CardTitle>
          <CardDescription>
            For Microsoft 365, use: smtp.office365.com, Port 587, TLS enabled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                value={settings.smtp_host || ''}
                onChange={(e) => handleChange('smtp_host', e.target.value)}
                placeholder="smtp.office365.com"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your email server hostname
              </p>
            </div>
            
            <div>
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                type="number"
                value={settings.smtp_port}
                onChange={(e) => handleChange('smtp_port', parseInt(e.target.value) || 587)}
                placeholder="587"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Common ports: 587 (TLS), 465 (SSL), 25
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 py-2">
            <Switch
              id="smtp-tls"
              checked={settings.smtp_tls}
              onCheckedChange={(checked) => handleChange('smtp_tls', checked)}
              disabled={saving}
            />
            <div>
              <Label htmlFor="smtp-tls" className="font-medium">Enable TLS</Label>
              <p className="text-xs text-muted-foreground">
                Use STARTTLS for secure connection (recommended for port 587)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            Your email account credentials for SMTP authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="smtp-user">Username / Email</Label>
            <Input
              id="smtp-user"
              type="email"
              value={settings.smtp_user || ''}
              onChange={(e) => handleChange('smtp_user', e.target.value)}
              placeholder="noreply@yourcompany.com"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground mt-1">
              For Microsoft 365, use your full email address
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="smtp-password">Password / App Password</Label>
              {settings.has_password && (
                <span className="text-xs text-green-600 flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Password configured
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                id="smtp-password"
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={settings.has_password ? '••••••••••••' : 'Enter password or app password'}
                disabled={saving}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {settings.has_password 
                ? 'Leave empty to keep existing password, or enter new value to update'
                : 'For Microsoft 365 with MFA, generate an app password in your account settings'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sender Identity */}
      <Card>
        <CardHeader>
          <CardTitle>Sender Identity</CardTitle>
          <CardDescription>
            How recipients will see your emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from-email">From Email</Label>
              <Input
                id="from-email"
                type="email"
                value={settings.emails_from_email || ''}
                onChange={(e) => handleChange('emails_from_email', e.target.value)}
                placeholder="noreply@cibng.org"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Sender email address shown to recipients
              </p>
            </div>
            
            <div>
              <Label htmlFor="from-name">From Name</Label>
              <Input
                id="from-name"
                value={settings.emails_from_name || ''}
                onChange={(e) => handleChange('emails_from_name', e.target.value)}
                placeholder="CIBN Digital Library"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Display name shown to recipients
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Configuration
          </CardTitle>
          <CardDescription>
            Send a test email to verify your settings are working
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              disabled={testing || !settings.has_password}
              className="flex-1"
            />
            <Button 
              onClick={handleTestEmail} 
              disabled={testing || !settings.has_password || !testEmail.trim()}
              variant="outline"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test
                </>
              )}
            </Button>
          </div>
          {!settings.has_password && (
            <p className="text-xs text-amber-600 mt-2">
              Save your SMTP password first to enable testing
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EmailSettingsSection;
