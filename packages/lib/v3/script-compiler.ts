import { IScript } from "@/worker/web-worker/meta-table/script";
import { compileCode } from "./compiler";
import { compileLexicalCode } from "./lexical-compiler";
import { transform } from "./esbuild";


export const scriptCodeCompile = async (
    sourceCode: string
): Promise<string> => {
    try {
        const result = await transform(sourceCode, {
            loader: "ts",
            target: "es2020",
            minify: false,
            keepNames: true,
            charset: "utf8",
        });

        return result.code
    } catch (err: any) {
        throw new Error(err.message)
    }

};

async function blockCodeCompile(ts_code: string): Promise<string> {
    const result = await compileCode(ts_code);
    if (result.error) {
        console.error("Error compiling block code:", result.error);
        throw new Error(result.error);
    }
    return result.code;
}

async function pythonCodeCompile(code: string): Promise<string> {
    // Assuming python code does not need compilation in this context
    return code;
}

async function lexicalCodeCompile(ts_code: string): Promise<string> {
    const result = await compileLexicalCode(ts_code);
    if (result.error) {
        console.error("Error compiling lexical code:", result.error);
        throw new Error(result.error);
    }
    return result.code;
}

export async function compileScript(
    script: Pick<IScript, "type" | "ts_code" | "code">
): Promise<string> {
    const ts_code = script.ts_code;
    const code = script.code;

    const compileMethod = getCompileMethod(script)
    if (!compileMethod) {
        return code || ""
    }
    return compileMethod(ts_code || code || "")
}

export function getCompileMethod(script: Pick<IScript, "type">) {
    if (script.type === "py_script") {
        return pythonCodeCompile;
    }
    if (script.type === "doc_plugin") {
        return lexicalCodeCompile;
    }
    if (script.type === "m_block") {
        return blockCodeCompile;
    }
    if (script.type === "script") {
        return scriptCodeCompile;
    }
    return undefined
}
