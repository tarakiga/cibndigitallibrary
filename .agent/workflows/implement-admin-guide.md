---
description: Implement a comprehensive Admin User Guide and Project Documentation system in a FastAPI + React application.
---

# Admin User Guide & Documentation Implementation Workflow

This workflow guides you through adding two critical documentation features to your admin dashboard:
1.  **Admin User Guide**: A built-in, lazy-loaded guide for admin users.
2.  **Project Documentation**: A secure viewer for technical docs (deployment, handoff).
3.  **Docusaurus Integration**: Hosting full documentation alongside the app.

> **CRITICAL LESSONS LEARNED (Do Not Ignore):**
> *   **Path Conflicts**: Docusaurus MUST use `/guides/` as its base URL to avoid conflicting with FastAPI's default `/docs` (Swagger UI).
> *   **Lazy Loading**: The `AdminUserGuide` component MUST be lazy-loaded (`React.lazy`) to prevent `ReferenceError` during deployment due to stale browser/server caches.
> *   **Docker Networking**: The frontend container MUST depend on the docs container in `docker-compose.yml` to prevent Nginx "host not found" startup crashes.

## Step 1: Docusaurus Setup (The "Guides" Container)

1.  Initialize Docusaurus in a `docs/` folder if not present.
2.  **Crucial Config Change**: Open `docs/docusaurus.config.js` and set:
    ```javascript
    module.exports = {
      // ...
      baseUrl: '/guides/', // MUST be /guides/ to avoid FastAPI /docs conflict
      onBrokenLinks: 'warn', // Prevents build failures from minor link issues
      // ...
    };
    ```
3.  Create a `docs/Dockerfile`:
    ```dockerfile
    FROM node:20-alpine
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build
    
    FROM nginx:alpine
    COPY --from=0 /app/build /usr/share/nginx/html
    # Copy custom nginx config if needed, otherwise default works for static
    ```

## Step 2: Nginx Routing Configuration

Update your main `nginx/nginx.conf` (or frontend Nginx config) to route traffic correctly.

```nginx
# 1. Route FastAPI Documentation (Swagger/ReDoc) - KEEP THIS AT /docs
location ~ ^/(docs|redoc|openapi.json) {
    proxy_pass http://backend:8000; # Adjust port as needed
    proxy_set_header Host $host;
}

# 2. Route Docusaurus Guides - NEW PATH
location /guides/ {
    proxy_pass http://docs:80; # Points to the docusaurus container
    proxy_set_header Host $host;
}

# 3. Route API endpoints
location /api/ {
    proxy_pass http://backend:8000;
}

# 4. Frontend (Default Fallback)
location / {
    proxy_pass http://frontend:80;
}
```

## Step 3: Implement Admin User Guide (Lazy Loaded)

Create `frontend/src/components/admin/AdminUserGuide.tsx`. This component should explain your system's features.

**Implementation Pattern:**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// ... imports

const AdminUserGuide = () => {
    return (
        <div className="space-y-6">
            {/* Implementation details... */}
        </div>
    );
};

export default AdminUserGuide;
```

## Step 4: Implement Project Documentation Viewer

Create `frontend/src/pages/admin/ProjectDocumentation.tsx` to view raw markdown files (e.g., deployment guides).

```tsx
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const AdminProjectDocs = () => {
   // Fetch and display markdown content from public/assets or API
   // ...
};
export default AdminProjectDocs;
```

## Step 5: Dashboard Integration (The "Lazy" Fix)

In your `AdminDashboard.tsx`, you **MUST** use `lazy` and `Suspense`. Do not static import the guide.

```tsx
import { Suspense, lazy, useState } from 'react';

// LAZY IMPORT IS MANDATORY TO AVOID DEPLOYMENT ERRORS
const AdminUserGuide = lazy(() => import('@/components/admin/AdminUserGuide'));
import AdminProjectDocs from '@/pages/admin/ProjectDocumentation';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
         <TabsList>
            <TabsTrigger value="guide">User Guide</TabsTrigger>
         </TabsList>

         {/* Tab Content */}
         <TabsContent value="guide">
            <Suspense fallback={<div>Loading guide...</div>}>
               <AdminUserGuide />
            </Suspense>
         </TabsContent>
      </Tabs>
    </div>
  );
};
```

## Step 6: Add Documentation FAB (Floating Action Button)

Allow users to easily access the full Docusaurus guide site (`/guides/`) from anywhere.

1.  **Create the Component** `frontend/src/components/DocumentationFAB.tsx`:
    ```tsx
    import { Button } from '@/components/ui/button';
    import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
    import { CircleHelp } from 'lucide-react';

    const DocumentationFAB = () => {
      // Points to standard /guides/ path in production, or localhost:3000 in dev if needed
      const docsUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001/guides/' : '/guides/'; 

      return (
        <div className="fixed bottom-6 right-6 z-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => window.open(docsUrl, '_blank')}
                  className="h-16 w-16 rounded-full bg-navy-600 hover:bg-navy-700 text-white shadow-lg transition-all hover:scale-110 active:scale-95 flex items-center justify-center p-0"
                >
                  <CircleHelp className="h-10 w-10" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Help & Documentation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    };

    export default DocumentationFAB;
    ```

2.  **Integrate into Layout**: Add `<DocumentationFAB />` to your main layout or `AdminDashboard.tsx`.

## Step 7: Docker Compose Updates

Update `docker-compose.yml` to include the docs service and ensure strict dependency ordering.

```yaml
services:
  # ... backend, db, etc ...

  docs:
    build:
      context: ./docs
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
      - docs  # CRITICAL: Ensures 'docs' host exists before Nginx starts
```

## Step 8: Deployment Checklist

When deploying this to a new server:

1.  [ ] **Git**: Ensure both `AdminUserGuide.tsx` and `AdminDashboard.tsx` are committed.
2.  [ ] **Clean Build**: Run `docker-compose up -d --build` to force a fresh image build.
3.  [ ] **Cache Clear**: If you see `ReferenceError`, clear browser cache. The `lazy` loading should prevent this, but it's a good fallback.
