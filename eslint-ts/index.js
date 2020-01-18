const {json, packageJson, lines, install, uninstall} = require('mrm-core')

function task(config) {
  // Delete legacy config file
  json('.eslintrc').delete()

  const packages = [
    'eslint',
    '@typescript-eslint/parser',
    '@typescript-eslint/eslint-plugin',
    'eslint-config-prettier',
    'eslint-plugin-import',
  ]
  const oldPackages = ['jslint', 'jshint', 'tslint']
  const eslintPlugins = ['@typescript-eslint']

  const eslintrc = json('.eslintrc.json')
  const pkg = packageJson()

  // Add stuff for react
  if (pkg.get('dependencies.react')) {
    packages.push(
      'eslint-plugin-jsx-a11y',
      'eslint-plugin-react',
      'eslint-plugin-react-hooks'
    )
    eslintrc.merge({
      root: true,
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          experimentalObjectRestSpread: true,
          jsx: true,
          legacyDecorators: true,
        },
        sourceType: 'module',
        project: './tsconfig.json',
      },
      settings: {
        react: {
          version: 'detect',
        },
        'import/resolver': {
          node: {
            extensions: [
              '.js',
              '.jsx',
              '.ts',
              '.tsx',
              '.android.js',
              '.ios.js',
            ],
          },
        },
      },
      plugins: ['@typescript-eslint', 'react', 'react-hooks'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:react/recommended',
        'prettier',
        'prettier/@typescript-eslint',
      ],
      env: {
        browser: true,
        commonjs: true,
        es6: true,
        jest: true,
        node: true,
      },
      rules: {
        curly: ['error', 'all'],
        'react/default-props-match-prop-types': 'error',
        'react/no-direct-mutation-state': 'error',
        'react/no-typos': 'warn',
        'react/no-unused-prop-types': 'warn',
        'react/no-will-update-set-state': 'error',
        'react/void-dom-elements-no-children': 'error',
        'linebreak-style': ['error', 'unix'],
      },
    })
  } else {
    eslintrc.merge({
      root: true,
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      settings: {
        'import/resolver': {
          node: {
            extensions: [
              '.js',
              '.jsx',
              '.ts',
              '.tsx',
              '.android.js',
              '.ios.js',
            ],
          },
        },
      },
      plugins: eslintPlugins,
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/errors',
        'plugin:import/warnings',
        'prettier',
        'prettier/@typescript-eslint',
      ],
      rules: {
        curly: ['error', 'all'],
        'linebreak-style': ['error', 'unix'],
      },
    })
  }

  eslintrc.save()

  // .eslintignore
  lines('.eslintignore')
    .add(['node_modules', 'dist', 'coverage'])
    .save()

  pkg
    .removeScript(/^(lint:js|eslint|jshint|jslint|tslint)$/)
    .removeScript('test', / (lint|lint:js|eslint|jshint|jslint|tslint)( |$)/)
    .removeScript('test', /\beslint|jshint|jslint|tslint\b/)
    .setScript('lint', 'eslint . --ext .js,.jsx,.ts,.tsx')
    .save()

  // Dependencies
  uninstall(oldPackages)
  install(packages)
}

task.description = 'Adds ESLint for typescript'
module.exports = task
