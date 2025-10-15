"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, FileText, ClipboardCheck, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: GraduationCap },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Evaluation', href: '/evaluation', icon: ClipboardCheck },
  { name: 'Criteria', href: '/criteria', icon: Settings },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex items-center space-x-2 mr-8">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">UGC</span>
            <span className="text-xs text-gray-600 leading-tight">College Approval</span>
          </div>
        </div>

        <nav className="flex items-center space-x-1 flex-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
