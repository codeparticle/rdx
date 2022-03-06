module.exports = {
  parser: `@typescript-eslint/parser`,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: `module`,
    project: [
      `tsconfig.json`,
      `tsconfig.dev.json`,
    ],
  },
  plugins: [
    `@typescript-eslint`,
    `unused-imports`,
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  extends: [
    `eslint:recommended`,
    `plugin:@typescript-eslint/recommended`,
    `plugin:@typescript-eslint/recommended-requiring-type-checking`,
    `eslint-config-standard-with-typescript`,
  ],
  rules: {
    '@typescript-eslint/comma-dangle': [`error`, `always-multiline`],
    '@typescript-eslint/comma-spacing': [`error`],
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/indent': [`error`, 2],
    '@typescript-eslint/member-delimiter-style': [2, {
      multiline: {
        delimiter: `none`,
      },
      singleline: {
        delimiter: `semi`,
        requireLast: false,
      },
    }],
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-unsafe-argument': 0,
    '@typescript-eslint/no-unsafe-assignment': 0,
    '@typescript-eslint/no-unsafe-call': 0,
    '@typescript-eslint/no-unsafe-member-access': 0,
    '@typescript-eslint/no-unsafe-return': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/prefer-regexp-exec': 0,
    '@typescript-eslint/quotes': [`error`, `backtick`],
    '@typescript-eslint/restrict-template-expressions': 0,
    '@typescript-eslint/semi': [`error`, `never`],
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/triple-slash-reference': 0,
    'comma-dangle': 0,
    'comma-spacing': 0,
    indent: 0,
    'no-multiple-empty-lines': [`error`, {
      max: 1,
      maxBOF: 0,
      maxEOF: 1,
    }],
    'no-prototype-builtins': 0,
    'object-curly-spacing': [`error`, `always`],
    'padding-line-between-statements': [`error`, {
      blankLine: `always`,
      next: `return`,
      prev: `*`,
    }, {
      blankLine: `never`,
      next: `*`,
      prev: `return`,
    }, {
      blankLine: `always`,
      next: `*`,
      prev: [`const`, `let`, `var`],
    }, {
      blankLine: `any`,
      next: [`const`, `let`, `var`],
      prev: [`const`, `let`, `var`],
    }, {
      blankLine: `always`,
      next: `*`,
      prev: [`block-like`],
    }, {
      blankLine: `always`,
      next: `block-like`,
      prev: [`*`],
    }, {
      blankLine: `always`,
      next: `*`,
      prev: [`import`],
    }, {
      blankLine: `any`,
      next: `import`,
      prev: [`import`],
    }],
    quotes: 0,
    'unused-imports/no-unused-imports': `error`,
    'unused-imports/no-unused-vars': [
      `warn`,
      {
        args: `after-used`,
        argsIgnorePattern: `^_`,
        vars: `all`,
        varsIgnorePattern: `^_`,
      },
    ],
  },
}
