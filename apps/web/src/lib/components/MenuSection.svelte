<script lang="ts">
  import type { PublicMenuCategory } from '$lib/public-page'

  import MenuItem from './MenuItem.svelte'

  let {
    heading,
    categories,
  }: {
    heading: string
    categories: readonly PublicMenuCategory[]
  } = $props()
</script>

<section class="menu" id="menu" aria-labelledby="menu-heading">
  <h2 id="menu-heading">{heading}</h2>

  {#each categories as category (category.slug)}
    <section class="category" aria-labelledby={`category-${category.slug}`}>
      <h3 id={`category-${category.slug}`}>{category.name}</h3>
      {#if category.description}<p class="category-description">{category.description}</p>{/if}
      <div class="items">
        {#each category.items as item, index (index)}
          <MenuItem {item} />
        {/each}
      </div>
    </section>
  {/each}
</section>

<style>
  .menu {
    display: grid;
    gap: 2.5rem;
    scroll-margin-top: 1rem;
  }

  h2,
  .category > h3 {
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    line-height: 1;
  }

  h2 {
    font-size: clamp(2.25rem, 11vw, 4rem);
    text-align: center;
  }

  .category {
    display: grid;
    gap: 0.5rem;
  }

  .category > h3 {
    font-size: clamp(1.65rem, 7vw, 2.5rem);
  }

  .category-description {
    max-width: 65ch;
    margin: 0;
    line-height: 1.5;
  }
</style>
