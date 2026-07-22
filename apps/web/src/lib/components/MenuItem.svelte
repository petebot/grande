<script lang="ts">
  import type { PublicMenuItem } from '$lib/public-page'

  let { item }: { item: PublicMenuItem } = $props()

  const money = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  })

  function price(amountMinor: number): string {
    return money.format(amountMinor / 100)
  }

  function label(value: string): string {
    return value
      .split('-')
      .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
      .join(' ')
  }
</script>

<article class:sold-out={item.availability === 'sold-out'}>
  <div class="heading-row">
    <h4>{item.name}</h4>
    {#if item.availability === 'sold-out'}
      <span class="availability">Sold out</span>
    {/if}
  </div>

  {#if item.description}
    <p class="description">{item.description}</p>
  {/if}

  {#if item.pricingKind === 'fixed'}
    <ul class="prices" aria-label={`Prices for ${item.name}`}>
      {#each item.priceOptions as option, index (index)}
        <li>
          {#if option.label}<span>{option.label}</span>{/if}
          <strong>{price(option.price.amountMinor)}</strong>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="market-price">{item.marketPriceLabel}</p>
  {/if}

  {#if item.dietaryLabels.length > 0 || item.heatLevel || item.seasonality}
    <ul class="labels" aria-label={`Details for ${item.name}`}>
      {#each item.dietaryLabels as dietaryLabel (dietaryLabel)}
        <li>{label(dietaryLabel)}</li>
      {/each}
      {#if item.heatLevel}<li>{label(item.heatLevel)} heat</li>{/if}
      {#if item.seasonality}<li>{item.seasonality.label}</li>{/if}
    </ul>
  {/if}
</article>

<style>
  article {
    display: grid;
    gap: 0.55rem;
    padding: 1.1rem 0;
    border-bottom: var(--border-hairline);
  }

  article.sold-out {
    opacity: 0.68;
  }

  .heading-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }

  h4 {
    margin: 0;
    font-family: var(--font-family-display);
    font-size: clamp(1.25rem, 5.8vw, 1.75rem);
    line-height: 1.05;
  }

  .availability {
    flex: none;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .description,
  .market-price {
    margin: 0;
    line-height: 1.45;
  }

  .prices,
  .labels {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .prices {
    display: grid;
    gap: 0.25rem;
  }

  .prices li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .labels {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .labels li {
    padding: 0.2rem 0.5rem;
    border: 1px solid currentColor;
    border-radius: 999px;
    font-size: 0.75rem;
  }
</style>
