import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface ConceptBreadcrumbProps {
    topic: string;
    conceptName: string;
}

export function ConceptBreadcrumb({ topic, conceptName }: ConceptBreadcrumbProps) {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/knowledge-base" className="hover:text-primary transition-colors">
                Knowledge Base
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="cursor-pointer hover:text-primary transition-colors">
                {topic}
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">
                {conceptName}
            </span>
        </div>
    );
}
