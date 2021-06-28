/* eslint @typescript-eslint/no-unsafe-assignment: 0, @typescript-eslint/no-unsafe-member-access: 0 */
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "rollup-plugin-typescript2"
import sourceMaps from "rollup-plugin-sourcemaps"
import json from "@rollup/plugin-json"
import { terser } from 'rollup-plugin-terser'

const pkg = require(`./package.json`)

const libraryName = `rdx`

export default {
  input: `src/${libraryName}.ts`,
  output: [
    {
      file: pkg.main,
      name: libraryName,
      format: `umd`,
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: `es`,
      sourcemap: true,
    },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  watch: {
    include: `src/**`,
  },
  external: [`redux`, `redux-saga`, `redux-devtools-extension`],
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({
      typescript: require(`typescript`),
    }),

    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      modulesOnly: true,
    }),

    // Resolve source maps to the original source
    sourceMaps(),

    // minify things
    terser(),
  ],
}
