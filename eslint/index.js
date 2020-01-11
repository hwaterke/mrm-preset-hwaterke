const {json, packageJson, lines, install, uninstall} = require('mrm-core')

function task(config) {
  // TODO Special case for react if we detect react-scripts

  // Delete legacy config file
  json('.eslintrc').delete()

  let exts = ''
  const ignores = ['node_modules/']
  const gitIgnores = ['.eslintcache']
  const packages = ['eslint']
  const oldPackages = ['jslint', 'jshint', 'tslint']
  const {eslintPreset, eslintPeerDependencies, eslintRules} = config
    .defaults({
      eslintPreset: 'eslint:recommended',
      eslintPeerDependencies: [],
    })
    .values()

  // Preset
  if (eslintPreset !== 'eslint:recommended') {
    packages.push(`eslint-config-${eslintPreset}`)
  }

  // Peer dependencies
  packages.push(...eslintPeerDependencies)

  // .eslintrc.json
  const eslintrc = json('.eslintrc.json')

  const pkg = packageJson()

  // TypeScript
  if (pkg.get('devDependencies.typescript')) {
    const parser = '@typescript-eslint/parser'
    packages.push(
      '@typescript-eslint/eslint-plugin',
      parser,
      'eslint-config-prettier',
      'eslint-plugin-import'
    )
    eslintrc.merge({
      parser,
      parserOptions: {
        project: './tsconfig.json',
      },
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
      rules: eslintRules || {},
    })
    exts = ' --ext .ts,.tsx'
  }

  eslintrc.save()

  // .eslintignore
  lines('.eslintignore')
    .add(ignores)
    .save()

  // .gitignore
  lines('.gitignore')
    .add(gitIgnores)
    .save()

  pkg
    .removeScript(/^(lint:js|eslint|jshint|jslint|tslint)$/)
    .removeScript('test', / (lint|lint:js|eslint|jshint|jslint|tslint)( |$)/)
    .removeScript('test', /\beslint|jshint|jslint|tslint\b/)
    .setScript('lint', 'eslint . --cache --fix' + exts)
    .save()

  // Dependencies
  uninstall(oldPackages)
  install(packages)
}

task.description = 'Adds ESLint'
module.exports = task
