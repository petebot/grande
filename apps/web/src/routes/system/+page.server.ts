import { dev } from '$app/environment'
import { env as privateEnvironment } from '$env/dynamic/private'
import { error } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = () => {
  if (!dev && privateEnvironment.GRANDE_E2E_MODE !== '1') {
    error(404, 'Not found')
  }

  return { contractVersion: '1.0.0', systemStatus: 'emerging' }
}
