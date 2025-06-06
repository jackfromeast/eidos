import { parseSync } from '@oxc-parser/wasm';

function extractFunction(code: string, functionName: string): string | null {
    const ast = parseSync(code, {
        sourceType: 'module',
        sourceFilename: 'file.tsx',
    }).program;

    for (const node of ast.body) {
        if (node.type === 'FunctionDeclaration' && node.id && node.id.name === functionName) {
            return code.slice(node.start, node.end);
        }
        if (node.type === 'ExportNamedDeclaration' && node.declaration && node.declaration.type === 'FunctionDeclaration' && node.declaration.id && node.declaration.id.name === functionName) {
            return code.slice(node.declaration.start, node.declaration.end);
        }
    }

    return null;
}

export { extractFunction };