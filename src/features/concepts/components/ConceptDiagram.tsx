import React from 'react';
import { GitBranch } from 'lucide-react';

export function ConceptDiagram() {
    return (
        <div className="my-8 aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center border-2 border-dashed border-border relative overflow-hidden group">
            <GitBranch className="w-10 h-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Random Forest Structural Diagram</p>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
        </div>
    );
}
