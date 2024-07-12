import * as tstl from "typescript-to-lua";

export const baseCompilerOptions: Omit<tstl.CompilerOptions, "module"> = {
    rootDir: "inmemory://model/",
    luaLibImport: tstl.LuaLibImportKind.Inline,
    luaTarget: tstl.LuaTarget.Lua54,
    sourceMap: true,
    configFilePath: "inmemory://model/tsconfig.json",
    strict: true,
    lib: ["esnext"],
};
