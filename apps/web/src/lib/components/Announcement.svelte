<script lang="ts">
  import { resolve } from '$app/paths'
  import { onMount } from 'svelte'

  import type { PublicAnnouncement } from '$lib/public-page'

  const MAX_REFRESH_DELAY_MS = 5 * 60 * 1_000

  let {
    announcement,
    serverNow,
  }: {
    announcement: PublicAnnouncement
    serverNow: string
  } = $props()

  function isVisibleAt(now: number): boolean {
    const startsAt = Date.parse(announcement.startsAt)
    const endsAt = announcement.endsAt ? Date.parse(announcement.endsAt) : undefined

    return startsAt <= now && (endsAt === undefined || endsAt > now)
  }

  let clientVisibility = $state<boolean | undefined>()
  const isVisible = $derived(clientVisibility ?? isVisibleAt(Date.parse(serverNow)))

  onMount(() => {
    let refreshTimer: number | undefined

    function scheduleRefresh(): void {
      const now = Date.now()
      clientVisibility = isVisibleAt(now)
      const nextBoundary = [Date.parse(announcement.startsAt), announcement.endsAt]
        .filter((value): value is number | string => value !== undefined)
        .map((value) => (typeof value === 'number' ? value : Date.parse(value)))
        .filter((value) => value > now)
        .sort((left, right) => left - right)[0]
      const delay = nextBoundary
        ? Math.min(MAX_REFRESH_DELAY_MS, nextBoundary - now)
        : MAX_REFRESH_DELAY_MS

      refreshTimer = window.setTimeout(scheduleRefresh, Math.max(1, delay))
    }

    function refreshWhenVisible(): void {
      if (document.visibilityState !== 'visible') return
      if (refreshTimer) window.clearTimeout(refreshTimer)
      scheduleRefresh()
    }

    scheduleRefresh()
    document.addEventListener('visibilitychange', refreshWhenVisible)

    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  })

  const hasExternalAction = $derived(
    announcement.action ? /^[a-z][a-z\d+.-]*:/i.test(announcement.action.url) : false,
  )
</script>

{#if isVisible}
  <aside class:urgent={announcement.kind === 'closure' || announcement.kind === 'service-change'}>
    <div>
      <h2>{announcement.title}</h2>
      <p>{announcement.message}</p>
    </div>
    {#if announcement.action}
      {#if hasExternalAction}
        <a href={announcement.action.url} rel="external">{announcement.action.label}</a>
      {:else}
        <!-- CMS-authored internal links cannot be part of SvelteKit's generated route union. -->
        <a href={resolve(announcement.action.url as '/')}>{announcement.action.label}</a>
      {/if}
    {/if}
  </aside>
{/if}

<style>
  aside {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    border-left: 0.4rem solid var(--color-brand-ink);
    background: var(--color-paper-warm);
  }

  aside.urgent {
    border-left-color: var(--color-brand-tan);
  }

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-family: var(--font-display);
    font-size: 1.25rem;
  }

  p {
    margin-top: 0.2rem;
  }

  a {
    flex: none;
    color: currentColor;
    font-weight: 800;
  }

  @media (max-width: 28rem) {
    aside {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>
