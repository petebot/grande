<script lang="ts">
  import Announcement from '$lib/components/Announcement.svelte'
  import BrandMark from '$lib/components/BrandMark.svelte'
  import ContentFreshness from '$lib/components/ContentFreshness.svelte'
  import HoursStatus from '$lib/components/HoursStatus.svelte'
  import MenuSection from '$lib/components/MenuSection.svelte'
  import Seo from '$lib/components/Seo.svelte'
  import VisitActions from '$lib/components/VisitActions.svelte'
  import WeeklyHours from '$lib/components/WeeklyHours.svelte'

  let { data } = $props()

  const address = $derived(
    `${data.content.business.address.street}, ${data.content.business.address.locality}, ${data.content.business.address.region} ${data.content.business.address.postalCode}`,
  )
</script>

<Seo view={data.seo} />

<main data-content-source={data.contentSource}>
  <div class="brand-lockup">
    <BrandMark label={data.content.business.name} />
  </div>

  <section class="hero" aria-labelledby="page-heading">
    <div class="intro">
      {#if data.content.page.heroEyebrow}
        <p class="eyebrow">{data.content.page.heroEyebrow}</p>
      {/if}
      <h1 id="page-heading">{data.content.page.heroHeading}</h1>
      <p class="hero-body">{data.content.page.heroBody}</p>
    </div>

    <div class="decision-panel">
      <HoursStatus
        hours={data.currentHours}
        refreshInput={{
          hoursExceptions: data.content.hoursExceptions,
          timeZone: data.content.business.timezone,
          weeklySchedule: data.content.weeklySchedule,
        }}
      />
      <VisitActions business={data.content.business} />
      <ContentFreshness contentSource={data.contentSource} generatedAt={data.generatedAt} />
    </div>
  </section>

  {#if data.content.announcements.length > 0}
    <section class="announcements" aria-label="Notices" aria-live="polite">
      {#each data.content.announcements as announcement, index (index)}
        <Announcement {announcement} serverNow={data.serverNow} />
      {/each}
    </section>
  {/if}

  <MenuSection heading={data.content.page.menuHeading} categories={data.content.menu} />

  {#if data.content.page.storyBlocks.length > 0}
    <section class="story" aria-labelledby="story-heading">
      <h2 id="story-heading">{data.content.page.storyHeading ?? 'Our story'}</h2>
      {#each data.content.page.storyBlocks as block, index (index)}
        {#if block.listItem}
          <ul><li>{block.text}</li></ul>
        {:else}
          <p>{block.text}</p>
        {/if}
      {/each}
    </section>
  {/if}

  <section class="visit" aria-labelledby="location-heading">
    <div>
      <h2 id="location-heading">{data.content.page.locationHeading}</h2>
      <address>{address}</address>
      <p>
        <a href={`tel:${data.content.business.phone.e164}`} rel="external">
          {data.content.business.phone.display}
        </a>
      </p>
      <p>
        <a href={data.content.business.directionsUrl} rel="external">
          Get directions to this location
        </a>
      </p>
    </div>
    <div>
      <h3>Weekly hours</h3>
      <WeeklyHours schedule={data.content.weeklySchedule} />
    </div>
  </section>

  <footer>
    <strong>{data.content.business.name}</strong>
    <span>{address}</span>
  </footer>
</main>

<style>
  main {
    width: min(100%, 76rem);
    min-height: 100vh;
    margin: 0 auto;
    padding: clamp(1rem, 4vw, 3rem);
    background: var(--color-paper);
    box-shadow: var(--shadow-sheet);
  }

  main > * + * {
    margin-top: var(--space-section);
  }

  main > .brand-lockup + .hero {
    margin-top: clamp(1.5rem, 5vw, 3rem);
  }

  .hero {
    display: grid;
    gap: 1.5rem;
    padding-bottom: 2rem;
    border-bottom: var(--border-ink);
  }

  .intro,
  .decision-panel {
    display: grid;
    align-content: start;
    gap: 1rem;
  }

  .eyebrow {
    margin: 0;
    color: var(--color-brand-ink);
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.08em;
  }

  h1,
  h2,
  h3 {
    font-family: var(--font-display);
  }

  h1 {
    max-width: 15ch;
    margin: 0;
    font-size: clamp(2.6rem, 13vw, 6.5rem);
    letter-spacing: -0.04em;
    line-height: 0.92;
  }

  .hero-body {
    max-width: 60ch;
    margin: 0;
    font-size: clamp(1rem, 3vw, 1.2rem);
    line-height: 1.55;
  }

  .announcements {
    display: grid;
    gap: 0.75rem;
  }

  .announcements:empty {
    display: none;
  }

  .story,
  .visit {
    padding: clamp(1.25rem, 5vw, 3rem);
    background: var(--color-paper-warm);
  }

  .story h2,
  .visit h2 {
    margin: 0 0 1rem;
    font-size: clamp(2rem, 9vw, 4rem);
    line-height: 1;
  }

  .story p,
  .story ul {
    max-width: 68ch;
    line-height: 1.6;
  }

  .visit {
    display: grid;
    gap: 2rem;
  }

  .visit h3 {
    margin-top: 0;
    font-size: 1.5rem;
  }

  address {
    max-width: 30ch;
    font-size: 1.1rem;
    font-style: normal;
    line-height: 1.45;
  }

  .visit a {
    color: currentColor;
    font-weight: 800;
  }

  footer {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 1.25rem;
    border-top: var(--border-ink);
    font-size: 0.85rem;
  }

  footer span {
    max-width: 28ch;
    text-align: right;
  }

  @media (min-width: 48rem) {
    .hero {
      grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.65fr);
      gap: 3rem;
    }

    .visit {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4rem;
    }
  }
</style>
