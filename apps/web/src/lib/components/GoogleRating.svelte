<script lang="ts">
  import { onMount, untrack } from 'svelte'

  import type { GooglePlaceSummary } from '$lib/google-place'

  let {
    endpoint = '/api/google-place',
    fallbackUrl,
    initialSummary = null,
  }: {
    endpoint?: string
    fallbackUrl: string
    initialSummary?: GooglePlaceSummary | null
  } = $props()

  let summary = $state<GooglePlaceSummary | null>(untrack(() => initialSummary))
  let requestFinished = $state(untrack(() => initialSummary !== null))

  const countLabel = $derived(
    summary
      ? `${new Intl.NumberFormat('en-US').format(summary.reviewCount)} ${summary.reviewCount === 1 ? 'review' : 'reviews'}`
      : 'See current reviews',
  )

  onMount(async () => {
    if (summary) return

    try {
      const response = await fetch(endpoint, { cache: 'no-store' })
      if (!response.ok) return

      const value = (await response.json()) as GooglePlaceSummary
      if (
        typeof value.rating === 'number' &&
        typeof value.reviewCount === 'number' &&
        typeof value.reviewsUrl === 'string' &&
        Array.isArray(value.attributions)
      ) {
        summary = value
      }
    } catch {
      // The Google card is optional enrichment; the direct Maps link remains useful on failure.
    } finally {
      requestFinished = true
    }
  })
</script>

<aside
  class="google-rating"
  aria-labelledby="google-rating-heading"
  data-google-status={summary ? 'live' : requestFinished ? 'unavailable' : 'loading'}
  data-testid="google-rating"
>
  <p class="source-label">Guest feedback</p>
  <h3 id="google-rating-heading">Google reviews</h3>

  <div class="rating-content" aria-live="polite">
    {#if summary}
      <a
        class="rating-link"
        href={summary.reviewsUrl}
        rel="external"
        aria-label={`${summary.rating.toFixed(1)} out of 5 from ${countLabel} on Google Maps`}
      >
        <span class="rating-value"
          ><span aria-hidden="true">★</span> {summary.rating.toFixed(1)}</span
        >
        <span>{countLabel}</span>
      </a>
    {:else}
      <a class="fallback-link" href={fallbackUrl} rel="external">See reviews on Google Maps</a>
    {/if}
  </div>

  <p class="attribution">
    <span translate="no">Google Maps</span>
    {#if summary && summary.attributions.length > 0}
      {#each summary.attributions as item, index (`${item.provider}-${index}`)}
        <span aria-hidden="true"> · </span>
        {#if item.providerUri}
          <a href={item.providerUri} rel="external">{item.provider}</a>
        {:else}
          <span>{item.provider}</span>
        {/if}
      {/each}
    {/if}
  </p>
</aside>

<style>
  .google-rating {
    display: grid;
    gap: var(--space-2);
    max-width: 28rem;
    padding: var(--space-4);
    border: var(--border-hairline);
    border-radius: var(--radius-medium);
    background: var(--color-surface-page);
  }

  .source-label,
  h3,
  .attribution {
    margin: 0;
  }

  .source-label {
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h3 {
    font-family: var(--font-family-display);
    font-size: var(--font-size-heading-small);
    line-height: var(--line-height-tight);
  }

  .rating-link {
    display: flex;
    min-height: var(--target-minimum);
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    color: var(--color-text);
    font-weight: 800;
    text-underline-offset: var(--space-1);
  }

  .rating-value {
    font-size: var(--font-size-lead);
  }

  .fallback-link {
    display: inline-flex;
    min-height: var(--target-minimum);
    align-items: center;
    color: var(--color-text);
    font-weight: 800;
  }

  .attribution {
    color: var(--color-text-attribution);
    font-size: var(--font-size-small);
    font-style: normal;
    font-weight: 400;
    letter-spacing: normal;
  }

  .attribution > span:first-child {
    white-space: nowrap;
  }

  .attribution a {
    color: inherit;
  }
</style>
