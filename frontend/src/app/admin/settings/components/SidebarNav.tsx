import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  items: NavItem[];
}

export function SidebarNav({
  className,
  activeTab,
  onTabChange,
  items,
  ...props
}: SidebarNavProps) {
  const router = useRouter();

  return (
    <nav
      className={cn(
        'flex items-center gap-2',
        className
      )}
      aria-label="Admin navigation"
      {...props}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={cn(
            'relative flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 group',
            activeTab === item.id
              ? 'bg-gradient-to-r from-[#002366] to-[#059669] text-white shadow-md scale-[1.02]'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
          )}
          aria-current={activeTab === item.id ? 'page' : undefined}
        >
          <span className={cn(
            'flex-shrink-0 transition-transform group-hover:scale-110',
            activeTab === item.id ? 'text-white' : 'text-gray-600'
          )}>
            {item.icon}
          </span>
          <span className="font-semibold">{item.label}</span>
          
          {/* Active indicator */}
          {activeTab === item.id && (
            <div className="absolute inset-0 rounded-lg bg-white/10 pointer-events-none" />
          )}
        </button>
      ))}
    </nav>
  );
}

export default SidebarNav;
