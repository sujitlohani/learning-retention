import { AIGeneratedQuestion } from '@/src/types/ai';

export function getCodingFallbackTemplates(topicId: string, language: 'javascript' | 'python'): AIGeneratedQuestion[] {
    const jsTemplates: AIGeneratedQuestion[] = [
        {
            id: `fb-coding-js-1-${Date.now()}`,
            topicId,
            unitId: 'coding-challenge',
            unitName: 'JavaScript Fundamentals',
            type: 'coding',
            difficulty: 'beginner',
            question: 'Write a function that calculates the sum of an array of numbers. The output should be the total sum.',
            explanation: 'Iterating over arrays to compute a single value is a core skill.',
            keywords: ['array', 'sum', 'reduce', 'loop'],
            language: 'javascript',
            starterCode: '// Implement the solution function\nfunction solution(arr) {\n  \n}',
            correctAnswer: 'passed all tests',
            testCases: [
                { input: '[1, 2, 3]', expectedOutput: '6', isHidden: false },
                { input: '[-1, 1, 0, 5]', expectedOutput: '5', isHidden: false },
                { input: '[10, 20, 30]', expectedOutput: '60', isHidden: true }
            ],
            hints: [
                'Try iterating over each item in the array.',
                'You can maintain a sum variable and add to it inside a loop, then return it.'
            ],
            validationScore: 100,
            aiGenerated: false,
            createdAt: new Date().toISOString()
        },
        {
            id: `fb-coding-js-2-${Date.now()}`,
            topicId,
            unitId: 'coding-challenge',
            unitName: 'JavaScript Strings',
            type: 'coding',
            difficulty: 'beginner',
            question: 'Write a function that takes a string and returns it reversed.',
            explanation: 'String manipulation is very common in programming.',
            keywords: ['string', 'reverse', 'split', 'join'],
            language: 'javascript',
            starterCode: '// Implement the solution function\nfunction solution(str) {\n  \n}',
            correctAnswer: 'passed all tests',
            testCases: [
                { input: '"hello"', expectedOutput: 'olleh', isHidden: false },
                { input: '"world"', expectedOutput: 'dlrow', isHidden: false },
                { input: '"OpenAI"', expectedOutput: 'IAnepO', isHidden: true }
            ],
            hints: [
                'You can split the string into an array of characters.',
                'Use array reversal methods and then join them back into a string.'
            ],
            validationScore: 100,
            aiGenerated: false,
            createdAt: new Date().toISOString()
        },
        {
            id: `fb-coding-js-3-${Date.now()}`,
            topicId,
            unitId: 'coding-challenge',
            unitName: 'JavaScript Math',
            type: 'coding',
            difficulty: 'intermediate',
            question: 'Write a function that finds the maximum number in an array.',
            explanation: 'Finding minimum or maximum values shows understanding of sequential checks.',
            keywords: ['array', 'max', 'math'],
            language: 'javascript',
            starterCode: '// Implement the solution function\nfunction solution(arr) {\n  \n}',
            correctAnswer: 'passed all tests',
            testCases: [
                { input: '[1, 5, 3]', expectedOutput: '5', isHidden: false },
                { input: '[-10, 0, -2]', expectedOutput: '0', isHidden: false },
                { input: '[100, 250, 42]', expectedOutput: '250', isHidden: true }
            ],
            hints: [
                'You can keep a variable for the maximum seen so far.',
                'Compare each element against the maximum variable in a loop.'
            ],
            validationScore: 100,
            aiGenerated: false,
            createdAt: new Date().toISOString()
        }
    ];

    const pyTemplates: AIGeneratedQuestion[] = [
        {
            id: `fb-coding-py-1-${Date.now()}`,
            topicId,
            unitId: 'coding-challenge',
            unitName: 'Python Fundamentals',
            type: 'coding',
            difficulty: 'beginner',
            question: 'Write a function that calculates the sum of a list of numbers. The output should be the total sum.',
            explanation: 'Iterating over lists to compute a single value is a core skill.',
            keywords: ['list', 'sum', 'loop'],
            language: 'python',
            starterCode: '# Implement the solution function\ndef solution(arr):\n    pass',
            correctAnswer: 'passed all tests',
            testCases: [
                { input: '[1, 2, 3]', expectedOutput: '6', isHidden: false },
                { input: '[-1, 1, 0, 5]', expectedOutput: '5', isHidden: false },
                { input: '[10, 20, 30]', expectedOutput: '60', isHidden: true }
            ],
            hints: [
                'Try iterating over each item in the list.',
                'You can maintain a sum variable, use a for loop, and return the total at the end.'
            ],
            validationScore: 100,
            aiGenerated: false,
            createdAt: new Date().toISOString()
        },
        {
            id: `fb-coding-py-2-${Date.now()}`,
            topicId,
            unitId: 'coding-challenge',
            unitName: 'Python Strings',
            type: 'coding',
            difficulty: 'beginner',
            question: 'Write a function that takes a string and returns it reversed.',
            explanation: 'String manipulation is very common in programming.',
            keywords: ['string', 'reverse', 'slice'],
            language: 'python',
            starterCode: '# Implement the solution function\ndef solution(s):\n    pass',
            correctAnswer: 'passed all tests',
            testCases: [
                { input: '"hello"', expectedOutput: 'olleh', isHidden: false },
                { input: '"world"', expectedOutput: 'dlrow', isHidden: false },
                { input: '"OpenAI"', expectedOutput: 'IAnepO', isHidden: true }
            ],
            hints: [
                'You can use slicing to easily reverse sequences in Python.',
                'The syntax [::-1] might be useful here.'
            ],
            validationScore: 100,
            aiGenerated: false,
            createdAt: new Date().toISOString()
        },
        {
            id: `fb-coding-py-3-${Date.now()}`,
            topicId,
            unitId: 'coding-challenge',
            unitName: 'Python Math',
            type: 'coding',
            difficulty: 'intermediate',
            question: 'Write a function that finds the maximum number in a list.',
            explanation: 'Finding minimum or maximum values shows understanding of sequential checks.',
            keywords: ['list', 'max', 'math'],
            language: 'python',
            correctAnswer: 'passed all tests',
            starterCode: '# Implement the solution function\ndef solution(arr):\n    pass',
            testCases: [
                { input: '[1, 5, 3]', expectedOutput: '5', isHidden: false },
                { input: '[-10, 0, -2]', expectedOutput: '0', isHidden: false },
                { input: '[100, 250, 42]', expectedOutput: '250', isHidden: true }
            ],
            hints: [
                'You can keep a variable for the maximum seen so far.',
                'Compare each element against the maximum variable in a loop.'
            ],
            validationScore: 100,
            aiGenerated: false,
            createdAt: new Date().toISOString()
        }
    ];

    return language === 'javascript' ? jsTemplates : pyTemplates;
}
