<script lang="ts">
  import type { BusinessTimezone } from '@grande/content'

  import type { ResolvedHours } from '$lib/hours/resolve'

  let {
    hours,
    timeZone,
  }: {
    hours: ResolvedHours
    timeZone: BusinessTimezone
  } = $props()

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

    if (localDate === hours.localDate) return `Opens at ${time(isoDateTime)}`

    const day = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone }).format(openingDate)
    return `Opens ${day} at ${time(isoDateTime)}`
  }

  const statusLabel = $derived(hours.status === 'open' ? 'Open now' : 'Closed')
  const transitionLabel = $derived(
    hours.status === 'open' && hours.nextTransition
      ? `Closes at ${time(hours.nextTransition.at)}`
      : hours.nextTransition
        ? opening(hours.nextTransition.at)
        : 'Call to confirm today’s hours',
  )
  const todayLabel = $derived(
    hours.today.intervals.length === 0
      ? 'Closed today'
      : hours.today.intervals
          .map(({ opensAt, closesAt }) => `${time(opensAt)}–${time(closesAt)}`)
          .join(', '),
  )
</script>

<section class="hours-status" data-testid="hours-status" aria-labelledby="current-hours-heading">
  <p class:open={hours.status === 'open'} class="status" id="current-hours-heading">
    {statusLabel}
  </p>
  <p class="transition">{transitionLabel}</p>
  <p class="today"><strong>Today:</strong> {todayLabel}</p>
  {#if hours.activeException?.publicNote}
    <p class="exception">{hours.activeException.publicNote}</p>
  {/if}
</section>

<style>
  .hours-status {
    display: grid;
    gap: 0.2rem;
    padding: 1rem;
    border: 2px solid currentColor;
    border-radius: 0.75rem;
    background: #fffdf7;
  }

  p {
    margin: 0;
  }

  .status {
    color: #8a251f;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(1.5rem, 7vw, 2.2rem);
    font-weight: 700;
    line-height: 1;
  }

  .status.open {
    color: #245c38;
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
