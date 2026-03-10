// lib/ai/prompts/unit-prompts.ts
// Refined prompt templates for AI unit generation

export function buildUnitPrompt(topic: string, level: 'beginner' | 'intermediate' | 'expert'): string {
    return `Generate the fundamental units of knowledge a person must understand to fully learn "${topic}" at ${level} level. 
Think of these as required prior knowledge or prerequisite building blocks, not chapters or lessons. 
Each unit should be a discrete, learnable piece of knowledge. 
List them in logical progression order from most foundational to most advanced.
Generate exactly 8 units.

CRITICAL: Return ONLY a valid JSON array of objects with fields: \`name\` (string), \`description\` (one sentence), \`order\` (number). No explanation, no markdown format blocks, no code blocks.

Example format:
[
  { "name": "Basic syntax", "description": "Understand the core syntax and structure.", "order": 1 },
  { "name": "Variables", "description": "Learn how to store, retrieve, and modify data in memory.", "order": 2 }
]`;
}

export interface UnitResponse {
    name: string;
    description: string;
    order: number;
}

export function getFallbackUnits(topic: string, level: 'beginner' | 'intermediate' | 'expert'): UnitResponse[] {
    const topicKey = topic.toLowerCase().trim();
    const isPython = topicKey === 'python';

    // Just a basic generic fallback for any topic
    const genericUnits = {
        beginner: [
            { name: `${topic} fundamentals`, description: `Core concepts and foundational principles of ${topic}.`, order: 1 },
            { name: `Basic ${topic} syntax`, description: `Understanding how to read and write basic ${topic}.`, order: 2 },
            { name: `Core ${topic} concepts`, description: `The most important building blocks of ${topic}.`, order: 3 },
            { name: `Essential ${topic} operations`, description: `Basic tasks and operations performed in ${topic}.`, order: 4 },
            { name: `Getting started with ${topic}`, description: `Initial setup and first steps for learning ${topic}.`, order: 5 },
            { name: `Basic problem solving`, description: `Apply ${topic} knowledge to solve simple problems.`, order: 6 },
            { name: `Common ${topic} patterns`, description: `Frequently used approaches and patterns in ${topic}.`, order: 7 },
            { name: `Practical ${topic} examples`, description: `Real-world examples of applying ${topic}.`, order: 8 },
        ],
        intermediate: [
            { name: `Advanced ${topic} concepts`, description: `Moving beyond the basics of ${topic}.`, order: 1 },
            { name: `${topic} best practices`, description: `Industry standards and recommended approaches.`, order: 2 },
            { name: `Real-world ${topic} applications`, description: `How ${topic} is used in professional environments.`, order: 3 },
            { name: `Problem-solving with ${topic}`, description: `Tackling complex challenges using ${topic}.`, order: 4 },
            { name: `${topic} design patterns`, description: `Architectural and structural patterns for ${topic}.`, order: 5 },
            { name: `Common ${topic} pitfalls`, description: `Mistakes to avoid when working with ${topic}.`, order: 6 },
            { name: `Debugging ${topic} code`, description: `Techniques for finding and fixing issues.`, order: 7 },
            { name: `Optimizing ${topic} code`, description: `Improving performance and efficiency.`, order: 8 },
        ],
        expert: [
            { name: `${topic} architecture`, description: `Deep dive into the underlying architecture of ${topic}.`, order: 1 },
            { name: `Advanced ${topic} patterns`, description: `Complex, highly specialized patterns in ${topic}.`, order: 2 },
            { name: `Performance optimization`, description: `Extracting maximum speed and efficiency.`, order: 3 },
            { name: `${topic} system design`, description: `Designing large-scale systems using ${topic}.`, order: 4 },
            { name: `Edge cases in ${topic}`, description: `Handling rare and unusual scenarios.`, order: 5 },
            { name: `Expert ${topic} techniques`, description: `Techniques used only by seasoned professionals.`, order: 6 },
            { name: `${topic} internals`, description: `How ${topic} works under the hood.`, order: 7 },
            { name: `Production-ready ${topic}`, description: `Preparing ${topic} solutions for enterprise production.`, order: 8 },
        ],
    };

    return genericUnits[level];
}

export function validateUnitResponse(response: string): UnitResponse[] | null {
    try {
        let cleaned = response.trim();
        cleaned = cleaned.replace(/^```json\s*/i, '');
        cleaned = cleaned.replace(/^```\s*/i, '');
        cleaned = cleaned.replace(/\s*```$/i, '');
        cleaned = cleaned.trim();

        const parsed = JSON.parse(cleaned);

        if (!Array.isArray(parsed)) {
            console.error('Response is not an array');
            return null;
        }

        if (parsed.length !== 8) {
            console.error(`Expected 8 units, got ${parsed.length}`);
            return null;
        }

        const valid = parsed.every(item =>
            item && typeof item === 'object' &&
            typeof item.name === 'string' &&
            typeof item.description === 'string' &&
            typeof item.order === 'number'
        );

        if (!valid) {
            console.error('Items do not match {name, description, order} format');
            return null;
        }

        return parsed.sort((a, b) => a.order - b.order);
    } catch (error) {
        console.error('Failed to parse unit response:', error);
        return null;
    }
}