import React from 'react';

interface CodeBlockProps {
    code: string;
}

const KEYWORDS = new Set(['if', 'else', 'for', 'while', 'let', 'const', 'var', 'function', 'def', 'class', 'return', 'import', 'export', 'from', 'default', 'await', 'async', 'try', 'catch', 'throw', 'switch', 'case', 'break', 'new', 'true', 'false', 'None', 'and', 'or', 'not', 'in', 'int', 'void', 'print', 'self']);

const KW_COLOR = '#9B8AE8';
const STR_COLOR = '#7EC8A0';
const COMMENT_COLOR = '#4D4A6E';
const NUM_COLOR = '#E8B96C';

export function CodeBlock({ code }: CodeBlockProps) {
    const renderLine = (line: string, index: number) => {
        const tokens: React.ReactNode[] = [];
        let pos = 0;
        const regex = /(\/\/.*|#.*$|".*?"|'.*?'|`.*?`|\b\d+\.?\d*\b|\b[a-zA-Z_]\w*\b)/gm;
        let match;

        while ((match = regex.exec(line)) !== null) {
            if (match.index > pos) {
                tokens.push(<span key={`t-${pos}`}>{line.substring(pos, match.index)}</span>);
            }
            const token = match[0];
            let color = 'inherit';
            if (token.startsWith('//') || token.startsWith('#')) color = COMMENT_COLOR;
            else if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) color = STR_COLOR;
            else if (/^\d+\.?\d*$/.test(token)) color = NUM_COLOR;
            else if (KEYWORDS.has(token)) color = KW_COLOR;

            tokens.push(<span key={`k-${match.index}`} style={{ color }}>{token}</span>);
            pos = match.index + token.length;
        }
        if (pos < line.length) tokens.push(<span key="end">{line.substring(pos)}</span>);

        return (
            <div key={index} className="px-4 py-0.5" style={{ minHeight: '1.7em' }}>
                {tokens.length > 0 ? tokens : line || '\u00A0'}
            </div>
        );
    };

    return (
        <pre
            className="text-[13px] rounded-lg overflow-x-auto py-3 leading-[1.7]"
            style={{
                background: '#0E0E16',
                color: '#c8c5d9',
                fontFamily: "Consolas, 'Courier New', monospace",
                border: '1px solid #1E1D30'
            }}
        >
            <code>{code.split('\n').map((l, i) => renderLine(l, i))}</code>
        </pre>
    );
}
