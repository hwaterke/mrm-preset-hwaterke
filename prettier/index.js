const {json, packageJson, install} = require('mrm-core')

const PRETTIER_PATTERN = '**/*.{js,jsx,ts,tsx,css,scss,json,md,yml}'

const PRETTIER_CONFIG = {
  endOfLine: 'lf',
  bracketSpacing: false,
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  proseWrap: 'always',
}

function task() {
  json('.prettierrc.json')
    .set(PRETTIER_CONFIG)
    .save()

  packageJson()
    .setScript('format', `prettier --write "${PRETTIER_PATTERN}"`)
    .save()

  // Dependencies
  install(['prettier'], {dev: true})
}

task.description = 'Adds Prettier'
module.exports = task
