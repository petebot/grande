<script lang="ts">
  import { resolve } from '$app/paths'

  let { children } = $props()
</script>

<main class="policy-shell">
  <a class="back-link" href={resolve('/')}>← Back to Grande Burrito</a>
  {@render children()}
</main>

<style>
  .policy-shell {
    width: min(100%, var(--width-page));
    min-height: 100vh;
    margin: 0 auto;
    padding: clamp(var(--space-4), 5vw, var(--space-8));
    background: var(--color-surface-page);
    box-shadow: var(--shadow-sheet);
  }

  .back-link {
    display: inline-flex;
    min-height: var(--target-minimum);
    align-items: center;
    color: var(--color-text);
    font-weight: 800;
  }

  :global(.policy-document) {
    max-width: var(--width-reading);
    margin-top: var(--space-7);
  }

  :global(.policy-document h1),
  :global(.policy-document h2) {
    font-family: var(--font-family-display);
    line-height: var(--line-height-tight);
  }

  :global(.policy-document h1) {
    margin: 0 0 var(--space-2);
    font-size: var(--font-size-heading-large);
  }

  :global(.policy-document h2) {
    margin: var(--space-6) 0 var(--space-2);
    font-size: var(--font-size-heading-small);
  }

  :global(.policy-document p),
  :global(.policy-document li) {
    line-height: var(--line-height-reading);
  }

  :global(.policy-document a) {
    color: var(--color-text);
    font-weight: 800;
  }

  :global(.policy-updated) {
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
  }
</style>
