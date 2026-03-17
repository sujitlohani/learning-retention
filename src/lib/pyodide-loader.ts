let instance: any = null;

export async function getPyodide(): Promise<any> {
    if (instance) return instance;
    // pyodide script is loaded via next/script or layout script tag
    // it exposes `loadPyodide` on the window object
    const py = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
    });
    instance = py;
    return py;
}
