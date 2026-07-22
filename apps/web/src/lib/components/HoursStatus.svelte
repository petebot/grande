<script lang="ts">
  import { onMount } from 'svelte'

  import { resolveHours, type ResolvedHours, type ResolveHoursInput } from '$lib/hours/resolve'

  const MAX_REFRESH_DELAY_MS = 5 * 60 * 1_000

  let {
    hours,
    refreshInput,
  }: {
    hours: ResolvedHours
    refreshInput: Omit<ResolveHoursInput, 'now'>
  } = $props()

  let clientHours = $state<ResolvedHours | undefined>()
  const currentHours = $derived(clientHours ?? hours)
  const timeZone = $derived(refreshInput.timeZone)

  onMount(() => {
    let refreshTimer: number | undefined

    function scheduleRefresh(): void {
      const now = new Date()
      clientHours = resolveHours({ ...refreshInput, now })
      const transitionAt = clientHours.nextTransition
        ? new Date(clientHours.nextTransition.at).getTime()
        : undefined
      const delay =
        transitionAt !== undefined && transitionAt > now.getTime()
          ? Math.min(MAX_REFRESH_DELAY_MS, transitionAt - now.getTime())
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

  function time(isoDateTime: string): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone,
    }).format(new Date(isoDateTime))
  }

  function opening(isoDateTime: string): string {
    const openingDate = new Date(isoDateTime)
    const localDate = new Intl.DateTimeFormat('en-CA', {
      day: '2-digit',
      month: '2-digit',
      timeZone,
      year: 'numeric',
    }).format(openingDate)

    if (localDate === currentHours.localDate) return `Opens at ${time(isoDateTime)}`

    const day = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone }).format(openingDate)
    return `Opens ${day} at ${time(isoDateTime)}`
  }

  const statusLabel = $derived(currentHours.status === 'open' ? 'Open now' : 'Closed')
  const transitionLabel = $derived(
    currentHours.status === 'open' && currentHours.nextTransition
      ? `Closes at ${time(currentHours.nextTransition.at)}`
      : currentHours.nextTransition
        ? opening(currentHours.nextTransition.at)
        : 'Call to confirm today’s hours',
  )
  const todayLabel = $derived(
    currentHours.today.intervals.length === 0
      ? 'Closed today'
      : currentHours.today.intervals
          .map(({ opensAt, closesAt }) => `${time(opensAt)}–${time(closesAt)}`)
          .join(', '),
  )
</script>

<section
  class="hours-status"
  data-testid="hours-status"
  aria-atomic="true"
  aria-labelledby="current-hours-heading"
  aria-live="polite"
>
  <p class:open={currentHours.status === 'open'} class="status" id="current-hours-heading">
    {statusLabel}
  </p>
  <p class="transition">{transitionLabel}</p>
  <p class="today"><strong>Today:</strong> {todayLabel}</p>
  {#if currentHours.activeException?.publicNote}
    <p class="exception">{currentHours.activeException.publicNote}</p>
  {/if}
</section>

<style>
  .hours-status {
    display: grid;
    gap: 0.2rem;
    padding: 1rem;
    border: var(--border-strong);
    border-radius: var(--radius-medium);
    background: var(--color-surface-page);
  }

  p {
    margin: 0;
  }

  .status {
    color: var(--color-text);
    font-family: var(--font-family-display);
    font-size: clamp(1.5rem, 7vw, 2.2rem);
    font-weight: 700;
    line-height: 1;
  }

  .status.open {
    color: var(--color-text);
  }

  .transition {
    font-size: 1.05rem;
    font-weight: 700;
  }

  .today,
  .exception {
    font-size: 0.95rem;
  }

  .exception {
    margin-top: 0.35rem;
    padding-top: 0.5rem;
    border-top: 1px solid currentColor;
  }
</style>
