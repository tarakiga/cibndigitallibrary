'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Network, History, Anchor } from 'lucide-react';

export default function DemoIndexPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">AMANAH Demo Center</h1>
        <p className="text-xl text-muted-foreground">
          Explore all demo pages and components
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Blockchain Demo Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Blockchain Integration</CardTitle>
                <CardDescription className="text-base">
                  Phase 8 - Certificate Verification
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Explore blockchain components including verification, transaction history,
              network status monitoring, and certificate anchoring.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Certificate Verification</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <History className="h-4 w-4 text-blue-600" />
                <span>Transaction History</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Network className="h-4 w-4 text-purple-600" />
                <span>Network Status Monitoring</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Anchor className="h-4 w-4 text-orange-600" />
                <span>Certificate Anchoring</span>
              </div>
            </div>

            <Link href="/demo/blockchain">
              <Button className="w-full" size="lg">
                View Blockchain Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Placeholder for future demos */}
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="text-2xl">More Demos Coming Soon</CardTitle>
            <CardDescription className="text-base">
              Additional feature demonstrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              More interactive demos and component showcases will be added here
              as new features are developed.
            </p>
            <Button className="w-full" size="lg" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Info */}
      <Card className="mt-8 bg-muted/50">
        <CardHeader>
          <CardTitle>About Demos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Interactive</h3>
              <p className="text-muted-foreground">
                All demos are fully interactive and showcase real component behavior
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Responsive</h3>
              <p className="text-muted-foreground">
                Components adapt to different screen sizes and devices
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Production-Ready</h3>
              <p className="text-muted-foreground">
                All demonstrated components are ready for integration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Help */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Having trouble? Try these direct links:</p>
        <div className="mt-2 space-x-4">
          <a href="/demo/blockchain" className="underline hover:text-primary">
            Direct to Blockchain Demo
          </a>
          <span>•</span>
          <a href="/ms/demo/blockchain" className="underline hover:text-primary">
            With MS Prefix
          </a>
        </div>
      </div>
    </div>
  );
}
