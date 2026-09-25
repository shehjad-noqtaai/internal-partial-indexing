import {createClient} from '@sanity/client'

import {applyPartialIndexingSettings, attributeCountWithPartialIndexingSettings} from './index.mjs'

import yargs from 'yargs/yargs'
import {hideBin} from 'yargs/helpers'

yargs(hideBin(process.argv))
  .strict(true)
  .option('project-id', {
    type: 'string',
    describe: 'Project ID',
  })
  .option('dataset', {
    type: 'string',
    describe: 'Dataset name',
    default: 'production',
  })
  .option('staging', {
    type: 'boolean',
    describe: "Use Sanity's internal staging environment",
  })
  .option('silent', {
    type: 'boolean',
    describe: 'Do not log progress',
  })
  .hide('staging')
  .option('max-field-depth', {
    type: 'number',
    describe: 'The maximum indexed field depth',
  })
  .option('exclude-field-path', {
    type: 'array',
    describe: 'Field paths to exclude from indexing (e.g. "comments.text")',
  })
  .option('include-field-path', {
    type: 'array',
    describe: 'Field paths to include in indexing (e.g. "title", "author.name")',
  })
  .command(
    'check',
    'Returns the attribute count if a given partial indexing settings was set',
    {},
    async (argv) => {
      const client = buildClient(argv)
      const indexSettings = buildIndexSettings(argv)

      const hasSettings = Object.keys(indexSettings).length > 0
      if (!hasSettings) {
        console.warn('No indexing settings provided')
      }

      const count = await attributeCountWithPartialIndexingSettings(
        client,
        hasSettings ? indexSettings : null,
      )
      console.log(
        `Attribute count with the ${hasSettings ? 'given' : 'current'} indexing settings: ${count}`,
      )
    },
  )
  .command('apply', 'Applies the partial indexing settings to the dataset', {}, async (argv) => {
    const client = buildClient(argv)
    const indexSettings = buildIndexSettings(argv)

    if (Object.keys(indexSettings).length === 0) {
      throw new Error('At least one indexing setting must be provided')
    }

    await applyPartialIndexingSettings(client, indexSettings, {debug: console.log})
  })
  .demandCommand()
  .demandOption(['project-id']).argv

function buildClient(argv) {
  const token = process.env.SANITY_TOKEN

  if (!token) {
    throw new Error('SANITY_TOKEN environment variable required (try `sanity debug --secrets`)')
  }

  const clientOptions = {
    projectId: argv['project-id'],
    dataset: argv.dataset,
    apiVersion: '2025-09-01',
    token,
    useCdn: false,
  }

  if (argv.staging) {
    clientOptions.apiHost = 'https://api.sanity.work'
  }

  return createClient(clientOptions)
}

function buildIndexSettings(argv) {
  const settings = {}
  if (argv['max-field-depth'] !== undefined) {
    settings.maxFieldDepth = argv['max-field-depth']
  }
  if (argv['exclude-field-path'] !== undefined) {
    settings.excludeFieldPaths = argv['exclude-field-path']
  }
  if (argv['include-field-path'] !== undefined) {
    settings.includeFieldPaths = argv['include-field-path']
  }
  return settings
}
