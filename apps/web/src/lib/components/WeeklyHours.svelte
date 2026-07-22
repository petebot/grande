<script lang="ts">
  import type { WeeklyScheduleDay } from '@grande/content'

  let { schedule }: { schedule: readonly WeeklyScheduleDay[] } = $props()

  function dayName(day: WeeklyScheduleDay['day']): string {
    return `${day.slice(0, 1).toUpperCase()}${day.slice(1)}`
  }

  function localTime(value: string): string {
    const [hour, minute] = value.split(':').map(Number)

    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(2000, 0, 1, hour, minute)))
  }

  function intervalLabel(opensAt: string, closesAt: string): string {
    const overnight = closesAt < opensAt ? ' next day' : ''
    return `${localTime(opensAt)}–${localTime(closesAt)}${overnight}`
  }
</script>

<dl class="weekly-hours">
  {#each schedule as day (day.day)}
    <div>
      <dt>{dayName(day.day)}</dt>
      <dd>
        {#if day.intervals.length === 0}
          Closed
        {:else}
          {day.intervals
            .map(({ opensAt, closesAt }) => intervalLabel(opensAt, closesAt))
            .join(', ')}
        {/if}
      </dd>
    </div>
  {/each}
</dl>

<style>
  .weekly-hours {
    display: grid;
    gap: 0;
    margin: 0;
  }

  .weekly-hours div {
    display: grid;
    grid-template-columns: minmax(7rem, 0.8fr) 1.5fr;
    gap: 1rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid #cfc5b4;
  }

  dt {
    font-weight: 700;
  }

  dd {
    margin: 0;
    text-align: right;
  }
</style>
