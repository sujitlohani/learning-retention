'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Activity, Library, GraduationCap, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function HamburgerMenu() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { logout } = useAuth();

    // Don't show on login page
    if (pathname === '/login') return null;

    const menuItems = [
        { href: '/', label: 'Home', icon: Home, disabled: false },
        { href: '/cockpit', label: 'Cockpit', icon: Activity, disabled: false },
        { href: '/content-dump', label: 'Content Dump', icon: Library, disabled: false },
        { href: '/classroom', label: 'Classroom', icon: GraduationCap, disabled: true },
    ];

    return (
        <div className="fixed top-4 left-4 z-50">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10 shadow-sm bg-background/80 backdrop-blur-sm border-2">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader className="mb-8 text-left">
                        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                            <span className="text-primary">Learning</span>Loop
                        </SheetTitle>
                    </SheetHeader>

                    <nav className="flex flex-col gap-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.disabled ? '#' : item.href}
                                onClick={() => !item.disabled && setOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-lg text-lg transition-colors",
                                    pathname === item.href
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:bg-muted",
                                    item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                                {item.disabled && <span className="ml-auto text-xs border border-border px-2 py-0.5 rounded-full">Soon</span>}
                            </Link>
                        ))}

                        <Separator className="my-4" />

                        <Button
                            variant="ghost"
                            className="justify-start gap-4 px-4 py-3 text-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                                setOpen(false);
                                logout();
                            }}
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </Button>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    );
}
