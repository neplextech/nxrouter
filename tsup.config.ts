import { defineConfig } from "tsup";

export default defineConfig({
    clean: true,
    bundle: true,
    skipNodeModulesBundle: true,
    format: ['cjs', 'esm'],
    entry: ['./src/index.ts'],
    dts: true,
    silent: true,
    sourcemap: 'inline'
});