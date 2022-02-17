/* eslint @typescript-eslint/no-unsafe-assignment: 0, @typescript-eslint/no-unsafe-member-access: 0 */
import resolve from "@rollup/plugin-node-resolve"
// import ts from 'rollup-plugin-ts'
import ts from 'rollup-plugin-ts'

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
  external: [`redux`, `redux-saga`, `@redux-devtools/extension`],
  plugins: [
    // Compile TypeScript files
    ts({
      transpiler: `swc`,
      typescript: require(`typescript`),
      browserslist: false,
    }),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      rootDir: `src`,
      dedupe: [`react`, `react-dom`, `react-redux`, `redux`, `redux-saga`, `@redux-devtools/extension`],
    }),
  ],
}
