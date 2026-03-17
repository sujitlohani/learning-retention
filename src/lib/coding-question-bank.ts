import { AIGeneratedQuestion } from '@/src/types/ai';

export function getTopicCodingQuestions(topicId: string, unitNames: string[], language: 'javascript' | 'python'): AIGeneratedQuestion[] {
    const matchedCategories = new Set<keyof typeof questionBank>();

    for (const unit of unitNames) {
        const lowerUnit = unit.toLowerCase();
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(kw => lowerUnit.includes(kw))) {
                matchedCategories.add(category as keyof typeof questionBank);
            }
        }
    }

    if (matchedCategories.size === 0) return [];

    let questions: AIGeneratedQuestion[] = [];
    
    for (const category of matchedCategories) {
        const bankForLang = questionBank[category][language];
        if (bankForLang) {
            // Take 2 questions per matching category, map to AIGeneratedQuestion
            const toAdd = bankForLang.slice(0, 2).map((q, i) => ({
                id: `bank-${category}-${language}-${i}-${Date.now()}`,
                topicId: topicId,
                unitId: topicId, // fallback, ideally would be the specific unitid
                unitName: category,
                question: q.question,
                type: 'coding' as const,
                difficulty: 'intermediate' as const,
                correctAnswer: 'passed all tests',
                explanation: `Pre-built reference question for ${category}`,
                keywords: [category, language],
                language: language,
                starterCode: q.starterCode,
                testCases: q.testCases,
                validationScore: 100,
                aiGenerated: false,
                createdAt: new Date().toISOString()
            }));
            questions = [...questions, ...toAdd];
        }
    }

    return questions.slice(0, 5); // Cap at 5 total
}

const categoryKeywords = {
    loops: ['loop', 'iteration', 'for', 'while', 'range'],
    functions: ['function', 'method', 'def', 'return', 'parameter'],
    conditionals: ['if', 'else', 'condition', 'boolean', 'comparison'],
    arrays: ['array', 'list', 'index', 'element', 'collection'],
    strings: ['string', 'text', 'character', 'concatenate', 'slice'],
    oop: ['class', 'object', 'oop', 'instance', 'inheritance', 'constructor'],
    recursion: ['recursion', 'recursive', 'factorial', 'fibonacci'],
    'js-concepts': ['javascript', 'closure', 'scope', 'prototype', 'arrow']
};

interface BankQuestion {
    question: string;
    starterCode: string;
    testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
}

const questionBank: Record<string, Record<'javascript' | 'python', BankQuestion[]>> = {
    loops: {
        python: [
            {
                question: "Write a function `solution(lst)` that returns the sum of all numbers in the list.",
                starterCode: "def solution(lst):\n    # Your code here\n    pass",
                testCases: [
                    { input: "[1,2,3]", expectedOutput: "6", isHidden: false },
                    { input: "[-1,1,0,5]", expectedOutput: "5", isHidden: false }
                ]
            },
            {
                question: "Write a function `solution(lst)` that returns the count of items strictly greater than zero.",
                starterCode: "def solution(lst):\n    # Your code here\n    pass",
                testCases: [
                    { input: "[1,-2,3,-4,5]", expectedOutput: "3", isHidden: false },
                    { input: "[0,0,0]", expectedOutput: "0", isHidden: false }
                ]
            }
        ],
        javascript: [
            {
                question: "Write a function `solution(arr)` that returns the sum of all numbers in the array.",
                starterCode: "function solution(arr) {\n    // Your code here\n}",
                testCases: [
                    { input: "[1,2,3]", expectedOutput: "6", isHidden: false },
                    { input: "[-1,1,0,5]", expectedOutput: "5", isHidden: false }
                ]
            },
            {
                question: "Write a function `solution(arr)` that returns the count of items strictly greater than zero.",
                starterCode: "function solution(arr) {\n    // Your code here\n}",
                testCases: [
                    { input: "[1,-2,3,-4,5]", expectedOutput: "3", isHidden: false },
                    { input: "[0,0,0]", expectedOutput: "0", isHidden: false }
                ]
            }
        ]
    },
    functions: {
        python: [
            {
                question: "Write a function `solution(n)` that returns double the value of n.",
                starterCode: "def solution(n):\n    # Your code here\n    pass",
                testCases: [
                    { input: "4", expectedOutput: "8", isHidden: false },
                    { input: "-3", expectedOutput: "-6", isHidden: false }
                ]
            },
            {
                question: "Write a function `solution(n)` that returns the absolute value of n.",
                starterCode: "def solution(n):\n    # Your code here\n    pass",
                testCases: [
                    { input: "-5", expectedOutput: "5", isHidden: false },
                    { input: "3", expectedOutput: "3", isHidden: false }
                ]
            }
        ],
        javascript: [
            {
                question: "Write a function `solution(n)` that returns double the value of n.",
                starterCode: "function solution(n) {\n    // Your code here\n}",
                testCases: [
                    { input: "4", expectedOutput: "8", isHidden: false },
                    { input: "-3", expectedOutput: "-6", isHidden: false }
                ]
            },
            {
                question: "Write a function `solution(n)` that returns the absolute value of n.",
                starterCode: "function solution(n) {\n    // Your code here\n}",
                testCases: [
                    { input: "-5", expectedOutput: "5", isHidden: false },
                    { input: "3", expectedOutput: "3", isHidden: false }
                ]
            }
        ]
    },
    conditionals: {
        python: [
            {
                question: "Write a function `solution(n)` that returns 'even' if n is even, and 'odd' if n is odd.",
                starterCode: "def solution(n):\n    # Your code here\n    pass",
                testCases: [
                    { input: "4", expectedOutput: "even", isHidden: false },
                    { input: "7", expectedOutput: "odd", isHidden: false }
                ]
            },
            {
                question: "Write a function `solution(a, b)` that returns the larger of the two numbers.",
                starterCode: "def solution(a, b):\n    # Your code here\n    pass",
                testCases: [
                    { input: "3, 7", expectedOutput: "7", isHidden: false },
                    { input: "10, 2", expectedOutput: "10", isHidden: false }
                ]
            }
        ],
        javascript: [
             {
                question: "Write a function `solution(n)` that returns 'even' if n is even, and 'odd' if n is odd.",
                starterCode: "function solution(n) {\n    // Your code here\n}",
                testCases: [
                    { input: "4", expectedOutput: "even", isHidden: false },
                    { input: "7", expectedOutput: "odd", isHidden: false }
                ]
            },
            {
                question: "Write a function `solution(a, b)` that returns the larger of the two numbers.",
                starterCode: "function solution(a, b) {\n    // Your code here\n}",
                testCases: [
                    { input: "3, 7", expectedOutput: "7", isHidden: false },
                    { input: "10, 2", expectedOutput: "10", isHidden: false }
                ]
            }
        ]
    },
    oop: {
        python: [
            {
                question: "Given the `Person` class skeleton, add a `greet` method that returns 'Hello, my name is {name}'.",
                starterCode: "class Person:\n    def __init__(self, name):\n        self.name = name\n\ndef solution(name):\n    p = Person(name)\n    return p.greet()",
                testCases: [
                    { input: "'Alice'", expectedOutput: "Hello, my name is Alice", isHidden: false },
                    { input: "'Bob'", expectedOutput: "Hello, my name is Bob", isHidden: false }
                ]
            },
            {
                question: "Create a `Rectangle` class with a constructor taking `width` and `height`. Add a `get_area` method. Do not change `solution(w, h)`.",
                starterCode: "class Rectangle:\n    # Your code here\n    pass\n\ndef solution(w, h):\n    r = Rectangle(w, h)\n    return r.get_area()",
                testCases: [
                    { input: "4, 5", expectedOutput: "20", isHidden: false },
                    { input: "10, 10", expectedOutput: "100", isHidden: false }
                ]
            }
        ],
        javascript: [
             {
                question: "Given the `Person` class skeleton, add a `greet` method that returns 'Hello, my name is {name}'.",
                starterCode: "class Person {\n    constructor(name) {\n        this.name = name;\n    }\n    // Your code here\n}\n\nfunction solution(name) {\n    const p = new Person(name);\n    return p.greet();\n}",
                testCases: [
                    { input: "'Alice'", expectedOutput: "Hello, my name is Alice", isHidden: false },
                    { input: "'Bob'", expectedOutput: "Hello, my name is Bob", isHidden: false }
                ]
            },
            {
                question: "Create a `Rectangle` class with a constructor taking `width` and `height`. Add a `getArea` method. Do not change `solution(w, h)`.",
                starterCode: "class Rectangle {\n    // Your code here\n}\n\nfunction solution(w, h) {\n    const r = new Rectangle(w, h);\n    return r.getArea();\n}",
                testCases: [
                    { input: "4, 5", expectedOutput: "20", isHidden: false },
                    { input: "10, 10", expectedOutput: "100", isHidden: false }
                ]
            }
        ]
    },
    arrays: {
        python: [
             {
                question: "Write a function `solution(lst)` that returns the maximum value in the list.",
                starterCode: "def solution(lst):\n    # Your code here\n    pass",
                testCases: [
                    { input: "[1, 5, 2]", expectedOutput: "5", isHidden: false },
                    { input: "[-10, -5, -20]", expectedOutput: "-5", isHidden: false }
                ]
            },
            {
                question: "Write a function `solution(lst)` that returns a new list with all negative numbers removed.",
                starterCode: "def solution(lst):\n    # Your code here\n    pass",
                testCases: [
                    { input: "[1, -2, 3, -4]", expectedOutput: "[1, 3]", isHidden: false },
                    { input: "[-1, -2, -3]", expectedOutput: "[]", isHidden: false }
                ]
            }
        ],
        javascript: [
            {
                question: "Write a function `solution(arr)` that returns the maximum value in the array.",
                starterCode: "function solution(arr) {\n    // Your code here\n}",
                testCases: [
                    { input: "[1, 5, 2]", expectedOutput: "5", isHidden: false },
                    { input: "[-10, -5, -20]", expectedOutput: "-5", isHidden: false }
                ]
            },
            {
                question: "Write a function `solution(arr)` that returns a new array with all negative numbers removed. Output should be formatted exactly like a JS array (e.g., `[1, 3]`).",
                starterCode: "function solution(arr) {\n    // Your code here\n}",
                testCases: [
                    { input: "[1, -2, 3, -4]", expectedOutput: "[1,3]", isHidden: false },
                    { input: "[-1, -2, -3]", expectedOutput: "[]", isHidden: false }
                ]
            }
        ]
    },
    strings: {
        python: [
            {
                question: "Write a function `solution(s)` that returns the reversed string.",
                starterCode: "def solution(s):\n    # Your code here\n    pass",
                testCases: [
                    { input: "'hello'", expectedOutput: "olleh", isHidden: false },
                    { input: "'abc'", expectedOutput: "cba", isHidden: false }
                ]
            },
            {
                question: "Write a function `solution(s)` that returns the count of vowels (a, e, i, o, u) in the string. Assume all lowercase input.",
                starterCode: "def solution(s):\n    # Your code here\n    pass",
                testCases: [
                    { input: "'hello'", expectedOutput: "2", isHidden: false },
                    { input: "'rhythm'", expectedOutput: "0", isHidden: false }
                ]
            }
        ],
        javascript: [
             {
                question: "Write a function `solution(s)` that returns the reversed string.",
                starterCode: "function solution(s) {\n    // Your code here\n}",
                testCases: [
                    { input: "'hello'", expectedOutput: "olleh", isHidden: false },
                    { input: "'abc'", expectedOutput: "cba", isHidden: false }
                ]
            },
            {
                question: "Write a function `solution(s)` that returns the count of vowels (a, e, i, o, u) in the string. Assume all lowercase input.",
                starterCode: "function solution(s) {\n    // Your code here\n}",
                testCases: [
                    { input: "'hello'", expectedOutput: "2", isHidden: false },
                    { input: "'rhythm'", expectedOutput: "0", isHidden: false }
                ]
            }
        ]
    },
    recursion: {
        python: [
            {
                 question: "Write a recursive function `solution(n)` that returns the factorial of n (n!).",
                 starterCode: "def solution(n):\n    # Your code here\n    pass",
                 testCases: [
                     { input: "5", expectedOutput: "120", isHidden: false },
                     { input: "0", expectedOutput: "1", isHidden: false }
                 ]
            },
            {
                 question: "Write a recursive function `solution(n)` that returns the nth Fibonacci number, where F(0) = 0 and F(1) = 1.",
                 starterCode: "def solution(n):\n    # Your code here\n    pass",
                 testCases: [
                     { input: "5", expectedOutput: "5", isHidden: false },
                     { input: "7", expectedOutput: "13", isHidden: false }
                 ]
            }
        ],
        javascript: [
            {
                 question: "Write a recursive function `solution(n)` that returns the factorial of n (n!).",
                 starterCode: "function solution(n) {\n    // Your code here\n}",
                 testCases: [
                     { input: "5", expectedOutput: "120", isHidden: false },
                     { input: "0", expectedOutput: "1", isHidden: false }
                 ]
            },
            {
                 question: "Write a recursive function `solution(n)` that returns the nth Fibonacci number, where F(0) = 0 and F(1) = 1.",
                 starterCode: "function solution(n) {\n    // Your code here\n}",
                 testCases: [
                     { input: "5", expectedOutput: "5", isHidden: false },
                     { input: "7", expectedOutput: "13", isHidden: false }
                 ]
            }
        ]
    },
    'js-concepts': {
        python: [],
        javascript: [
             {
                question: "Write a function `solution()` that returns another function. That returned function, when called, should return the string 'closure'.",
                starterCode: "function solution() {\n    // Your code here\n}",
                testCases: [
                    { input: "", expectedOutput: "closure", isHidden: false } // We evaluate String(solution()()) -> effectively just testing the return
                ]
            },
            {
                question: "Write an arrow function assigned to a `solution` variable that returns double its numeric input `n`.",
                starterCode: "const solution = (n) => {\n    // Your code here\n};",
                testCases: [
                     { input: "4", expectedOutput: "8", isHidden: false },
                     { input: "10", expectedOutput: "20", isHidden: false }
                ]
            }
        ]
    }
};
