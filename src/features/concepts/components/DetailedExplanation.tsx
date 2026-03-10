import React from 'react';

export function DetailedExplanation() {
    return (
        <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
            <p className="mb-4">
                A Random Forest is an ensemble learning method that operates by constructing a multitude of decision trees at training time. For classification tasks, the output is the class selected by most trees. For regression tasks, it's the average prediction of the individual trees.
            </p>
        </div>
    );
}
