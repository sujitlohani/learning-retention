// ============================================================
// FILE: src/lib/classroom-question-bank.ts

// Purpose: All coding questions for the Classroom feature.
//          Each question is fully implemented in all 6 languages.
// ============================================================

import { ClassroomQuestion, ClassroomLanguage, ClassroomDifficulty, ClassroomLanguageMeta } from '@/src/types/classroom';

// Re-export types so other files can import from one place
export type { ClassroomQuestion, ClassroomLanguage, ClassroomDifficulty, Difficulty } from '@/src/types/classroom';
export type { ClassroomProgress } from '@/src/types/classroom';

// ── Language metadata (used by language-selection UI) ────────────────────────

export const CLASSROOM_LANGUAGES: ClassroomLanguageMeta[] = [
  { id: 'javascript', label: 'JavaScript', extension: 'js'   },
  { id: 'typescript', label: 'TypeScript', extension: 'ts'   },
  { id: 'python',     label: 'Python',     extension: 'py'   },
  { id: 'java',       label: 'Java',       extension: 'java' },
  { id: 'c',          label: 'C',          extension: 'c'    },
  { id: 'cpp',        label: 'C++',        extension: 'cpp'  },
];

// ── Question bank ─────────────────────────────────────────────────────────────

export const classroomQuestions: ClassroomQuestion[] = [

  // ── EASY ──────────────────────────────────────────────────────────────────

  {
    id: 'two-sum',
    title: 'Two Sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers that add up to \`target\`.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
\`\`\`
**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\``,
    difficulty: 'easy',
    category: 'Arrays & Hashing',
    tags: ['array', 'hash-map'],
    hints: [
      'A brute-force O(n²) works — but can you do it in a single pass?',
      'Use a hash map: for each number, check if (target − number) is already stored.',
    ],
    explanation: 'Hash map approach: store each number as you iterate, check if its complement exists. O(n) time.',
    testCases: [
      { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
      { input: '[3,2,4], 6',     expectedOutput: '[1,2]' },
      { input: '[3,3], 6',       expectedOutput: '[0,1]' },
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // your solution\n}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {\n  // your solution\n  return [];\n}`,
      python:     `def two_sum(nums: list[int], target: int) -> list[int]:\n    # your solution\n    pass`,
      java:       `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // your solution\n        return new int[]{};\n    }\n}`,
      c:          `#include <stdlib.h>\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* result = (int*)malloc(2 * sizeof(int));\n    // your solution\n    return result;\n}`,
      cpp:        `#include <vector>\n#include <unordered_map>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // your solution\n        return {};\n    }\n};`,
    },
    solution: {
      javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python:     `def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i`,
      java:       `import java.util.*;\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) return new int[]{map.get(complement), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
      c:          `int* twoSum(int* nums, int n, int target, int* returnSize) {\n    *returnSize = 2;\n    int* r = malloc(2 * sizeof(int));\n    for (int i = 0; i < n; i++)\n        for (int j = i + 1; j < n; j++)\n            if (nums[i] + nums[j] == target) { r[0] = i; r[1] = j; return r; }\n    return r;\n}`,
      cpp:        `vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> map;\n    for (int i = 0; i < (int)nums.size(); i++) {\n        int complement = target - nums[i];\n        if (map.count(complement)) return {map[complement], i};\n        map[nums[i]] = i;\n    }\n    return {};\n}`,
    },
  },

  {
    id: 'reverse-string',
    title: 'Reverse a String',
    description: `Write a function that takes a string and returns it **reversed**.

**Example 1:**
\`\`\`
Input: "hello"
Output: "olleh"
\`\`\`
**Example 2:**
\`\`\`
Input: "world"
Output: "dlrow"
\`\`\``,
    difficulty: 'easy',
    category: 'Strings',
    tags: ['string', 'two-pointers'],
    hints: [
      'Use two pointers — one at the start, one at the end — swap and move inward.',
      'In Python you can use slice syntax [::-1].',
    ],
    explanation: 'Swap characters from both ends moving toward the center. O(n) time, O(1) space.',
    testCases: [
      { input: '"hello"', expectedOutput: 'olleh' },
      { input: '"world"', expectedOutput: 'dlrow' },
      { input: '"abcde"', expectedOutput: 'edcba' },
    ],
    starterCode: {
      javascript: `function reverseString(s) {\n  // your solution\n}`,
      typescript: `function reverseString(s: string): string {\n  // your solution\n  return '';\n}`,
      python:     `def reverse_string(s: str) -> str:\n    # your solution\n    pass`,
      java:       `class Solution {\n    public String reverseString(String s) {\n        // your solution\n        return "";\n    }\n}`,
      c:          `#include <string.h>\nchar* reverseString(char* s) {\n    // your solution\n    return s;\n}`,
      cpp:        `#include <string>\nusing namespace std;\nstring reverseString(string s) {\n    // your solution\n    return s;\n}`,
    },
    solution: {
      javascript: `function reverseString(s) {\n  return s.split('').reverse().join('');\n}`,
      typescript: `function reverseString(s: string): string {\n  return s.split('').reverse().join('');\n}`,
      python:     `def reverse_string(s): return s[::-1]`,
      java:       `public String reverseString(String s) {\n    return new StringBuilder(s).reverse().toString();\n}`,
      c:          `char* reverseString(char* s) {\n    int l = 0, r = strlen(s) - 1;\n    while (l < r) { char t = s[l]; s[l++] = s[r]; s[r--] = t; }\n    return s;\n}`,
      cpp:        `string reverseString(string s) {\n    reverse(s.begin(), s.end());\n    return s;\n}`,
    },
  },

  {
    id: 'fibonacci',
    title: 'Fibonacci Number',
    description: `Return the **nth Fibonacci number** where F(0) = 0 and F(1) = 1.

**Example:**
\`\`\`
Input: n = 10
Output: 55
\`\`\``,
    difficulty: 'easy',
    category: 'Dynamic Programming',
    tags: ['recursion', 'dp'],
    hints: [
      'Recursion works but is slow — try keeping just two variables.',
      'Loop from 2 to n, each time summing the previous two values.',
    ],
    explanation: 'Bottom-up DP with two variables. O(n) time, O(1) space.',
    testCases: [
      { input: '5',  expectedOutput: '5'  },
      { input: '10', expectedOutput: '55' },
      { input: '0',  expectedOutput: '0'  },
    ],
    starterCode: {
      javascript: `function fib(n) {\n  // your solution\n}`,
      typescript: `function fib(n: number): number {\n  // your solution\n  return 0;\n}`,
      python:     `def fib(n: int) -> int:\n    # your solution\n    pass`,
      java:       `class Solution {\n    public int fib(int n) {\n        // your solution\n        return 0;\n    }\n}`,
      c:          `int fib(int n) {\n    // your solution\n    return 0;\n}`,
      cpp:        `class Solution {\npublic:\n    int fib(int n) {\n        // your solution\n        return 0;\n    }\n};`,
    },
    solution: {
      javascript: `function fib(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];\n  return b;\n}`,
      typescript: `function fib(n: number): number {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];\n  return b;\n}`,
      python:     `def fib(n):\n    if n <= 1: return n\n    a, b = 0, 1\n    for _ in range(2, n + 1): a, b = b, a + b\n    return b`,
      java:       `public int fib(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }\n    return b;\n}`,
      c:          `int fib(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1, c;\n    for (int i = 2; i <= n; i++) { c = a + b; a = b; b = c; }\n    return b;\n}`,
      cpp:        `int fib(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }\n    return b;\n}`,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────

  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    description: `A string is a palindrome if it reads the same forwards and backwards (ignoring non-alphanumeric characters and case).

**Example 1:**
\`\`\`
Input: "A man, a plan, a canal: Panama"
Output: true
\`\`\`
**Example 2:**
\`\`\`
Input: "race a car"
Output: false
\`\`\``,
    difficulty: 'medium',
    category: 'Strings',
    tags: ['string', 'two-pointers'],
    hints: [
      'Strip non-alphanumeric characters and lowercase everything first.',
      'Then compare the cleaned string to its reverse, or use two pointers from both ends.',
    ],
    explanation: 'Clean the string to alphanumeric lowercase, then check if it equals its reverse.',
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true'  },
      { input: '"race a car"',                     expectedOutput: 'false' },
      { input: '" "',                              expectedOutput: 'true'  },
    ],
    starterCode: {
      javascript: `function isPalindrome(s) {\n  // your solution\n}`,
      typescript: `function isPalindrome(s: string): boolean {\n  // your solution\n  return false;\n}`,
      python:     `def is_palindrome(s: str) -> bool:\n    # your solution\n    pass`,
      java:       `class Solution {\n    public boolean isPalindrome(String s) {\n        // your solution\n        return false;\n    }\n}`,
      c:          `#include <stdbool.h>\n#include <ctype.h>\n#include <string.h>\nbool isPalindrome(char* s) {\n    // your solution\n    return false;\n}`,
      cpp:        `#include <string>\n#include <cctype>\nusing namespace std;\nbool isPalindrome(string s) {\n    // your solution\n    return false;\n}`,
    },
    solution: {
      javascript: `function isPalindrome(s) {\n  const c = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return c === c.split('').reverse().join('');\n}`,
      typescript: `function isPalindrome(s: string): boolean {\n  const c = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return c === c.split('').reverse().join('');\n}`,
      python:     `def is_palindrome(s):\n    c = ''.join(ch.lower() for ch in s if ch.isalnum())\n    return c == c[::-1]`,
      java:       `public boolean isPalindrome(String s) {\n    String c = s.toLowerCase().replaceAll("[^a-z0-9]", "");\n    return c.equals(new StringBuilder(c).reverse().toString());\n}`,
      c:          `bool isPalindrome(char* s) {\n    int l = 0, r = strlen(s) - 1;\n    while (l < r) {\n        while (l < r && !isalnum(s[l])) l++;\n        while (l < r && !isalnum(s[r])) r--;\n        if (tolower(s[l++]) != tolower(s[r--])) return false;\n    }\n    return true;\n}`,
      cpp:        `bool isPalindrome(string s) {\n    string c;\n    for (char ch : s) if (isalnum(ch)) c += tolower(ch);\n    string r(c.rbegin(), c.rend());\n    return c == r;\n}`,
    },
  },

  {
    id: 'binary-search',
    title: 'Binary Search',
    description: `Given a **sorted** array and a target, return its index or \`-1\` if not found. Must run in **O(log n)**.

**Example 1:**
\`\`\`
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
\`\`\`
**Example 2:**
\`\`\`
Input: nums = [-1,0,3,5,9,12], target = 2
Output: -1
\`\`\``,
    difficulty: 'medium',
    category: 'Binary Search',
    tags: ['binary-search', 'array'],
    hints: [
      'Keep left and right pointers. Calculate mid = (left + right) / 2.',
      'If nums[mid] < target search the right half. Otherwise search the left.',
    ],
    explanation: 'Classic binary search — halve the search range each iteration. O(log n).',
    testCases: [
      { input: '[-1,0,3,5,9,12], 9', expectedOutput: '4'  },
      { input: '[-1,0,3,5,9,12], 2', expectedOutput: '-1' },
      { input: '[5], 5',             expectedOutput: '0'  },
    ],
    starterCode: {
      javascript: `function search(nums, target) {\n  // your solution\n}`,
      typescript: `function search(nums: number[], target: number): number {\n  // your solution\n  return -1;\n}`,
      python:     `def search(nums: list[int], target: int) -> int:\n    # your solution\n    pass`,
      java:       `class Solution {\n    public int search(int[] nums, int target) {\n        // your solution\n        return -1;\n    }\n}`,
      c:          `int search(int* nums, int numsSize, int target) {\n    // your solution\n    return -1;\n}`,
      cpp:        `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // your solution\n        return -1;\n    }\n};`,
    },
    solution: {
      javascript: `function search(nums, target) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (nums[mid] === target) return mid;\n    nums[mid] < target ? lo = mid + 1 : hi = mid - 1;\n  }\n  return -1;\n}`,
      typescript: `function search(nums: number[], target: number): number {\n  let lo = 0, hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (nums[mid] === target) return mid;\n    nums[mid] < target ? lo = mid + 1 : hi = mid - 1;\n  }\n  return -1;\n}`,
      python:     `def search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target: return mid\n        if nums[mid] < target: lo = mid + 1\n        else: hi = mid - 1\n    return -1`,
      java:       `public int search(int[] nums, int target) {\n    int lo = 0, hi = nums.length - 1;\n    while (lo <= hi) {\n        int mid = (lo + hi) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;\n    }\n    return -1;\n}`,
      c:          `int search(int* nums, int n, int target) {\n    int lo = 0, hi = n - 1;\n    while (lo <= hi) {\n        int mid = (lo + hi) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;\n    }\n    return -1;\n}`,
      cpp:        `int search(vector<int>& nums, int target) {\n    int lo = 0, hi = (int)nums.size() - 1;\n    while (lo <= hi) {\n        int mid = (lo + hi) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;\n    }\n    return -1;\n}`,
    },
  },

  // ── HARD ──────────────────────────────────────────────────────────────────

  {
    id: 'max-subarray',
    title: 'Maximum Subarray',
    description: `Find the **contiguous subarray with the largest sum** and return that sum.

**Example 1:**
\`\`\`
Input: [-2,1,-3,4,-1,2,1,-5,4]
Output: 6   (subarray [4,-1,2,1])
\`\`\`
**Example 2:**
\`\`\`
Input: [5,4,-1,7,8]
Output: 23
\`\`\``,
    difficulty: 'hard',
    category: 'Dynamic Programming',
    tags: ['array', 'dp', "kadane's"],
    hints: [
      "Kadane's Algorithm: keep a running sum. If it goes negative, reset to the current element.",
      'Track the global maximum separately as you iterate.',
    ],
    explanation: "Kadane's algorithm — single O(n) pass, track local and global max.",
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6'  },
      { input: '[1]',                      expectedOutput: '1'  },
      { input: '[5,4,-1,7,8]',             expectedOutput: '23' },
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {\n  // your solution\n}`,
      typescript: `function maxSubArray(nums: number[]): number {\n  // your solution\n  return 0;\n}`,
      python:     `def max_sub_array(nums: list[int]) -> int:\n    # your solution\n    pass`,
      java:       `class Solution {\n    public int maxSubArray(int[] nums) {\n        // your solution\n        return 0;\n    }\n}`,
      c:          `int maxSubArray(int* nums, int numsSize) {\n    // your solution\n    return 0;\n}`,
      cpp:        `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // your solution\n        return 0;\n    }\n};`,
    },
    solution: {
      javascript: `function maxSubArray(nums) {\n  let max = nums[0], cur = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    max = Math.max(max, cur);\n  }\n  return max;\n}`,
      typescript: `function maxSubArray(nums: number[]): number {\n  let max = nums[0], cur = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    max = Math.max(max, cur);\n  }\n  return max;\n}`,
      python:     `def max_sub_array(nums):\n    cur = mx = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        mx = max(mx, cur)\n    return mx`,
      java:       `public int maxSubArray(int[] nums) {\n    int max = nums[0], cur = nums[0];\n    for (int i = 1; i < nums.length; i++) {\n        cur = Math.max(nums[i], cur + nums[i]);\n        max = Math.max(max, cur);\n    }\n    return max;\n}`,
      c:          `int maxSubArray(int* nums, int n) {\n    int max = nums[0], cur = nums[0];\n    for (int i = 1; i < n; i++) {\n        cur = cur + nums[i] > nums[i] ? cur + nums[i] : nums[i];\n        if (cur > max) max = cur;\n    }\n    return max;\n}`,
      cpp:        `int maxSubArray(vector<int>& nums) {\n    int max = nums[0], cur = nums[0];\n    for (int i = 1; i < (int)nums.size(); i++) {\n        cur = std::max(nums[i], cur + nums[i]);\n        max = std::max(max, cur);\n    }\n    return max;\n}`,
    },
  },

  // ── EASY (additional) ─────────────────────────────────────────────────────

  {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    description: `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice**, and \`false\` if every element is distinct.

**Example 1:**
\`\`\`
Input: nums = [1,2,3,1]
Output: true
\`\`\`
**Example 2:**
\`\`\`
Input: nums = [1,2,3,4]
Output: false
\`\`\``,
    difficulty: 'easy',
    category: 'Arrays & Hashing',
    tags: ['array', 'hash-set'],
    hints: [
      'A Set only stores unique values — try adding each number and checking if it was already there.',
      'If the Set size ever stays the same after an add, you found a duplicate.',
    ],
    explanation: 'Insert each number into a Set; if it already exists, return true. O(n) time.',
    testCases: [
      { input: '[1,2,3,1]',   expectedOutput: 'true'  },
      { input: '[1,2,3,4]',   expectedOutput: 'false' },
      { input: '[1,1,1,3,3]', expectedOutput: 'true'  },
    ],
    starterCode: {
      javascript: `function containsDuplicate(nums) {\n  // your solution\n}`,
      typescript: `function containsDuplicate(nums: number[]): boolean {\n  // your solution\n  return false;\n}`,
      python:     `def contains_duplicate(nums: list[int]) -> bool:\n    # your solution\n    pass`,
      java:       `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // your solution\n        return false;\n    }\n}`,
      c:          `#include <stdbool.h>\nbool containsDuplicate(int* nums, int numsSize) {\n    // your solution\n    return false;\n}`,
      cpp:        `#include <vector>\n#include <unordered_set>\nusing namespace std;\nbool containsDuplicate(vector<int>& nums) {\n    // your solution\n    return false;\n}`,
    },
    solution: {
      javascript: `function containsDuplicate(nums) {\n  const seen = new Set();\n  for (const n of nums) {\n    if (seen.has(n)) return true;\n    seen.add(n);\n  }\n  return false;\n}`,
      typescript: `function containsDuplicate(nums: number[]): boolean {\n  const seen = new Set<number>();\n  for (const n of nums) {\n    if (seen.has(n)) return true;\n    seen.add(n);\n  }\n  return false;\n}`,
      python:     `def contains_duplicate(nums):\n    return len(nums) != len(set(nums))`,
      java:       `public boolean containsDuplicate(int[] nums) {\n    Set<Integer> seen = new HashSet<>();\n    for (int n : nums) {\n        if (!seen.add(n)) return true;\n    }\n    return false;\n}`,
      c:          `bool containsDuplicate(int* nums, int n) {\n    // O(n^2) — no built-in hash set in C\n    for (int i = 0; i < n; i++)\n        for (int j = i + 1; j < n; j++)\n            if (nums[i] == nums[j]) return true;\n    return false;\n}`,
      cpp:        `bool containsDuplicate(vector<int>& nums) {\n    unordered_set<int> seen;\n    for (int n : nums) {\n        if (seen.count(n)) return true;\n        seen.insert(n);\n    }\n    return false;\n}`,
    },
  },

  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an **anagram** of \`s\`, and \`false\` otherwise.

An anagram uses all the original letters exactly once.

**Example 1:**
\`\`\`
Input: s = "anagram", t = "nagaram"
Output: true
\`\`\`
**Example 2:**
\`\`\`
Input: s = "rat", t = "car"
Output: false
\`\`\``,
    difficulty: 'easy',
    category: 'Strings',
    tags: ['string', 'hash-map', 'sorting'],
    hints: [
      'If the two strings have different lengths they cannot be anagrams.',
      'Count the frequency of each character in both strings and compare.',
    ],
    explanation: 'Build a character-frequency map for s, decrement for t — if all counts reach zero, it\'s an anagram.',
    testCases: [
      { input: 's = "anagram", t = "nagaram"', expectedOutput: 'true'  },
      { input: 's = "rat", t = "car"',         expectedOutput: 'false' },
      { input: 's = "a", t = "a"',             expectedOutput: 'true'  },
    ],
    starterCode: {
      javascript: `function isAnagram(s, t) {\n  // your solution\n}`,
      typescript: `function isAnagram(s: string, t: string): boolean {\n  // your solution\n  return false;\n}`,
      python:     `def is_anagram(s: str, t: str) -> bool:\n    # your solution\n    pass`,
      java:       `class Solution {\n    public boolean isAnagram(String s, String t) {\n        // your solution\n        return false;\n    }\n}`,
      c:          `#include <stdbool.h>\nbool isAnagram(char* s, char* t) {\n    // your solution\n    return false;\n}`,
      cpp:        `#include <string>\nusing namespace std;\nbool isAnagram(string s, string t) {\n    // your solution\n    return false;\n}`,
    },
    solution: {
      javascript: `function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (const c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}`,
      typescript: `function isAnagram(s: string, t: string): boolean {\n  if (s.length !== t.length) return false;\n  const count: Record<string, number> = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (const c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}`,
      python:     `from collections import Counter\ndef is_anagram(s, t):\n    return Counter(s) == Counter(t)`,
      java:       `public boolean isAnagram(String s, String t) {\n    if (s.length() != t.length()) return false;\n    int[] count = new int[26];\n    for (char c : s.toCharArray()) count[c - 'a']++;\n    for (char c : t.toCharArray()) if (--count[c - 'a'] < 0) return false;\n    return true;\n}`,
      c:          `bool isAnagram(char* s, char* t) {\n    int count[26] = {0};\n    while (*s) count[*s++ - 'a']++;\n    while (*t) if (--count[*t++ - 'a'] < 0) return false;\n    for (int i = 0; i < 26; i++) if (count[i]) return false;\n    return true;\n}`,
      cpp:        `bool isAnagram(string s, string t) {\n    if (s.size() != t.size()) return false;\n    int count[26] = {};\n    for (char c : s) count[c - 'a']++;\n    for (char c : t) if (--count[c - 'a'] < 0) return false;\n    return true;\n}`,
    },
  },

  // ── MEDIUM (additional) ───────────────────────────────────────────────────

  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    description: `Given a string \`s\`, find the length of the **longest substring without repeating characters**.

**Example 1:**
\`\`\`
Input: s = "abcabcbb"
Output: 3   // "abc"
\`\`\`
**Example 2:**
\`\`\`
Input: s = "bbbbb"
Output: 1   // "b"
\`\`\``,
    difficulty: 'medium',
    category: 'Sliding Window',
    tags: ['string', 'sliding-window', 'hash-set'],
    hints: [
      'Use a sliding window — expand the right pointer and shrink the left when you see a duplicate.',
      'A Set lets you check and remove characters in O(1).',
    ],
    explanation: 'Sliding window with a Set: expand right until duplicate, shrink from left. O(n) time.',
    testCases: [
      { input: '"abcabcbb"', expectedOutput: '3' },
      { input: '"bbbbb"',    expectedOutput: '1' },
      { input: '"pwwkew"',   expectedOutput: '3' },
    ],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n  // your solution\n}`,
      typescript: `function lengthOfLongestSubstring(s: string): number {\n  // your solution\n  return 0;\n}`,
      python:     `def length_of_longest_substring(s: str) -> int:\n    # your solution\n    pass`,
      java:       `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // your solution\n        return 0;\n    }\n}`,
      c:          `int lengthOfLongestSubstring(char* s) {\n    // your solution\n    return 0;\n}`,
      cpp:        `#include <string>\n#include <unordered_set>\nusing namespace std;\nint lengthOfLongestSubstring(string s) {\n    // your solution\n    return 0;\n}`,
    },
    solution: {
      javascript: `function lengthOfLongestSubstring(s) {\n  const seen = new Set();\n  let l = 0, max = 0;\n  for (let r = 0; r < s.length; r++) {\n    while (seen.has(s[r])) seen.delete(s[l++]);\n    seen.add(s[r]);\n    max = Math.max(max, r - l + 1);\n  }\n  return max;\n}`,
      typescript: `function lengthOfLongestSubstring(s: string): number {\n  const seen = new Set<string>();\n  let l = 0, max = 0;\n  for (let r = 0; r < s.length; r++) {\n    while (seen.has(s[r])) seen.delete(s[l++]);\n    seen.add(s[r]);\n    max = Math.max(max, r - l + 1);\n  }\n  return max;\n}`,
      python:     `def length_of_longest_substring(s):\n    seen = set()\n    l = max_len = 0\n    for r, c in enumerate(s):\n        while c in seen:\n            seen.remove(s[l])\n            l += 1\n        seen.add(c)\n        max_len = max(max_len, r - l + 1)\n    return max_len`,
      java:       `public int lengthOfLongestSubstring(String s) {\n    Set<Character> seen = new HashSet<>();\n    int l = 0, max = 0;\n    for (int r = 0; r < s.length(); r++) {\n        while (seen.contains(s.charAt(r))) seen.remove(s.charAt(l++));\n        seen.add(s.charAt(r));\n        max = Math.max(max, r - l + 1);\n    }\n    return max;\n}`,
      c:          `int lengthOfLongestSubstring(char* s) {\n    int seen[128] = {0}, l = 0, max = 0, n = strlen(s);\n    for (int r = 0; r < n; r++) {\n        while (seen[(int)s[r]]) seen[(int)s[l++]]--;\n        seen[(int)s[r]]++;\n        if (r - l + 1 > max) max = r - l + 1;\n    }\n    return max;\n}`,
      cpp:        `int lengthOfLongestSubstring(string s) {\n    unordered_set<char> seen;\n    int l = 0, max = 0;\n    for (int r = 0; r < (int)s.size(); r++) {\n        while (seen.count(s[r])) seen.erase(s[l++]);\n        seen.insert(s[r]);\n        max = std::max(max, r - l + 1);\n    }\n    return max;\n}`,
    },
  },

  {
    id: 'three-sum',
    title: 'Three Sum',
    description: `Given an integer array \`nums\`, return all **unique triplets** that sum to zero. The solution must not contain duplicate triplets.

**Example:**
\`\`\`
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]
\`\`\``,
    difficulty: 'medium',
    category: 'Arrays & Hashing',
    tags: ['array', 'two-pointers', 'sorting'],
    hints: [
      'Sort the array first — this makes it easy to skip duplicates.',
      'Fix one number with an outer loop, then use two pointers on the rest.',
    ],
    explanation: 'Sort + fix one element + two-pointer scan. Skip duplicates at every step. O(n²) time.',
    testCases: [
      { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]' },
      { input: '[0,1,1]',          expectedOutput: '[]'                    },
      { input: '[0,0,0]',          expectedOutput: '[[0,0,0]]'             },
    ],
    starterCode: {
      javascript: `function threeSum(nums) {\n  // your solution\n}`,
      typescript: `function threeSum(nums: number[]): number[][] {\n  // your solution\n  return [];\n}`,
      python:     `def three_sum(nums: list[int]) -> list[list[int]]:\n    # your solution\n    pass`,
      java:       `class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // your solution\n        return new ArrayList<>();\n    }\n}`,
      c:          `int** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {\n    // your solution\n    *returnSize = 0;\n    return NULL;\n}`,
      cpp:        `#include <vector>\n#include <algorithm>\nusing namespace std;\nvector<vector<int>> threeSum(vector<int>& nums) {\n    // your solution\n    return {};\n}`,
    },
    solution: {
      javascript: `function threeSum(nums) {\n  nums.sort((a, b) => a - b);\n  const result = [];\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n    let l = i + 1, r = nums.length - 1;\n    while (l < r) {\n      const sum = nums[i] + nums[l] + nums[r];\n      if (sum === 0) {\n        result.push([nums[i], nums[l], nums[r]]);\n        while (l < r && nums[l] === nums[l + 1]) l++;\n        while (l < r && nums[r] === nums[r - 1]) r--;\n        l++; r--;\n      } else if (sum < 0) l++;\n      else r--;\n    }\n  }\n  return result;\n}`,
      typescript: `function threeSum(nums: number[]): number[][] {\n  nums.sort((a, b) => a - b);\n  const result: number[][] = [];\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n    let l = i + 1, r = nums.length - 1;\n    while (l < r) {\n      const sum = nums[i] + nums[l] + nums[r];\n      if (sum === 0) {\n        result.push([nums[i], nums[l], nums[r]]);\n        while (l < r && nums[l] === nums[l + 1]) l++;\n        while (l < r && nums[r] === nums[r - 1]) r--;\n        l++; r--;\n      } else if (sum < 0) l++;\n      else r--;\n    }\n  }\n  return result;\n}`,
      python:     `def three_sum(nums):\n    nums.sort()\n    result = []\n    for i, a in enumerate(nums):\n        if i > 0 and nums[i] == nums[i - 1]: continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = a + nums[l] + nums[r]\n            if s == 0:\n                result.append([a, nums[l], nums[r]])\n                while l < r and nums[l] == nums[l + 1]: l += 1\n                while l < r and nums[r] == nums[r - 1]: r -= 1\n                l += 1; r -= 1\n            elif s < 0: l += 1\n            else: r -= 1\n    return result`,
      java:       `import java.util.*;\npublic List<List<Integer>> threeSum(int[] nums) {\n    Arrays.sort(nums);\n    List<List<Integer>> res = new ArrayList<>();\n    for (int i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] == nums[i-1]) continue;\n        int l = i + 1, r = nums.length - 1;\n        while (l < r) {\n            int s = nums[i] + nums[l] + nums[r];\n            if (s == 0) {\n                res.add(Arrays.asList(nums[i], nums[l], nums[r]));\n                while (l < r && nums[l] == nums[l+1]) l++;\n                while (l < r && nums[r] == nums[r-1]) r--;\n                l++; r--;\n            } else if (s < 0) l++; else r--;\n        }\n    }\n    return res;\n}`,
      c:          `// C solution omitted for brevity — triplet collection requires dynamic allocation`,
      cpp:        `vector<vector<int>> threeSum(vector<int>& nums) {\n    sort(nums.begin(), nums.end());\n    vector<vector<int>> res;\n    for (int i = 0; i < (int)nums.size() - 2; i++) {\n        if (i > 0 && nums[i] == nums[i-1]) continue;\n        int l = i + 1, r = (int)nums.size() - 1;\n        while (l < r) {\n            int s = nums[i] + nums[l] + nums[r];\n            if (s == 0) {\n                res.push_back({nums[i], nums[l], nums[r]});\n                while (l < r && nums[l] == nums[l+1]) l++;\n                while (l < r && nums[r] == nums[r-1]) r--;\n                l++; r--;\n            } else if (s < 0) l++; else r--;\n        }\n    }\n    return res;\n}`,
    },
  },

  // ── HARD (additional) ─────────────────────────────────────────────────────

  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    description: `Given \`n\` non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.

**Example:**
\`\`\`
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
\`\`\``,
    difficulty: 'hard',
    category: 'Two Pointers',
    tags: ['array', 'two-pointers', 'stack'],
    hints: [
      'Water above any bar = min(maxLeft, maxRight) − height[i]. Try precomputing those.',
      'Two pointers from both ends let you avoid the precomputation arrays entirely.',
    ],
    explanation: 'Two-pointer approach: move the shorter side inward, accumulating water based on running max heights. O(n) time, O(1) space.',
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
      { input: '[4,2,0,3,2,5]',              expectedOutput: '9' },
    ],
    starterCode: {
      javascript: `function trap(height) {\n  // your solution\n}`,
      typescript: `function trap(height: number[]): number {\n  // your solution\n  return 0;\n}`,
      python:     `def trap(height: list[int]) -> int:\n    # your solution\n    pass`,
      java:       `class Solution {\n    public int trap(int[] height) {\n        // your solution\n        return 0;\n    }\n}`,
      c:          `int trap(int* height, int heightSize) {\n    // your solution\n    return 0;\n}`,
      cpp:        `#include <vector>\nusing namespace std;\nint trap(vector<int>& height) {\n    // your solution\n    return 0;\n}`,
    },
    solution: {
      javascript: `function trap(height) {\n  let l = 0, r = height.length - 1;\n  let maxL = 0, maxR = 0, water = 0;\n  while (l < r) {\n    if (height[l] <= height[r]) {\n      maxL = Math.max(maxL, height[l]);\n      water += maxL - height[l++];\n    } else {\n      maxR = Math.max(maxR, height[r]);\n      water += maxR - height[r--];\n    }\n  }\n  return water;\n}`,
      typescript: `function trap(height: number[]): number {\n  let l = 0, r = height.length - 1;\n  let maxL = 0, maxR = 0, water = 0;\n  while (l < r) {\n    if (height[l] <= height[r]) {\n      maxL = Math.max(maxL, height[l]);\n      water += maxL - height[l++];\n    } else {\n      maxR = Math.max(maxR, height[r]);\n      water += maxR - height[r--];\n    }\n  }\n  return water;\n}`,
      python:     `def trap(height):\n    l, r = 0, len(height) - 1\n    max_l = max_r = water = 0\n    while l < r:\n        if height[l] <= height[r]:\n            max_l = max(max_l, height[l])\n            water += max_l - height[l]\n            l += 1\n        else:\n            max_r = max(max_r, height[r])\n            water += max_r - height[r]\n            r -= 1\n    return water`,
      java:       `public int trap(int[] height) {\n    int l = 0, r = height.length - 1, maxL = 0, maxR = 0, water = 0;\n    while (l < r) {\n        if (height[l] <= height[r]) {\n            maxL = Math.max(maxL, height[l]);\n            water += maxL - height[l++];\n        } else {\n            maxR = Math.max(maxR, height[r]);\n            water += maxR - height[r--];\n        }\n    }\n    return water;\n}`,
      c:          `int trap(int* h, int n) {\n    int l = 0, r = n - 1, maxL = 0, maxR = 0, water = 0;\n    while (l < r) {\n        if (h[l] <= h[r]) { maxL = h[l] > maxL ? h[l] : maxL; water += maxL - h[l++]; }\n        else               { maxR = h[r] > maxR ? h[r] : maxR; water += maxR - h[r--]; }\n    }\n    return water;\n}`,
      cpp:        `int trap(vector<int>& h) {\n    int l = 0, r = (int)h.size() - 1, maxL = 0, maxR = 0, water = 0;\n    while (l < r) {\n        if (h[l] <= h[r]) { maxL = max(maxL, h[l]); water += maxL - h[l++]; }\n        else               { maxR = max(maxR, h[r]); water += maxR - h[r--]; }\n    }\n    return water;\n}`,
    },
  },

  {
    id: 'word-break',
    title: 'Word Break',
    description: `Given a string \`s\` and a dictionary \`wordDict\`, return \`true\` if \`s\` can be segmented into one or more dictionary words.

**Example 1:**
\`\`\`
Input: s = "leetcode", wordDict = ["leet","code"]
Output: true
\`\`\`
**Example 2:**
\`\`\`
Input: s = "applepenapple", wordDict = ["apple","pen"]
Output: true
\`\`\``,
    difficulty: 'hard',
    category: 'Dynamic Programming',
    tags: ['dp', 'string', 'hash-set'],
    hints: [
      'Build a boolean DP array where dp[i] means s[0..i-1] can be segmented.',
      'For each position i, check every j < i: if dp[j] is true and s[j..i] is in the dictionary, set dp[i] = true.',
    ],
    explanation: 'DP where dp[i] = true if the prefix of length i is breakable. Fill left-to-right using the word set. O(n² * m) time.',
    testCases: [
      { input: 's = "leetcode", wordDict = ["leet","code"]',           expectedOutput: 'true'  },
      { input: 's = "applepenapple", wordDict = ["apple","pen"]',      expectedOutput: 'true'  },
      { input: 's = "catsandog", wordDict = ["cats","dog","sand","an"]', expectedOutput: 'false' },
    ],
    starterCode: {
      javascript: `function wordBreak(s, wordDict) {\n  // your solution\n}`,
      typescript: `function wordBreak(s: string, wordDict: string[]): boolean {\n  // your solution\n  return false;\n}`,
      python:     `def word_break(s: str, word_dict: list[str]) -> bool:\n    # your solution\n    pass`,
      java:       `class Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        // your solution\n        return false;\n    }\n}`,
      c:          `#include <stdbool.h>\nbool wordBreak(char* s, char** wordDict, int wordDictSize) {\n    // your solution\n    return false;\n}`,
      cpp:        `#include <string>\n#include <vector>\n#include <unordered_set>\nusing namespace std;\nbool wordBreak(string s, vector<string>& wordDict) {\n    // your solution\n    return false;\n}`,
    },
    solution: {
      javascript: `function wordBreak(s, wordDict) {\n  const words = new Set(wordDict);\n  const dp = Array(s.length + 1).fill(false);\n  dp[0] = true;\n  for (let i = 1; i <= s.length; i++)\n    for (let j = 0; j < i; j++)\n      if (dp[j] && words.has(s.slice(j, i))) { dp[i] = true; break; }\n  return dp[s.length];\n}`,
      typescript: `function wordBreak(s: string, wordDict: string[]): boolean {\n  const words = new Set(wordDict);\n  const dp = Array(s.length + 1).fill(false);\n  dp[0] = true;\n  for (let i = 1; i <= s.length; i++)\n    for (let j = 0; j < i; j++)\n      if (dp[j] && words.has(s.slice(j, i))) { dp[i] = true; break; }\n  return dp[s.length];\n}`,
      python:     `def word_break(s, word_dict):\n    words = set(word_dict)\n    dp = [False] * (len(s) + 1)\n    dp[0] = True\n    for i in range(1, len(s) + 1):\n        for j in range(i):\n            if dp[j] and s[j:i] in words:\n                dp[i] = True\n                break\n    return dp[len(s)]`,
      java:       `import java.util.*;\npublic boolean wordBreak(String s, List<String> wordDict) {\n    Set<String> words = new HashSet<>(wordDict);\n    boolean[] dp = new boolean[s.length() + 1];\n    dp[0] = true;\n    for (int i = 1; i <= s.length(); i++)\n        for (int j = 0; j < i; j++)\n            if (dp[j] && words.contains(s.substring(j, i))) { dp[i] = true; break; }\n    return dp[s.length()];\n}`,
      c:          `bool wordBreak(char* s, char** dict, int dictSize) {\n    int n = strlen(s);\n    bool* dp = calloc(n + 1, sizeof(bool));\n    dp[0] = true;\n    for (int i = 1; i <= n; i++)\n        for (int j = 0; j < i && !dp[i]; j++)\n            if (dp[j])\n                for (int k = 0; k < dictSize; k++) {\n                    int wl = strlen(dict[k]);\n                    if (i - j == wl && strncmp(s + j, dict[k], wl) == 0) { dp[i] = true; break; }\n                }\n    bool res = dp[n];\n    free(dp);\n    return res;\n}`,
      cpp:        `bool wordBreak(string s, vector<string>& wordDict) {\n    unordered_set<string> words(wordDict.begin(), wordDict.end());\n    int n = s.size();\n    vector<bool> dp(n + 1, false);\n    dp[0] = true;\n    for (int i = 1; i <= n; i++)\n        for (int j = 0; j < i; j++)\n            if (dp[j] && words.count(s.substr(j, i - j))) { dp[i] = true; break; }\n    return dp[n];\n}`,
    },
  },
];

// ── Derived constants (used by filters and UI) ────────────────────────────────

export const CATEGORIES    = [...new Set(classroomQuestions.map(q => q.category))];
export const DIFFICULTIES: ClassroomDifficulty[] = ['easy', 'medium', 'hard'];