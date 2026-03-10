import React from 'react';
import { CheckCircle2, Lock, ListChecks } from 'lucide-react';
import Link from 'next/link';

interface Prerequisite {
    id: string;
    name: string;
    status: 'done' | 'locked' | 'learning';
}

export function PrerequisiteList({ prerequisites }: { prerequisites: Prerequisite[] }) {
    return (
        <section className="p-6 rounded-xl bg-card border">
            <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary" />
                Prerequisites
            </h2>
            <div className="space-y-4">
                {prerequisites.map((req) => (
                    <div key={req.id} className="flex items-center justify-between group">
                        <Link href={`/concepts/${req.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            {req.status === 'done' ? (
                                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                    <Lock className="w-3 h-3 text-muted-foreground" />
                                </div>
                            )}
                            <span className={`text-sm font-semibold ${req.status === 'done' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {req.name}
                            </span>
                        </Link>
                        {req.status === 'done' ? (
                            <span className="text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                                Done
                            </span>
                        ) : (
                            <span className="text-[10px] font-black uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                Locked
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
