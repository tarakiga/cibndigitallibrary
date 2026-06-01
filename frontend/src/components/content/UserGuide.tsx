
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleHelp, CreditCard, Library, User } from "lucide-react";

export function UserGuide() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          User Guide
        </h1>
        <p className="text-lg text-gray-600">
          Everything you need to know about using the CIBN Digital Library.
        </p>
      </div>

      <Card className="border-t-4 border-t-blue-600 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            Getting Started
          </CardTitle>
          <CardDescription>
            Setting up your account and personalizing your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Creating an Account</AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                To access the library, you need to create an account. Click on the <strong>Signup</strong> button 
                in the top right corner. Fill in your details including your full name, email address, and a secure password. 
                Once registered, you can log in to access all features.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Managing Your Profile</AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                Navigate to your <strong>Profile</strong> page to update your personal information. 
                You can change your password, update your contact details, and view your account status. 
                Keep your profile updated to ensure you receive important notifications and receipts.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-teal-500 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Library className="h-6 w-6 text-teal-500" />
            Browsing & Searching
          </CardTitle>
          <CardDescription>
            Finding the right resources for your needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Exploring the Library</AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                The content library is organized by categories. You can browse through 
                <strong> Documents</strong>, <strong> Videos</strong>, and <strong> Audio</strong> resources. 
                Use the filters on the left side of the library page to narrow down content by type, category, or price.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Using Search</AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                Use the search bar at the top of the library page to find specific topics, titles, or authors. 
                The search is instant and will update results as you type.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Content Details</AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                Click on any item card to view its full details. This includes a detailed description, 
                preview (if available), file size, duration (for media), and price.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-purple-600 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-purple-600" />
            Purchasing & Access
          </CardTitle>
          <CardDescription>
            Buying content and accessing your library.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Making a Purchase</AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Select the item you wish to purchase.</li>
                  <li>Click the <strong>Buy Now</strong> or <strong>Add to Cart</strong> button.</li>
                  <li>Proceed to checkout and complete the payment using your preferred method (Card, Bank Transfer, etc.) via our secure Paystack integration.</li>
                  <li>Once payment is successful, the item will be automatically added to your library.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Accessing Purchased Content</AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                All content you have purchased or that is available for free can be found in the <strong>My Library</strong> section. 
                You can access this from the main navigation menu. From here, you can view documents, watch videos, or listen to audio files directly in the browser.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
              <AccordionTrigger>Exclusive Content</AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                Some content is marked as <strong>Exclusive</strong>. These premium resources are available 
                for purchase and often contain high-value specialized knowledge. Look for the "Exclusive" badge on content cards.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleHelp className="h-6 w-6 text-orange-500" />
            Support & Troubleshooting
          </CardTitle>
          <CardDescription>
            Need help? We've got you covered.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>I can't access my purchased content</AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                If you've completed a purchase but don't see the content in "My Library":
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Refresh the page.</li>
                  <li>Check your email for a payment receipt to confirm the transaction was successful.</li>
                  <li>Log out and log back in to refresh your session.</li>
                  <li>If the issue persists, contact support with your order reference.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Contacting Support</AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                For any technical issues or inquiries, please visit the <strong>Contact</strong> page 
                or email our support team directly. We aim to respond to all inquiries within 24 hours.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
