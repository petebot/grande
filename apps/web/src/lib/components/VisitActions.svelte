<script lang="ts">
  import type { PublicPageBusiness } from '$lib/public-page'

  let { business }: { business: PublicPageBusiness } = $props()
</script>

<nav class="actions" aria-label="Visit actions">
  <a class="primary" href="#menu">View menu</a>
  <a href={`tel:${business.phone.e164}`} rel="external">Call {business.phone.display}</a>
  <a href={business.directionsUrl} rel="external">Get directions</a>
  {#if business.orderingUrl}
    <a href={business.orderingUrl} rel="external">Order online</a>
  {/if}
</nav>

<style>
  .actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
  }

  a {
    display: inline-flex;
    min-height: var(--target-minimum);
    align-items: center;
    justify-content: center;
    padding: 0.6rem 0.75rem;
    border: var(--border-strong);
    border-radius: var(--radius-pill);
    color: var(--color-text);
    font-weight: 800;
    line-height: 1.15;
    text-align: center;
    text-decoration: none;
  }

  a:hover {
    background: var(--color-surface-subtle);
  }

  a.primary {
    background: var(--color-surface-brand);
    color: var(--color-on-brand);
  }

  @media (min-width: 48rem) {
    .actions {
      display: flex;
      flex-wrap: wrap;
    }

    a {
      min-width: 9rem;
    }
  }
</style>
