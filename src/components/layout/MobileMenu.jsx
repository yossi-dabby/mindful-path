import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { cn } from "@/lib/utils";
import { Menu, X, Users, BookOpen, Settings } from 'lucide-react';
import { Drawer, DrawerContent, DrawerClose, DrawerOverlay, DrawerPortal } from '@/components/ui/drawer';
import { useTranslation } from 'react-i18next';

export default function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();
  
  const secondaryItems = [
    { name: t('sidebar.community.name'), icon: Users, path: 'Community', testId: 'mobile-nav-community' },
    { name: t('sidebar.resources.name'), icon: BookOpen, path: 'Resources', testId: 'mobile-nav-resources' },
    { name: t('sidebar.settings.name'), icon: Settings, path: 'Settings', testId: 'mobile-nav-settings' }
  ];

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(true)}
        data-testid="mobile-menu-button"
        className="p-2 transition-colors"
        style={{
          borderRadius: 'var(--r-sm)',
          color: '#26A69A'
        }}
        aria-label={t('mobile_menu.open_aria')}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Drawer */}
      <Drawer open={open} onOpenChange={setOpen} direction="left">
        <DrawerPortal>
          <DrawerOverlay 
            className="fixed inset-0 z-50 bg-emerald-50/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <DrawerContent
            data-testid="mobile-drawer"
            className={cn(
              "fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col overflow-x-hidden",
              "bg-white border-r shadow-xl"
            )}
            style={{
              borderColor: 'rgba(38, 166, 154, 0.25)',
              boxShadow: '4px 0 20px rgba(38, 166, 154, 0.12)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(38, 166, 154, 0.2)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center shadow-md" style={{ 
                  borderRadius: 'var(--r-lg)',
                  background: 'linear-gradient(135deg, #26A69A, #38B2AC)'
                }}>
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#1A3A34' }}>{t('mobile_menu.menu_title')}</h2>
                </div>
              </div>
              <DrawerClose asChild>
                <button
                  className="p-2 transition-colors"
                  style={{
                    borderRadius: 'var(--r-sm)',
                    color: '#5A7A72'
                  }}
                  aria-label={t('mobile_menu.close_aria')}
                >
                  <X className="w-5 h-5" />
                </button>
              </DrawerClose>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4 overflow-y-auto min-w-0">
              <div className="space-y-2">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={createPageUrl(item.path)}
                      data-testid={item.testId}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 transition-calm overflow-hidden break-words min-w-0"
                      style={{
                        borderRadius: 'var(--r-md)',
                        background: 'transparent',
                        color: '#5A7A72'
                      }}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                      <span className="text-sm font-medium truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </DrawerContent>
        </DrawerPortal>
      </Drawer>
    </div>
  );
}