import { getPyodide } from './pyodide-loader';

export interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

export interface RunResult {
    output: string;
    passed: boolean[];
    error: string | null;
}

export function runJavaScript(code: string, testCases: TestCase[]): RunResult {
    let outputLog = '';
    const passed = new Array(testCases.length).fill(false);
    let errorMsg: string | null = null;

    try {
        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            // Wrap user code in a function that executes their code AND calls solution(input)
            const fn = new Function('input', `${code}; return solution(input)`);
            const rawReturn = fn(tc.input);
            const actualOutput = String(rawReturn).trim();

            if (!tc.isHidden && i === 0) {
                outputLog += actualOutput; // just log the first visible test case output
            }

            if (actualOutput === tc.expectedOutput.trim()) {
                passed[i] = true;
            }
        }
        if (outputLog === '') {
            outputLog = 'Code ran successfully without visible output.';
        }
    } catch (e: any) {
        errorMsg = e.message || 'Unknown error occurred while running JavaScript';
        outputLog = errorMsg || 'Unknown error';
    }

    return { output: outputLog, passed, error: errorMsg };
}

export async function runPython(code: string, testCases: TestCase[]): Promise<RunResult> {
    const passed = new Array(testCases.length).fill(false);
    let outputLog = '';
    let errorMsg: string | null = null;

    try {
        const pyodide = await getPyodide();
        
        // redirect stdout
        pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
        `);

        // First evaluate the user code defining 'solution'
        pyodide.runPython(code);

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            
            // clear stdout for this test case
            pyodide.runPython(`sys.stdout.seek(0)\nsys.stdout.truncate(0)`);

            // call solution(input)
            // Python eval works cleanly if tc.input is valid python literal
            const runCode = `str(solution(${tc.input}))`;
            const rawReturn = pyodide.runPython(runCode);
            const actualOutput = String(rawReturn).trim();
            
            if (!tc.isHidden && i === 0) {
                // Get stdout log
                outputLog = pyodide.runPython('sys.stdout.getvalue()') + actualOutput;
            }

            if (actualOutput === tc.expectedOutput.trim()) {
                passed[i] = true;
            }
        }

        if (outputLog === '') {
            outputLog = 'Code ran successfully without visible output.';
        }
    } catch (e: any) {
        errorMsg = e.message || 'Unknown Python error';
        outputLog = errorMsg || 'Unknown error';
    }

    return { output: outputLog, passed, error: errorMsg };
}
