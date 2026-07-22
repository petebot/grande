import { loadPublicEnvironment } from '$lib/server/env'

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = () => ({
  siteUrl: loadPublicEnvironment().siteUrl,
})
