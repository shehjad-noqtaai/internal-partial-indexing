import {SanityClient} from '@sanity/client'

/**
 * @typedef PartialIndexSettings
 * @prop {number} maxFieldDepth The maximum indexed field depth.
 */

/**
 * Applies partial indexing settings on the dataset configured in a Sanity client.
 * This might take some time if you have many documents.
 *
 * @param {SanityClient} client
 * @param {PartialIndexSettings} partialIndexSettings
 * @param {Object} options
 * @param {(msg: string) => void} [options.debug]
 * @returns void
 */
export async function applyPartialIndexingSettings(
  client,
  partialIndexSettings,
  {debug = null} = {},
) {
  const {projectId, dataset} = client.config()
  if (debug) debug(`Applying indexing settings on ${projectId}.${dataset}...`)
  for (;;) {
    const res = await client.request({
      uri: `/datasets/${dataset}/settings/indexing`,
      method: 'PUT',
      body: {settings: {partialIndexSettings}},
    })

    switch (res.status) {
      case 'indexSettingsBatchApplied':
        if (debug) debug(`Dataset was too big to process in one go. Doing another pass...`)
        break
      case 'indexSettingsActive':
        if (debug) debug('Partial indexing settings successfully applied!')
        return
      default:
        throw new Error(`Unknown status received: ${res.status}`)
    }
  }
}

/**
 * Returns the attribute count if a given partial indexing settings is applied.
 * @param {SanityClient} client
 * @param {PartialIndexSettings | null} partialIndexSettings
 * @returns number
 */
export async function attributeCountWithPartialIndexingSettings(client, partialIndexSettings) {
  const {dataset} = client.config()
  const body = {}
  if (partialIndexSettings) {
    body.searchStoreSettings = {partialIndexSettings}
  }
  const res = await client.request({
    uri: `/data/stats/${dataset}`,
    method: 'POST',
    body,
  })
  return res.fields.count.value
}
