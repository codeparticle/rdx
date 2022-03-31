import { defineConfig } from 'tsup'

const baseConfig: object = {
  bundle: true,
  clean: true,
  entry: [`src/**/*`],
  external: [`redux`, `redux-saga`, `@redux-devtools/extension`],
  format: [`cjs`, `esm`],
  legacyOutput: true,
  minify: false,
  name: `build`,
  platform: `browser`,
  skipNodeModulesBundle: false,
  sourcemap: false,
  splitting: true,
  tsconfig: `./tsconfig.json`,
  dts: {
    resolve: true,
  },
}

export default defineConfig(baseConfig)
