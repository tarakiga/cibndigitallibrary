export interface SidebarNavProps {
  /**
   * The currently active tab
   */
  activeTab: string;
  
  /**
   * Callback when a tab is clicked
   */
  onTabChange: (tab: string) => void;
  
  /**
   * Array of navigation items
   */
  items: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    count?: number;
    disabled?: boolean;
  }>;
  
  /**
   * Additional class name for the component
   */
  className?: string;
  
  /**
   * Whether to show the mobile menu
   */
  showMobileMenu?: boolean;
  
  /**
   * Callback when the mobile menu is toggled
   */
  onToggleMobileMenu?: () => void;
}
