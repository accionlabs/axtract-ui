import { Outlet } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes/constants';
import { LayoutGrid, FileText, Settings, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import FloatingTourButton from '@/features/tours/FloatingTourButton';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const baseUrl = import.meta.env.BASE_URL;

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: LayoutGrid,
      route: ROUTES.DASHBOARD,
    },
    {
      label: 'Layouts',
      icon: Settings,
      route: ROUTES.LAYOUT_MANAGER,
    },
    {
      label: 'Files',
      icon: FileText,
      route: ROUTES.FILE_MANAGER,
    },
    {
      label: 'Monitoring',
      icon: Calendar,
      route: ROUTES.MONITORING,
    },
  ];

  const isActiveRoute = (route: string) => {
    if (route === ROUTES.DASHBOARD) {
      return location.pathname === route;
    }
    return location.pathname.startsWith(route);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="p-0 hover:bg-transparent" 
              onClick={() => navigate(ROUTES.DASHBOARD)}
            >
              <img 
                src={`${baseUrl}axtract-logo.svg`}
                alt="AxTract Logo"
                className="h-8 w-auto"
              />
            </Button>
          </div>
          <nav className="flex items-center gap-1">
            {navigationItems.map((item) => (
              <Button
                key={item.route}
                variant="ghost"
                className={cn(
                  "flex items-center gap-2 px-3",
                  isActiveRoute(item.route) && "bg-secondary"
                )}
                onClick={() => navigate(item.route)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          <FloatingTourButton />

        </div>
      </header>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="border-t bg-white py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          AxTract Self-Service Extract Tool
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;