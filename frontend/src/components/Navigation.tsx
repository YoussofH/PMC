'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', active: pathname === '/' },
    { href: '/library', label: 'Library', active: pathname === '/library' },
    { href: '/add', label: 'Add Media', active: pathname === '/add' },
    { href: '/search', label: 'Search', active: pathname === '/search' },
    { href: '/ai-insights', label: 'AI Insights', active: pathname === '/ai-insights' },
  ];

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg leading-none">PMC</span>
                <span className="text-xs text-muted-foreground leading-none">Media Collection</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={item.active ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href={item.href}>
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-green-600 border-green-600">
              Online
            </Badge>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 