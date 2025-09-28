import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import jsxA11Y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import prettier from 'eslint-plugin-prettier'
import pluginJest from 'eslint-plugin-jest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: [
      '**/.next',
      '**/node_modules',
      '**/.vscode',
      '**/package-lock.json',
      '**/eslint.config.js',
      '**/dist',
      '**/pnpm-lock.yaml',
      '**/yarn.lock',
      '**/.temp',
      '**/prisma/generated/**',
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:import/errors',
      'next',
      'next/core-web-vitals',
      'plugin:react-hooks/recommended'
    )
  ),
  {
    // update this to match your test files
    files: ['**/*.spec.js', '**/*.test.js'],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
  {
    plugins: {
      'jsx-a11y': fixupPluginRules(jsxA11Y),
      react: fixupPluginRules(react),
      prettier: fixupPluginRules(prettier),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },

        createDefaultProgram: false,
      },
    },

    settings: {
      react: {
        version: 'detect',
      },

      'import/resolver': {
        alias: {
          map: [['@', '.']],
          extensions: [
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.css',
            '.module.css',
            '.scss',
            '.json',
          ],
        },
      },
    },

    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': 'warn',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/label-has-for': 'off',
      'prettier/prettier': 'warn',
    },
  },
]
