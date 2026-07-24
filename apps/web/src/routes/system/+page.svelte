<script lang="ts">
  import type { WeeklyScheduleDay } from '@grande/content'

  import Announcement from '$lib/components/Announcement.svelte'
  import BrandMark from '$lib/components/BrandMark.svelte'
  import ContentFreshness from '$lib/components/ContentFreshness.svelte'
  import HoursStatus from '$lib/components/HoursStatus.svelte'
  import MenuItem from '$lib/components/MenuItem.svelte'
  import VisitActions from '$lib/components/VisitActions.svelte'
  import WeeklyHours from '$lib/components/WeeklyHours.svelte'
  import type { ResolvedHours } from '$lib/hours/resolve'
  import type { PublicAnnouncement, PublicMenuItem, PublicPageBusiness } from '$lib/public-page'

  let { data } = $props()

  const fixedNow = '2030-07-15T16:00:00.000Z'
  const business = {
    address: {
      country: 'US',
      locality: 'Freeport',
      postalCode: '04032',
      region: 'ME',
      street: 'Specimen address',
    },
    directionsUrl: 'https://maps.google.com/',
    name: 'Grande Burrito',
    phone: { display: '(207) 555-0144', e164: '+12075550144' },
    timezone: 'America/New_York',
  } satisfies PublicPageBusiness

  const weeklySchedule = [
    { day: 'monday', intervals: [{ closesAt: '20:00', opensAt: '11:00' }] },
    { day: 'tuesday', intervals: [{ closesAt: '20:00', opensAt: '11:00' }] },
    { day: 'wednesday', intervals: [{ closesAt: '20:00', opensAt: '11:00' }] },
    { day: 'thursday', intervals: [{ closesAt: '20:00', opensAt: '11:00' }] },
    { day: 'friday', intervals: [{ closesAt: '21:00', opensAt: '11:00' }] },
    { day: 'saturday', intervals: [{ closesAt: '21:00', opensAt: '11:00' }] },
    { day: 'sunday', intervals: [] },
  ] satisfies readonly WeeklyScheduleDay[]

  const hours = {
    activeException: null,
    currentInterval: {
      closesAt: '2030-07-16T00:00:00.000Z',
      opensAt: '2030-07-15T15:00:00.000Z',
    },
    localDate: '2030-07-15',
    nextTransition: { at: '2030-07-16T00:00:00.000Z', status: 'closed' },
    status: 'open',
    today: {
      date: '2030-07-15',
      intervals: [
        {
          closesAt: '2030-07-16T00:00:00.000Z',
          opensAt: '2030-07-15T15:00:00.000Z',
        },
      ],
      source: 'weekly',
    },
  } satisfies ResolvedHours

  const announcement = {
    kind: 'service-change',
    message: 'Closing at 7 tonight for a staff gathering.',
    startsAt: '2030-07-15T00:00:00.000Z',
    title: 'Special hours today',
  } satisfies PublicAnnouncement

  const availableItem = {
    availability: 'available',
    description:
      'Cumin chicken + seasoned rice + black beans + cheese + pineapple salsa + lime crema',
    dietaryLabels: ['gluten-free'],
    emoji: '🌯',
    heatLevel: 'medium',
    name: 'Tropical Chicken Burrito',
    priceOptions: [{ price: { amountMinor: 1400, currency: 'USD' } }],
    pricingKind: 'fixed',
  } satisfies PublicMenuItem

  const soldOutItem = {
    availability: 'sold-out',
    description: 'Baked sweet potato + rice + beans + cheese + red salsa + lime crema',
    dietaryLabels: ['vegetarian'],
    name: 'Sweet Potato Burrito',
    priceOptions: [{ price: { amountMinor: 1400, currency: 'USD' } }],
    pricingKind: 'fixed',
    seasonality: { label: 'Back tomorrow' },
  } satisfies PublicMenuItem

  const colors = [
    { label: 'Text / sign ink', token: '--color-text', value: 'var(--color-text)' },
    {
      label: 'Brand field / sign tan',
      token: '--brand-mark-field',
      value: 'var(--brand-mark-field)',
    },
    {
      label: 'Page surface',
      token: '--color-surface-page',
      value: 'var(--color-surface-page)',
    },
    {
      label: 'Subtle surface',
      token: '--color-surface-subtle',
      value: 'var(--color-surface-subtle)',
    },
    {
      label: 'Accent surface',
      token: '--color-surface-accent',
      value: 'var(--color-surface-accent)',
    },
  ] as const
</script>

<svelte:head>
  <title>Grande Burrito design system</title>
  <meta
    name="description"
    content="Development specimen for the Grande Burrito Sign & Sheet design system."
  />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main data-testid="design-system">
  <header class="system-header">
    <p class="eyebrow">Development specimen · Contract {data.contractVersion}</p>
    <h1>Sign &amp; Sheet System</h1>
    <p class="lede">
      An {data.systemStatus} design system drawn from Grande Burrito's storefront sign and the quick,
      centered rhythm of its printed menu.
    </p>
  </header>

  <section class="specimen-section" aria-labelledby="identity-heading">
    <div class="section-heading">
      <p>Identity</p>
      <h2 id="identity-heading">The sign is the anchor.</h2>
    </div>
    <div class="brand-sheet">
      <BrandMark label="Grande Burrito — burritos, margaritas, cold beer" />
      <p>
        Provisional outlined-path reconstruction. The public hero can morph this compact mark into
        its supplied tall form; reduced motion retains the compact form. Replace it when the
        business supplies or approves original artwork.
      </p>
    </div>
  </section>

  <section class="specimen-section" aria-labelledby="color-heading">
    <div class="section-heading">
      <p>Foundations</p>
      <h2 id="color-heading">Color roles</h2>
    </div>
    <ul class="swatches">
      {#each colors as color (color.token)}
        <li>
          <span class="swatch" style={`--swatch: ${color.value}`}></span>
          <strong>{color.label}</strong>
          <code>{color.token}</code>
        </li>
      {/each}
    </ul>
  </section>

  <section class="specimen-section" aria-labelledby="type-heading">
    <div class="section-heading">
      <p>Foundations</p>
      <h2 id="type-heading">Type and rhythm</h2>
    </div>
    <div class="type-specimens">
      <p class="type-brand">GRANDE</p>
      <p class="type-display">Burritos worth the stop.</p>
      <p class="type-body">
        Operational information uses the system sans-serif stack for quick reading at every size.
      </p>
    </div>
    <ol class="spacing" aria-label="Spacing scale">
      {#each [1, 2, 3, 4, 5, 6, 7, 8] as step (step)}
        <li><span class={`space-${step}`}></span><code>--space-{step}</code></li>
      {/each}
    </ol>
  </section>

  <section class="specimen-section" aria-labelledby="controls-heading">
    <div class="section-heading">
      <p>Native control foundation</p>
      <h2 id="controls-heading">Actions and states</h2>
    </div>
    <div class="control-row">
      <button type="button">Default action</button>
      <button class="focus-example" type="button">Focus-visible example</button>
      <button type="button" disabled>Unavailable</button>
    </div>
    <p class="guidance">
      Native buttons preserve keyboard behavior. Hover, active, focus-visible, disabled, wrapping,
      and 44px target states share semantic tokens.
    </p>
  </section>

  <section class="specimen-section" aria-labelledby="decision-heading">
    <div class="section-heading">
      <p>Product pattern</p>
      <h2 id="decision-heading">Can I go now?</h2>
    </div>
    <div class="decision-composition">
      <HoursStatus
        {hours}
        refreshInput={{
          hoursExceptions: [],
          timeZone: business.timezone,
          weeklySchedule,
        }}
      />
      <VisitActions {business} />
      <ContentFreshness contentSource="snapshot" generatedAt={fixedNow} />
    </div>
  </section>

  <section class="specimen-section" aria-labelledby="notice-heading">
    <div class="section-heading">
      <p>System states</p>
      <h2 id="notice-heading">Notice, failure, and continuity</h2>
    </div>
    <div class="state-stack">
      <Announcement {announcement} serverNow={fixedNow} />
      <div class="failure-state" role="alert">
        <strong>Published information is temporarily unavailable.</strong>
        <span>Try again shortly or call the restaurant to confirm.</span>
      </div>
    </div>
  </section>

  <section class="specimen-section" id="menu" aria-labelledby="menu-specimen-heading">
    <div class="section-heading">
      <p>Menu component</p>
      <h2 id="menu-specimen-heading">Menu-sheet states</h2>
    </div>
    <div class="menu-grid">
      <section aria-labelledby="available-heading">
        <h3 id="available-heading">Available</h3>
        <MenuItem item={availableItem} />
      </section>
      <section aria-labelledby="sold-out-heading">
        <h3 id="sold-out-heading">Sold out + long content</h3>
        <MenuItem item={soldOutItem} />
      </section>
    </div>
  </section>

  <section class="specimen-section" aria-labelledby="weekly-heading">
    <div class="section-heading">
      <p>Hours component</p>
      <h2 id="weekly-heading">Weekly schedule</h2>
    </div>
    <div class="hours-sheet"><WeeklyHours schedule={weeklySchedule} /></div>
  </section>
</main>

<style>
  main {
    width: min(100%, var(--width-page));
    min-height: 100vh;
    margin: 0 auto;
    padding: clamp(var(--space-4), 4vw, var(--space-7));
    background: var(--color-surface-page);
    box-shadow: var(--shadow-sheet);
  }

  main > * + * {
    margin-top: var(--space-section);
  }

  .system-header {
    padding-bottom: var(--space-6);
    border-bottom: var(--border-strong);
  }

  .eyebrow,
  .section-heading > p {
    margin: 0;
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1,
  h2,
  h3,
  p {
    margin-top: 0;
  }

  h1,
  h2,
  h3 {
    font-family: var(--font-family-display);
    line-height: var(--line-height-tight);
  }

  h1 {
    max-width: 12ch;
    margin-bottom: var(--space-4);
    font-size: var(--font-size-display);
    letter-spacing: -0.04em;
  }

  h2 {
    margin-bottom: 0;
    font-size: var(--font-size-heading-large);
  }

  h3 {
    margin-bottom: var(--space-2);
    font-size: var(--font-size-heading-small);
  }

  .lede,
  .guidance {
    max-width: var(--width-prose);
    margin-bottom: 0;
    font-size: var(--font-size-lead);
  }

  .specimen-section,
  .state-stack,
  .decision-composition {
    display: grid;
    gap: var(--space-5);
  }

  .section-heading {
    display: grid;
    gap: var(--space-2);
  }

  .brand-sheet,
  .hours-sheet {
    padding: var(--space-4);
    border: var(--border-hairline);
    background: var(--color-surface-subtle);
  }

  .brand-sheet p {
    max-width: var(--width-prose);
    margin: var(--space-3) 0 0;
    color: var(--color-text-muted);
  }

  .swatches {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .swatches li {
    display: grid;
    gap: var(--space-2);
  }

  .swatch {
    min-height: 7rem;
    border: var(--border-hairline);
    background: var(--swatch);
  }

  code {
    overflow-wrap: anywhere;
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
  }

  .type-specimens {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-5);
    border: var(--border-hairline);
  }

  .type-specimens p {
    margin: 0;
  }

  .type-brand {
    font-family: var(--font-family-brand);
    font-size: var(--font-size-heading-large);
    line-height: var(--line-height-tight);
  }

  .type-display {
    font-family: var(--font-family-display);
    font-size: var(--font-size-heading-medium);
    line-height: var(--line-height-tight);
  }

  .type-body {
    max-width: var(--width-prose);
  }

  .spacing {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .spacing li {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .spacing span {
    display: block;
    min-height: var(--space-2);
    background: var(--color-surface-brand);
  }

  .space-1 {
    width: var(--space-1);
  }
  .space-2 {
    width: var(--space-2);
  }
  .space-3 {
    width: var(--space-3);
  }
  .space-4 {
    width: var(--space-4);
  }
  .space-5 {
    width: var(--space-5);
  }
  .space-6 {
    width: var(--space-6);
  }
  .space-7 {
    width: var(--space-7);
  }
  .space-8 {
    width: var(--space-8);
  }

  .control-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  button {
    min-height: var(--target-minimum);
    padding: var(--space-2) var(--space-4);
    border: var(--border-strong);
    border-radius: var(--radius-pill);
    background: var(--color-surface-brand);
    color: var(--color-on-brand);
    cursor: pointer;
    font-weight: 800;
    transition:
      background var(--motion-fast) var(--motion-ease),
      color var(--motion-fast) var(--motion-ease);
  }

  button:hover:not(:disabled) {
    background: var(--color-surface-accent);
    color: var(--color-text);
  }

  button:active:not(:disabled) {
    transform: translateY(var(--space-1));
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .focus-example {
    outline: 3px solid var(--color-focus-ring);
    outline-offset: 3px;
    box-shadow: 0 0 0 2px var(--color-focus-gap);
  }

  .decision-composition,
  .failure-state {
    padding: var(--space-4);
    border: var(--border-hairline);
    background: var(--color-surface-subtle);
  }

  .failure-state {
    display: grid;
    gap: var(--space-1);
    border-left: 0.4rem solid var(--color-border-strong);
  }

  .menu-grid {
    display: grid;
    gap: var(--space-6);
  }

  @media (min-width: 48rem) {
    .specimen-section {
      grid-template-columns: minmax(12rem, 0.35fr) minmax(0, 1fr);
    }

    .specimen-section > .section-heading + * {
      grid-column: 2;
    }

    .menu-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    button {
      transition: none;
    }

    button:active:not(:disabled) {
      transform: none;
    }
  }
</style>
