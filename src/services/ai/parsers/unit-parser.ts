import { UnitResponse } from '../prompts/unit-prompts';

export function parseUnitResponse(responseText: string): UnitResponse[] {
    const trimmed = responseText.trim();

    try {
        const startIdx = trimmed.indexOf('[');
        const endIdx = trimmed.lastIndexOf(']');

        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const jsonStr = trimmed.substring(startIdx, endIdx + 1);
            const parsed = JSON.parse(jsonStr);
            if (Array.isArray(parsed)) {
                const valid = parsed.every(item =>
                    item && typeof item === 'object' &&
                    typeof item.name === 'string' &&
                    typeof item.description === 'string' &&
                    typeof item.order === 'number'
                );
                if (valid) {
                    return parsed.sort((a, b) => a.order - b.order);
                }
            }
        }
    } catch {
        // Fall through
    }

    return [];
}
