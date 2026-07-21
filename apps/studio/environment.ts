type StudioEnvironmentSource = Record<string, string | undefined>

export interface StudioEnvironment {
  projectId: string
  dataset: string
}

const DEVELOPMENT_PROJECT_ID = 'w6vleqf7'
const DEVELOPMENT_DATASET = 'development'

function readStudioValue(
  source: StudioEnvironmentSource,
  variableName: 'SANITY_STUDIO_PROJECT_ID' | 'SANITY_STUDIO_DATASET',
  fallback: string,
  pattern: RegExp,
): string {
  const value = source[variableName]?.trim() || fallback

  if (!pattern.test(value)) {
    throw new Error(`Invalid ${variableName}; check .env.example for the accepted format`)
  }

  return value
}

export function loadStudioEnvironment(source: StudioEnvironmentSource): StudioEnvironment {
  return {
    projectId: readStudioValue(
      source,
      'SANITY_STUDIO_PROJECT_ID',
      DEVELOPMENT_PROJECT_ID,
      /^[a-z0-9]+$/,
    ),
    dataset: readStudioValue(
      source,
      'SANITY_STUDIO_DATASET',
      DEVELOPMENT_DATASET,
      /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/,
    ),
  }
}
