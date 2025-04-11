import { defineConfig } from 'tsup';
import { esbuildPluginUseMacro } from 'use-macro';

export default defineConfig({
    clean: true,
    bundle: true,
    skipNodeModulesBundle: true,
    format: ['cjs', 'esm'],
    entry: ['./src/index.ts'],
    dts: true,
    silent: true,
    sourcemap: 'inline',
    esbuildPlugins: [esbuildPluginUseMacro()]
});
