'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { useUser } from '@clerk/nextjs';
import { ThemeToggle } from '@/src/components/theme/ThemeToggle';
import { MemoraLogo, MemoraMark } from '@/src/components/MemoraLogo';
import { cn } from '@/src/lib/utils';
import {
    Home,
    Activity,
    BookOpen,
    Brain,
    Code2,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { href: '/deep-dive', label: 'Deep Dive', icon: Brain },
    { href: '/classroom', label: 'Classroom', icon: Code2 },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, isAuthenticated } = useAuth();
    const { user } = useUser();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Hide on immersive routes and root landing page
    const hideOnRoutes = ['/login', '/onboarding', '/add-topic', '/quiz/daily'];
    const shouldHide = hideOnRoutes.includes(pathname) ||
        pathname.startsWith('/learn/') ||
        (pathname === '/' && !isAuthenticated);

    if (shouldHide) return null;

    const NavContent = ({ collapsed = false }: { collapsed?: boolean }) => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <Link href="/" className="flex items-center gap-3">
                    {collapsed ? (
                        <MemoraMark size={24} />
                    ) : (
                        <MemoraLogo size={24} />
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const IconComponent = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all relative",
                                isActive
                                    ? "text-[var(--text-primary)]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                            )}
                            style={{
                                transitionDuration: 'var(--duration-fast)',
                                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                                background: isActive ? 'var(--accent-light)' : 'transparent',
                            }}
                        >
                            {/* Active indicator bar */}
                            {isActive && (
                                <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full"
                                    style={{ background: 'var(--accent)' }}
                                />
                            )}
                            {'isEmoji' in item && item.isEmoji ? (
                                <IconComponent />
                            ) : (
                                <IconComponent className="w-4 h-4 shrink-0" />
                            )}
                            {!collapsed && item.label && (
                                <span>{item.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
                {!collapsed && (
                    <div className="flex items-center justify-between px-3 py-1.5">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Theme</span>
                        <ThemeToggle />
                    </div>
                )}
                {collapsed && (
                    <div className="flex justify-center py-1.5">
                        <ThemeToggle />
                    </div>
                )}
                <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10"
                    style={{ transitionDuration: 'var(--duration-fast)' }}
                    onClick={() => {
                        setMobileOpen(false);
                        logout();
                    }}
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {!collapsed && 'Logout'}
                </button>
                {!collapsed && user && (
                    <div className="px-3 pt-2 text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {user.firstName || user.primaryEmailAddress?.emailAddress}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-[var(--radius-sm)] backdrop-blur border"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar — full expanded */}
            <aside className={cn(
                "lg:hidden fixed inset-y-0 left-0 z-50 w-[220px] border-r transform transition-transform",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            )} style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-raised)',
                transitionDuration: 'var(--duration-answer)',
                transitionTimingFunction: 'ease-out',
            }}>
                <NavContent collapsed={false} />
            </aside>

            {/* Desktop Sidebar — collapsed rail that expands on hover */}
            <aside
                className="hidden lg:flex flex-col h-screen sticky top-0 border-r overflow-hidden group"
                style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border)',
                    boxShadow: 'var(--shadow-raised)',
                    width: '60px',
                    transition: 'width var(--duration-answer) ease-out',
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.width = '220px';
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.width = '60px';
                }}
            >
                {/* Collapsed state — shows mark only, on hover shows full */}
                <div className="flex flex-col h-full w-[220px]">
                    {/* Logo */}
                    <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                        <Link href="/" className="flex items-center gap-3 whitespace-nowrap">
                            <MemoraMark size={24} className="shrink-0" />
                            <span className="font-bold tracking-tight leading-none text-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ transitionDuration: 'var(--duration-base)' }}>
                                Memora
                            </span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-2 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all relative whitespace-nowrap",
                                        isActive
                                            ? "text-[var(--text-primary)]"
                                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                                    )}
                                    style={{
                                        transitionDuration: 'var(--duration-fast)',
                                        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                                        background: isActive ? 'var(--accent-light)' : 'transparent',
                                    }}
                                    title={item.label}
                                >
                                    {isActive && (
                                        <div
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full"
                                            style={{ background: 'var(--accent)' }}
                                        />
                                    )}
                                    {'isEmoji' in item && item.isEmoji ? (
                                        <span className="w-4 h-4 flex items-center justify-center shrink-0"><IconComponent /></span>
                                    ) : (
                                        <IconComponent className="w-4 h-4 shrink-0" />
                                    )}
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ transitionDuration: 'var(--duration-base)' }}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between px-3 py-1.5">
                            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)', transitionDuration: 'var(--duration-base)' }}>Theme</span>
                            <ThemeToggle />
                        </div>
                        <button
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all text-[var(--text-muted)] hover:text-[var(--danger)]"
                            style={{ transitionDuration: 'var(--duration-fast)' }}
                            onClick={() => logout()}
                        >
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ transitionDuration: 'var(--duration-base)' }}>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}