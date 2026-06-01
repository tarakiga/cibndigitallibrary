
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ChartBar, CreditCard, FileText, Mail, TriangleAlert } from "lucide-react";

export default function AdminUserGuide() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin & Developer Guide</h2>
        <p className="text-muted-foreground">
          Comprehensive documentation for managing the CIBN Digital Library platform.
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted/50 p-1">
          <TabsTrigger value="dashboard">Dashboard & ROI</TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar className="h-5 w-5 text-blue-600" />
                Dashboard Overview
              </CardTitle>
              <CardDescription>
                Understanding your analytics and key performance indicators.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <h3 className="font-semibold text-blue-900 mb-2">Key Metrics</h3>
                  <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                    <li><strong>Total Revenue:</strong> Real-time sum of all successful transactions.</li>
                    <li><strong>Active Users:</strong> Users who have logged in within the last 30 days.</li>
                    <li><strong>Total Content:</strong> Count of all active and inactive library items.</li>
                    <li><strong>Orders:</strong> Total number of purchase transactions.</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                  <h3 className="font-semibold text-green-900 mb-2">Recent Activity</h3>
                  <p className="text-sm text-green-800">
                    The "Recent Orders" section shows the latest transactions. 
                    Use this to quickly verify customer claims about successful payments.
                    Statuses include: <span className="font-mono bg-green-200 px-1 rounded">completed</span>, <span className="font-mono bg-yellow-200 px-1 rounded">pending</span>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Management Tab */}
        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Library Management
              </CardTitle>
              <CardDescription>
                How to create, edit, and organize digital content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="add-content">
                  <AccordionTrigger>Adding New Content</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Navigate to the <strong>Content</strong> tab or <strong>Library</strong> settings.</li>
                      <li>Click the "Add Content" button.</li>
                      <li>Fill effectively:
                        <ul className="list-disc pl-5 mt-1">
                          <li><strong>Title & Description:</strong> Be descriptive for searchability.</li>
                          <li><strong>Type:</strong> Select Document, Video, or Audio.</li>
                          <li><strong>File:</strong> Upload the actual digital asset.</li>
                          <li><strong>Thumbnail:</strong> Upload a cover image (essential for UI appeal).</li>
                          <li><strong>Pricing:</strong> Set to 0 for free content.</li>
                        </ul>
                      </li>
                      <li>Toggle "Exclusive" if this is premium content.</li>
                      <li>Click Save.</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bulk-actions">
                  <AccordionTrigger>Bulk Actions</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    You can delete multiple items at once by selecting the checkboxes next to content items in the list view 
                    and clicking the "Bulk Delete" icon in the toolbar. 
                    <strong> Warning: This action is irreversible.</strong>
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="visibility">
                  <AccordionTrigger>Visibility & Status</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Use the toggle switch on content cards to quickly Activate or Deactivate content without deleting it. 
                    Inactive content is not visible to users but remains in the database.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  Payment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    Manage Paystack integration keys in <strong>Settings &gt; Payments</strong>.
                  </p>
                  <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50">
                    <h4 className="font-semibold text-orange-900">Environment Modes</h4>
                    <ul className="mt-1 space-y-1">
                      <li><strong>Test Mode:</strong> Use for development. specific 'Test' keys are required. Transactions are simulated.</li>
                      <li><strong>Live Mode:</strong> Use for production. Real money is processed. Requires valid 'Live' keys.</li>
                    </ul>
                  </div>
                  <p>
                    <strong>Security Note:</strong> Secret keys are never shown fully after being saved.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  Email Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    Configure SMTP settings for system emails (Welcome emails, Receipts, Password Resets).
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Host:</strong> Usually <code>smtp.office365.com</code> for Microsoft.</li>
                    <li><strong>Port:</strong> 587 (TLS).</li>
                    <li><strong>User/Pass:</strong> The authenticated sender credentials.</li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-500">
                    Use the "Test Connection" button to verify credentials before saving.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-600" />
                  Upload Restrictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    Configure maximum file sizes for library content in <strong>Settings &gt; Upload</strong>.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Documents:</strong> Default limit 500MB.</li>
                    <li><strong>Videos:</strong> Can be set to unlimited (check server capacity).</li>
                    <li><strong>Images:</strong> Recommended keep under 10MB for performance.</li>
                  </ul>
                  <p className="border-l-2 border-yellow-500 pl-2 text-xs text-gray-500 mt-2">
                    Note: Your web server (Nginx/Cloudflare) may have strict global limits that override these application settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Troubleshooting Tab */}
        <TabsContent value="troubleshooting" className="space-y-4 mt-4">
          <Card className="border-red-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <TriangleAlert className="h-5 w-5" />
                Common Issues & Fixes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="upload-fail">
                  <AccordionTrigger>File Upload Fails</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Check file size limits (usually 100MB for standard uploads).</li>
                      <li>Ensure your internet connection is stable.</li>
                      <li>Verify that the backend storage service is reachable.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="payment-error">
                  <AccordionTrigger>Payment Verification Failed</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    If users report failed payments:
                    1. Check if the Paystack Reference exists in the Paystack Dashboard.
                    2. Ensure the callback URL in Paystack matches your domain/api/webhook.
                    3. Verify that the correct Secret Key (Test vs Live) is active.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
