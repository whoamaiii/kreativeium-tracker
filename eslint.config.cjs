const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        document: 'readonly',
        window: 'readonly',
        setTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        console: 'readonly',
        confirm: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      'no-console': 'warn',
      'import/order': ['error', { 'newlines-between': 'always' }],
    },
  },
  prettier,
]; 