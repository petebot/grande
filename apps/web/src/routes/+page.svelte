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
  let showHeroPhoto = $state(true)

  const address = $derived(
    `${data.content.business.address.street}, ${data.content.business.address.locality}, ${data.content.business.address.region} ${data.content.business.address.postalCode}`,
  )
</script>

<Seo view={data.seo} />

<main data-content-source={data.contentSource}>
  <div class="brand-scene" data-brand-scene>
    <div class="brand-stage">
      <div class="brand-lockup">
        <BrandMark animated label={data.content.business.name} />
      </div>

      {#if showHeroPhoto}
        <figure class="hero-photo" aria-hidden="true">
          <img
            src="/brand/burrito-hero.png"
            alt=""
            width="720"
            height="1024"
            loading="eager"
            decoding="async"
            onerror={() => {
              showHeroPhoto = false
            }}
          />
        </figure>
      {/if}
    </div>
  </div>

  <section class="hero" aria-labelledby="page-heading">
    <div class="hero-copy">
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
    width: min(100%, var(--width-page));
    min-height: 100vh;
    margin: 0 auto;
    padding: clamp(1rem, 4vw, 3rem);
    background: var(--color-surface-page);
    box-shadow: var(--shadow-sheet);
  }

  main > * + * {
    margin-top: var(--space-section);
  }

  main > .brand-scene + .hero {
    margin-top: clamp(0.2rem, 1.2vw, 0.75rem);
  }

  .brand-scene {
    height: calc(100svh + clamp(32rem, 75svh, 52rem));
  }

  .brand-stage {
    --scene-art-width: min(100%, 44rem, calc((100svh - var(--space-4)) * 0.703125));
    --brand-art-width: min(calc(100% + clamp(3rem, 10vw, 8rem)), 52rem);

    position: sticky;
    top: 0;
    height: 100svh;
    overflow: clip;
  }

  .brand-lockup {
    position: absolute;
    bottom: var(--space-2);
    left: 50%;
    width: var(--brand-art-width);
    transform: translateX(-50%);
    z-index: 1;
  }

  .hero {
    display: grid;
    gap: clamp(1.25rem, 4vw, 2.5rem);
    padding-bottom: 2rem;
    border-bottom: var(--border-strong);
    position: relative;
    z-index: 2;
  }

  .hero-copy,
  .intro,
  .decision-panel {
    display: grid;
    align-content: start;
    gap: 1rem;
  }

  .hero-copy {
    gap: clamp(1rem, 3vw, 2rem);
  }

  .eyebrow {
    margin: 0;
    color: var(--color-text);
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.08em;
  }

  h1,
  h2,
  h3 {
    font-family: var(--font-family-display);
  }

  h1 {
    max-width: 10ch;
    margin: 0;
    font-size: clamp(2.8rem, 11vw, 5.8rem);
    letter-spacing: -0.04em;
    line-height: var(--line-height-display);
  }

  .hero-body {
    max-width: var(--width-prose);
    margin: 0;
    font-size: var(--font-size-lead);
    line-height: 1.55;
  }

  .hero-photo {
    position: absolute;
    bottom: clamp(-11rem, -19svh, -9rem);
    left: 50%;
    width: var(--scene-art-width);
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    filter: drop-shadow(var(--shadow-food));
    transform: translateX(-50%);
    z-index: 4;
  }

  .hero-photo img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
    transform: translateZ(0);
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
    background: var(--color-surface-subtle);
  }

  .story h2,
  .visit h2 {
    margin: 0 0 1rem;
    font-size: clamp(2rem, 9vw, 4rem);
    line-height: 1;
  }

  .story p,
  .story ul {
    max-width: var(--width-reading);
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
    border-top: var(--border-strong);
    font-size: 0.85rem;
  }

  footer span {
    max-width: 28ch;
    text-align: right;
  }

  @media (min-width: 48rem) {
    .hero-photo {
      bottom: clamp(-15rem, -24svh, -12rem);
    }

    .hero-copy {
      grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.65fr);
      gap: clamp(1.5rem, 3vw, 2.5rem);
      align-items: end;
    }

    .visit {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .brand-scene {
      height: auto;
    }

    .brand-stage {
      position: relative;
      height: auto;
      overflow: visible;
    }

    .brand-lockup,
    .hero-photo {
      position: relative;
      bottom: auto;
      left: auto;
      width: min(100%, 44rem);
      transform: none;
    }

    .hero-photo {
      margin: clamp(-13rem, -28vw, -7rem) auto clamp(-1.5rem, -2.5vw, -0.5rem);
    }
  }
</style>
