import type { SchemaTypeDefinition } from 'sanity'

import { announcement } from './announcement'
import { businessProfile } from './businessProfile'
import { hoursException } from './hoursException'
import { media } from './media'
import { menuCategory } from './menuCategory'
import { menuItem } from './menuItem'
import { pageContent } from './pageContent'
import { provenance } from './provenance'
import { weeklySchedule } from './weeklySchedule'

export const schemaTypes: SchemaTypeDefinition[] = [
  provenance,
  businessProfile,
  weeklySchedule,
  hoursException,
  menuCategory,
  menuItem,
  announcement,
  pageContent,
  media,
]
