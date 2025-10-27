import React, { useState } from 'react';
import { CreditCard, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface PaymentSettings {
  active_mode: 'test' | 'live';
  test_public_key?: string;
  live_public_key?: string;
  has_test_secret: boolean;
  has_live_secret: boolean;
}

interface PaymentsSectionProps {
  paymentSettings: PaymentSettings;
  onPaymentSettingsChange: (settings: Partial<PaymentSettings>) => void;
  onSave: () => void;
  loading: boolean;
  saving: boolean;
  testSecretInput: string;
  onTestSecretInputChange: (value: string) => void;
  liveSecretInput: string;
  onLiveSecretInputChange: (value: string) => void;
  hasTestSecret: boolean;
  hasLiveSecret: boolean;
}

export function PaymentsSection({
  paymentSettings,
  onPaymentSettingsChange,
  onSave,
  loading,
  saving,
  testSecretInput,
  onTestSecretInputChange,
  liveSecretInput,
  onLiveSecretInputChange,
  hasTestSecret,
  hasLiveSecret,
}: PaymentsSectionProps) {
  const [showTestSecret, setShowTestSecret] = useState(false);
  const [showLiveSecret, setShowLiveSecret] = useState(false);
  const [testSecretSaved, setTestSecretSaved] = useState(false);
  const [liveSecretSaved, setLiveSecretSaved] = useState(false);

  const handleModeChange = (mode: 'test' | 'live') => {
    onPaymentSettingsChange({ active_mode: mode });
  };

  const handleTestPublicKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPaymentSettingsChange({ test_public_key: e.target.value });
  };

  const handleLivePublicKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPaymentSettingsChange({ live_public_key: e.target.value });
  };

  const handleSaveTestSecret = () => {
    // In a real app, you would save the test secret key to your backend
    // For this demo, we'll just simulate a successful save
    setTestSecretSaved(true);
    onPaymentSettingsChange({ has_test_secret: true });
    setTimeout(() => setTestSecretSaved(false), 3000);
  };

  const handleSaveLiveSecret = () => {
    // In a real app, you would save the live secret key to your backend
    // For this demo, we'll just simulate a successful save
    setLiveSecretSaved(true);
    onPaymentSettingsChange({ has_live_secret: true });
    setTimeout(() => setLiveSecretSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Payment Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure your payment gateway settings and API keys
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Test Mode</span>
            <Switch
              id="payment-mode"
              checked={paymentSettings.active_mode === 'live'}
              onCheckedChange={(checked) =>
                handleModeChange(checked ? 'live' : 'test')
              }
              disabled={saving}
            />
            <span className="text-sm font-medium">Live Mode</span>
          </div>
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      <Alert className={cn(
        paymentSettings.active_mode === 'test' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200',
        'border-l-4'
      )}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-medium">
          {paymentSettings.active_mode === 'test' 
            ? 'Test mode is enabled' 
            : 'Live mode is enabled'}
        </AlertTitle>
        <AlertDescription className="text-sm">
          {paymentSettings.active_mode === 'test'
            ? 'All transactions will be processed in test mode. No real payments will be processed.'
            : 'All transactions will be processed as live payments. Use with caution.'}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="test" className="space-y-4">
        <TabsList>
          <TabsTrigger value="test">Test Credentials</TabsTrigger>
          <TabsTrigger value="live">Live Credentials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test API Keys</CardTitle>
              <CardDescription>
                These are your test API keys for development and testing purposes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-public-key">Publishable Key</Label>
                <Input
                  id="test-public-key"
                  value={paymentSettings.test_public_key || ''}
                  onChange={handleTestPublicKeyChange}
                  placeholder="pk_test_..."
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your test publishable API key
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="test-secret-key">Secret Key</Label>
                  {hasTestSecret && (
                    <span className="text-xs text-green-600 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Secret key saved
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="test-secret-key"
                    type={showTestSecret ? 'text' : 'password'}
                    value={testSecretInput}
                    onChange={(e) => onTestSecretInputChange(e.target.value)}
                    placeholder="sk_test_..."
                    disabled={hasTestSecret || saving}
                    className={hasTestSecret ? 'bg-gray-50' : ''}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                    {!hasTestSecret && (
                      <button
                        type="button"
                        onClick={() => setShowTestSecret(!showTestSecret)}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {showTestSecret ? 'Hide' : 'Show'}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasTestSecret
                    ? 'Your test secret key is securely stored.'
                    : 'Your test secret API key. This will be encrypted and stored securely.'}
                </p>
                {!hasTestSecret && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSaveTestSecret}
                      disabled={!testSecretInput || saving}
                    >
                      {testSecretSaved ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Saved
                        </>
                      ) : (
                        'Save Secret Key'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Test Payment</CardTitle>
              <CardDescription>
                Process a test payment to verify your settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Test Payment</h4>
                    <p className="text-sm text-muted-foreground">
                      Process a $1.00 test transaction
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    Process Test Payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="live" className="space-y-4">
          <Card className="border-l-4 border-l-amber-400">
            <CardHeader>
              <CardTitle>Live API Keys</CardTitle>
              <CardDescription className="text-amber-700">
                These are your live API keys. Changes here will affect real transactions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="live-public-key">Publishable Key</Label>
                <Input
                  id="live-public-key"
                  value={paymentSettings.live_public_key || ''}
                  onChange={handleLivePublicKeyChange}
                  placeholder="pk_live_..."
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your live publishable API key
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="live-secret-key">Secret Key</Label>
                  {hasLiveSecret && (
                    <span className="text-xs text-green-600 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Secret key saved
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="live-secret-key"
                    type={showLiveSecret ? 'text' : 'password'}
                    value={liveSecretInput}
                    onChange={(e) => onLiveSecretInputChange(e.target.value)}
                    placeholder="sk_live_..."
                    disabled={hasLiveSecret || saving}
                    className={hasLiveSecret ? 'bg-gray-50' : ''}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                    {!hasLiveSecret && (
                      <button
                        type="button"
                        onClick={() => setShowLiveSecret(!showLiveSecret)}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {showLiveSecret ? 'Hide' : 'Show'}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasLiveSecret
                    ? 'Your live secret key is securely stored.'
                    : 'Your live secret API key. This will be encrypted and stored securely.'}
                </p>
                {!hasLiveSecret && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSaveLiveSecret}
                      disabled={!liveSecretInput || saving}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      {liveSecretSaved ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Saved
                        </>
                      ) : (
                        'Save Secret Key'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription className="text-sm">
              Live mode will process real payments. Ensure your settings are correct before enabling.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PaymentsSection;
