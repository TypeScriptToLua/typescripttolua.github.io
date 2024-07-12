import { useColorMode } from "@docusaurus/theme-common";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/editor/edcore.main";
import "monaco-editor/esm/vs/basic-languages/lua/lua.contribution";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import EditorWorker from "worker-loader?filename=editor.worker.js!monaco-editor/esm/vs/editor/editor.worker.js";
import TsWorker from "worker-loader?filename=ts.worker.js!./ts.worker";

export { monaco };

export function useMonacoTheme() {
    const { colorMode } = useColorMode();
    return colorMode === "dark" ? "vs-dark" : "vs";
}

(globalThis as { MonacoEnvironment?: typeof MonacoEnvironment }).MonacoEnvironment = {
    getWorker(_workerId, label) {
        if (label === "typescript") {
            return new TsWorker();
        }

        return new EditorWorker();
    },
};
