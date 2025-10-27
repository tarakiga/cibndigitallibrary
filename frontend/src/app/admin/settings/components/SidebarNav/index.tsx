'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SidebarNavProps } from './types';

export const SidebarNav = ({
  activeTab,
  onTabChange,
  items,
  className,
  showMobileMenu = false,
  onToggleMobileMenu,
}: SidebarNavProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    setIsClient(true);
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isClient || !isMobile || !showMobileMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.getElementById('sidebar-nav');
      const menuButton = document.getElementById('mobile-menu-button');
      
      if (
        sidebar && 
        !sidebar.contains(target) && 
        menuButton && 
        !menuButton.contains(target) &&
        onToggleMobileMenu
      ) {
        onToggleMobileMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClient, isMobile, showMobileMenu, onToggleMobileMenu]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (!isClient) return;
    
    if (showMobileMenu && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isClient, showMobileMenu, isMobile]);

  // Render mobile menu button
  const renderMobileMenuButton = () => {
    if (!isMobile) return null;
    
    return (
      <Button
        id="mobile-menu-button"
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-40 md:hidden h-12 w-12 rounded-full shadow-lg"
        onClick={onToggleMobileMenu}
      >
        {showMobileMenu ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
        <span className="sr-only">
          {showMobileMenu ? 'Close menu' : 'Open menu'}
        </span>
      </Button>
    );
  };

  // Render sidebar content
  const renderSidebarContent = () => (
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onTabChange(item.id);
              if (isMobile && onToggleMobileMenu) {
                onToggleMobileMenu();
              }
            }}
            disabled={item.disabled}
            className={cn(
              'w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              item.disabled && 'opacity-50 cursor-not-allowed',
              'group'
            )}
          >
            <div className="flex items-center">
              {item.icon && (
                <span
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300'
                  )}
                >
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </div>
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  isActive
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  // Render desktop sidebar
  const renderDesktopSidebar = () => (
    <div className="hidden md:block h-full">
      <div className="space-y-4">
        <div className="px-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white px-2">
            Settings
          </h2>
        </div>
        <nav className="space-y-1">{renderSidebarContent()}</nav>
      </div>
    </div>
  );

  // Render mobile sidebar
  const renderMobileSidebar = () => {
    if (!isMobile) return null;

    return (
      <div
        className={cn(
          'fixed inset-0 z-30 md:hidden',
          showMobileMenu ? 'block' : 'hidden'
        )}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" />
        <div className="fixed inset-0 flex">
          <div
            id="sidebar-nav"
            className={cn(
              'relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-900 shadow-xl',
              'transform transition-transform duration-300 ease-in-out',
              showMobileMenu ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Settings
                </h2>
                <button
                  type="button"
                  className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-gray-900 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={onToggleMobileMenu}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-5 px-2">
                <nav className="space-y-1">{renderSidebarContent()}</nav>
              </div>
            </div>
          </div>
          <div className="w-14 flex-shrink-0">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={cn(
          'w-full md:w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900',
          className
        )}
      >
        {renderDesktopSidebar()}
      </div>
      {renderMobileSidebar()}
      {isMobile && renderMobileMenuButton()}
    </>
  );
};

export default SidebarNav;
