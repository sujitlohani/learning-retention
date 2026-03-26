// src/lib/classroom-question-bank.ts


import { ClassroomQuestion, ClassroomLanguage, ClassroomDifficulty, ClassroomLanguageMeta } from '@/src/types/classroom';

export type { ClassroomQuestion, ClassroomLanguage, ClassroomDifficulty };

export const CLASSROOM_LANGUAGES: ClassroomLanguageMeta[] = [
  { id: 'javascript', label: 'JavaScript', extension: 'js' },
  { id: 'typescript', label: 'TypeScript', extension: 'ts' },
  { id: 'python',     label: 'Python',     extension: 'py' },
  { id: 'java',       label: 'Java',       extension: 'java' },
  { id: 'c',          label: 'C',          extension: 'c' },
  { id: 'cpp',        label: 'C++',        extension: 'cpp' },
];

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
      'A brute force O(n²) loop works. Can you do it in one pass?',
      'Use a hash map: for each number, check if (target − number) is already stored.',
    ],
    explanation: 'Hash map approach: store each number as you go, check if complement already exists. O(n) time.',
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
      javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const c = target - nums[i];\n    if (map.has(c)) return [map.get(c), i];\n    map.set(nums[i], i);\n  }\n}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number,number>();\n  for (let i = 0; i < nums.length; i++) {\n    const c = target - nums[i];\n    if (map.has(c)) return [map.get(c)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python:     `def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i`,
      java:       `import java.util.*;\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer,Integer> map = new HashMap<>();\n        for (int i=0;i<nums.length;i++) {\n            int c = target-nums[i];\n            if (map.containsKey(c)) return new int[]{map.get(c),i};\n            map.put(nums[i],i);\n        }\n        return new int[]{};\n    }\n}`,
      c:          `int* twoSum(int* nums, int n, int target, int* returnSize) {\n    *returnSize=2;\n    int* r=malloc(2*sizeof(int));\n    for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) if(nums[i]+nums[j]==target){r[0]=i;r[1]=j;return r;}\n    return r;\n}`,
      cpp:        `vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int,int> m;\n    for(int i=0;i<nums.size();i++){\n        int c=target-nums[i];\n        if(m.count(c)) return {m[c],i};\n        m[nums[i]]=i;\n    }\n    return {};\n}`,
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
      'Two pointers: one at the start, one at the end — swap and move inward.',
      'In Python you can use slice syntax [::-1].',
    ],
    explanation: 'Swap characters from both ends moving toward the center. O(n) time, O(1) extra space.',
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
      c:          `char* reverseString(char* s){\n    int l=0,r=strlen(s)-1;\n    while(l<r){char t=s[l];s[l++]=s[r];s[r--]=t;}\n    return s;\n}`,
      cpp:        `string reverseString(string s){\n    reverse(s.begin(),s.end());\n    return s;\n}`,
    },
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Number',
    description: `Return the **nth Fibonacci number** where F(0) = 0 and F(1) = 1.

**Example 1:**
\`\`\`
Input: n = 5
Output: 5   (0,1,1,2,3,5)
\`\`\`
**Example 2:**
\`\`\`
Input: n = 10
Output: 55
\`\`\``,
    difficulty: 'easy',
    category: 'Dynamic Programming',
    tags: ['recursion', 'dp'],
    hints: [
      'Recursion works but is slow. Try keeping just two variables.',
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
      javascript: `function fib(n){\n  if(n<=1)return n;\n  let a=0,b=1;\n  for(let i=2;i<=n;i++){[a,b]=[b,a+b];}\n  return b;\n}`,
      typescript: `function fib(n:number):number{\n  if(n<=1)return n;\n  let a=0,b=1;\n  for(let i=2;i<=n;i++){[a,b]=[b,a+b];}\n  return b;\n}`,
      python:     `def fib(n):\n    if n<=1: return n\n    a,b=0,1\n    for _ in range(2,n+1): a,b=b,a+b\n    return b`,
      java:       `public int fib(int n){\n    if(n<=1)return n;\n    int a=0,b=1;\n    for(int i=2;i<=n;i++){int c=a+b;a=b;b=c;}\n    return b;\n}`,
      c:          `int fib(int n){\n    if(n<=1)return n;\n    int a=0,b=1,c;\n    for(int i=2;i<=n;i++){c=a+b;a=b;b=c;}\n    return b;\n}`,
      cpp:        `int fib(int n){\n    if(n<=1)return n;\n    int a=0,b=1;\n    for(int i=2;i<=n;i++){int c=a+b;a=b;b=c;}\n    return b;\n}`,
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
      'First strip non-alphanumeric characters and lowercase everything.',
      'Then compare it to its reverse — or use two pointers from both ends.',
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
      javascript: `function isPalindrome(s){\n  const c=s.toLowerCase().replace(/[^a-z0-9]/g,'');\n  return c===c.split('').reverse().join('');\n}`,
      typescript: `function isPalindrome(s:string):boolean{\n  const c=s.toLowerCase().replace(/[^a-z0-9]/g,'');\n  return c===c.split('').reverse().join('');\n}`,
      python:     `def is_palindrome(s):\n    c=''.join(ch.lower() for ch in s if ch.isalnum())\n    return c==c[::-1]`,
      java:       `public boolean isPalindrome(String s){\n    String c=s.toLowerCase().replaceAll("[^a-z0-9]","");\n    return c.equals(new StringBuilder(c).reverse().toString());\n}`,
      c:          `bool isPalindrome(char* s){\n    int l=0,r=strlen(s)-1;\n    while(l<r){\n        while(l<r&&!isalnum(s[l]))l++;\n        while(l<r&&!isalnum(s[r]))r--;\n        if(tolower(s[l++])!=tolower(s[r--]))return false;\n    }\n    return true;\n}`,
      cpp:        `bool isPalindrome(string s){\n    string c;\n    for(char ch:s)if(isalnum(ch))c+=tolower(ch);\n    string r(c.rbegin(),c.rend());\n    return c==r;\n}`,
    },
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    description: `Given a **sorted** array of integers and a target, return the index of the target or \`-1\` if not found. Must run in **O(log n)**.

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
      'Keep a left and right pointer. Calculate mid = (left + right) / 2.',
      'If nums[mid] < target, search the right half. Otherwise search the left.',
    ],
    explanation: 'Classic binary search: halve the search range each iteration. O(log n) time.',
    testCases: [
      { input: '[-1,0,3,5,9,12], 9',  expectedOutput: '4'  },
      { input: '[-1,0,3,5,9,12], 2',  expectedOutput: '-1' },
      { input: '[5], 5',              expectedOutput: '0'  },
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
      javascript: `function search(nums,target){\n  let lo=0,hi=nums.length-1;\n  while(lo<=hi){\n    const m=(lo+hi)>>1;\n    if(nums[m]===target)return m;\n    nums[m]<target?lo=m+1:hi=m-1;\n  }\n  return -1;\n}`,
      typescript: `function search(nums:number[],target:number):number{\n  let lo=0,hi=nums.length-1;\n  while(lo<=hi){\n    const m=(lo+hi)>>1;\n    if(nums[m]===target)return m;\n    nums[m]<target?lo=m+1:hi=m-1;\n  }\n  return -1;\n}`,
      python:     `def search(nums,target):\n    lo,hi=0,len(nums)-1\n    while lo<=hi:\n        m=(lo+hi)//2\n        if nums[m]==target:return m\n        if nums[m]<target:lo=m+1\n        else:hi=m-1\n    return -1`,
      java:       `public int search(int[]nums,int target){\n    int lo=0,hi=nums.length-1;\n    while(lo<=hi){int m=(lo+hi)/2;if(nums[m]==target)return m;if(nums[m]<target)lo=m+1;else hi=m-1;}\n    return -1;\n}`,
      c:          `int search(int*nums,int n,int t){\n    int lo=0,hi=n-1;\n    while(lo<=hi){int m=(lo+hi)/2;if(nums[m]==t)return m;if(nums[m]<t)lo=m+1;else hi=m-1;}\n    return -1;\n}`,
      cpp:        `int search(vector<int>&nums,int t){\n    int lo=0,hi=nums.size()-1;\n    while(lo<=hi){int m=(lo+hi)/2;if(nums[m]==t)return m;if(nums[m]<t)lo=m+1;else hi=m-1;}\n    return -1;\n}`,
    },
  },

  // ── HARD ──────────────────────────────────────────────────────────────────
  {
    id: 'max-subarray',
    title: 'Maximum Subarray',
    description: `Given an integer array, find the **subarray with the largest sum** and return that sum.

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
      "Kadane's Algorithm: keep a running sum. If it goes negative, reset to 0.",
      'Track the global maximum separately as you iterate.',
    ],
    explanation: "Kadane's algorithm: O(n) single pass, track local and global max.",
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
      javascript: `function maxSubArray(nums){\n  let max=nums[0],cur=nums[0];\n  for(let i=1;i<nums.length;i++){\n    cur=Math.max(nums[i],cur+nums[i]);\n    max=Math.max(max,cur);\n  }\n  return max;\n}`,
      typescript: `function maxSubArray(nums:number[]):number{\n  let max=nums[0],cur=nums[0];\n  for(let i=1;i<nums.length;i++){cur=Math.max(nums[i],cur+nums[i]);max=Math.max(max,cur);}\n  return max;\n}`,
      python:     `def max_sub_array(nums):\n    cur=mx=nums[0]\n    for n in nums[1:]:\n        cur=max(n,cur+n)\n        mx=max(mx,cur)\n    return mx`,
      java:       `public int maxSubArray(int[]nums){\n    int m=nums[0],c=nums[0];\n    for(int i=1;i<nums.length;i++){c=Math.max(nums[i],c+nums[i]);m=Math.max(m,c);}\n    return m;\n}`,
      c:          `int maxSubArray(int*nums,int n){\n    int m=nums[0],c=nums[0];\n    for(int i=1;i<n;i++){c=c+nums[i]>nums[i]?c+nums[i]:nums[i];m=m>c?m:c;}\n    return m;\n}`,
      cpp:        `int maxSubArray(vector<int>&nums){\n    int m=nums[0],c=nums[0];\n    for(int i=1;i<nums.size();i++){c=max(nums[i],c+nums[i]);m=max(m,c);}\n    return m;\n}`,
    },
  },
];

export const DIFFICULTIES: ClassroomDifficulty[] = ['easy', 'medium', 'hard'];