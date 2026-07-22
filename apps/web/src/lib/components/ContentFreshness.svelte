<script lang="ts">
  import type { ContentSource, IsoDateTime } from '@grande/content'

  let {
    contentSource,
    generatedAt,
  }: {
    contentSource: ContentSource
    generatedAt: IsoDateTime
  } = $props()

  const savedAt = $derived(
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/New_York',
    }).format(new Date(generatedAt)),
  )
</script>

{#if contentSource !== 'live'}
  <p class="freshness" data-testid="content-freshness" role="status">
    Showing the most recently saved information while the live service reconnects.
    <span>Saved {savedAt} Eastern.</span>
  </p>
{/if}

<style>
  .freshness {
    margin: 0;
    padding: 0.7rem 0.8rem;
    border: var(--border-hairline);
    border-radius: var(--radius-small);
    background: var(--color-surface-subtle);
    font-size: var(--font-size-small);
    line-height: 1.4;
  }

  span {
    display: block;
  }
</style>
