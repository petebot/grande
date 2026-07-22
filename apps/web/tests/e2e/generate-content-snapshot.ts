import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildPublishedSnapshot, serializePublishedSnapshot } from '@grande/content'

import {
  DEVELOPMENT_REFERENCE_NOW,
  developmentContentFixture,
} from '../../../../packages/content/test/fixtures/development-content'

const e2eSnapshotPath = fileURLToPath(
  new URL('../../test-results/e2e-content.snapshot.json', import.meta.url),
)

const confirmedProvenance = {
  status: 'confirmed',
  source: 'AUTOMATED BROWSER TEST ONLY — not real-world verification.',
  verifiedAt: DEVELOPMENT_REFERENCE_NOW,
  verifiedBy: 'Automated browser test setup',
} as const

const licensedProvenance = {
  status: 'licensed',
  source: 'AUTOMATED BROWSER TEST ONLY — not a real asset license.',
  verifiedAt: DEVELOPMENT_REFERENCE_NOW,
  verifiedBy: 'Automated browser test setup',
} as const

function productionReadyTestInput() {
  return {
    ...developmentContentFixture,
    business: {
      ...developmentContentFixture.business,
      provenance: confirmedProvenance,
    },
    hoursExceptions: developmentContentFixture.hoursExceptions.map((exception) => ({
      ...exception,
      provenance: confirmedProvenance,
    })),
    menu: developmentContentFixture.menu.map((category) => ({
      ...category,
      items: category.items.map((item) => ({
        ...item,
        provenance: confirmedProvenance,
      })),
    })),
    announcements: developmentContentFixture.announcements.map((announcement) => ({
      ...announcement,
      provenance: confirmedProvenance,
    })),
    page: {
      ...developmentContentFixture.page,
      provenance: confirmedProvenance,
    },
    media: developmentContentFixture.media.map((media) => ({
      ...media,
      provenance: licensedProvenance,
      rightsStatus: 'licensed' as const,
    })),
  }
}

const snapshot = buildPublishedSnapshot(productionReadyTestInput(), {
  generatedAt: DEVELOPMENT_REFERENCE_NOW,
})

await mkdir(dirname(e2eSnapshotPath), { recursive: true })
await writeFile(e2eSnapshotPath, serializePublishedSnapshot(snapshot), 'utf8')
