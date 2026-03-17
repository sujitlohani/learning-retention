export function extractJSON(text: string): any {
    if (!text) throw new Error('Empty response');
    
    let cleanText = text.trim();
    
    // Attempt 1: direct parse
    try {
        return JSON.parse(cleanText);
    } catch (e) {
        // Fall through
    }

    // Attempt 2: bracket counting for { ... }
    try {
        const startIdx = cleanText.indexOf('{');
        if (startIdx !== -1) {
            let depth = 0;
            let endIdx = -1;
            let inString = false;
            let escapeNext = false;

            for (let i = startIdx; i < cleanText.length; i++) {
                const char = cleanText[i];
                if (escapeNext) {
                    escapeNext = false;
                    continue;
                }
                if (char === '\\') {
                    escapeNext = true;
                    continue;
                }
                if (char === '"') {
                    inString = !inString;
                    continue;
                }
                if (!inString) {
                    if (char === '{') depth++;
                    else if (char === '}') depth--;

                    if (depth === 0) {
                        endIdx = i;
                        break;
                    }
                }
            }

            if (endIdx !== -1) {
                const candidate = cleanText.substring(startIdx, endIdx + 1);
                return JSON.parse(candidate);
            }
        }
    } catch (e) {
        // Fall through
    }

    // Attempt 3: bracket counting for [ ... ]
    try {
        const startIdx = cleanText.indexOf('[');
        if (startIdx !== -1) {
            let depth = 0;
            let endIdx = -1;
            let inString = false;
            let escapeNext = false;

            for (let i = startIdx; i < cleanText.length; i++) {
                const char = cleanText[i];
                if (escapeNext) {
                    escapeNext = false;
                    continue;
                }
                if (char === '\\') {
                    escapeNext = true;
                    continue;
                }
                if (char === '"') {
                    inString = !inString;
                    continue;
                }
                if (!inString) {
                    if (char === '[') depth++;
                    else if (char === ']') depth--;

                    if (depth === 0) {
                        endIdx = i;
                        break;
                    }
                }
            }

            if (endIdx !== -1) {
                const candidate = cleanText.substring(startIdx, endIdx + 1);
                return JSON.parse(candidate);
            }
        }
    } catch (e) {
        // Fall through
    }

    // Attempt 4: strip markdown code fences and try again
    try {
        let noFences = cleanText.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim();
        return JSON.parse(noFences);
    } catch (e) {
        // Fall through
    }

    throw new Error('Failed to extract valid JSON from response');
}
