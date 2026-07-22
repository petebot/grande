<script lang="ts">
  import type { BusinessProfile } from '@grande/content'

  let { business }: { business: BusinessProfile } = $props()
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
    min-height: 44px;
    align-items: center;
    justify-content: center;
    padding: 0.6rem 0.75rem;
    border: 2px solid #26372c;
    border-radius: 999px;
    color: #26372c;
    font-weight: 800;
    line-height: 1.15;
    text-align: center;
    text-decoration: none;
  }

  a:hover {
    background: #f2e8d8;
  }

  a:focus-visible {
    outline: 3px solid #8a251f;
    outline-offset: 3px;
  }

  a.primary {
    background: #26372c;
    color: #fffdf7;
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
