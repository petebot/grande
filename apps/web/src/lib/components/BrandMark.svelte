<script lang="ts">
  let { label = 'Grande Burrito' }: { label?: string } = $props()
</script>

<div class="brand-mark" data-testid="brand-mark">
  <svg viewBox="0 0 960 430" role="img" aria-label={label}>
    <defs>
      <pattern id="brand-rivets" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="5" class="rivet" />
      </pattern>
    </defs>

    <rect class="rail" x="40" y="24" width="880" height="42" rx="6" />
    <rect x="50" y="24" width="860" height="42" fill="url(#brand-rivets)" />

    <text class="wordmark" x="480" y="300" text-anchor="middle">GRANDE</text>

    <rect class="rail" x="40" y="316" width="880" height="42" rx="6" />
    <rect x="50" y="316" width="860" height="42" fill="url(#brand-rivets)" />

    <g class="descriptor" aria-hidden="true">
      <text x="192" y="410" text-anchor="middle">BURRITOS</text>
      <rect x="336" y="388" width="14" height="14" rx="1" />
      <text x="480" y="410" text-anchor="middle">MARGARITAS</text>
      <rect x="658" y="388" width="14" height="14" rx="1" />
      <text x="795" y="410" text-anchor="middle">COLD BEER</text>
    </g>
  </svg>
</div>

<style>
  .brand-mark {
    width: min(100%, 60rem);
    padding: clamp(0.5rem, 2.5vw, 1.25rem);
    overflow: hidden;
    background: var(--color-brand-tan);
    color: var(--color-brand-ink);
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .rail,
  .wordmark,
  .descriptor {
    fill: currentColor;
  }

  .rivet {
    fill: var(--color-brand-tan);
  }

  .wordmark,
  .descriptor {
    font-family: var(--font-brand);
    font-weight: 400;
  }

  .wordmark {
    font-size: 258px;
    letter-spacing: 7px;
  }

  .descriptor {
    font-size: 43px;
    letter-spacing: 1px;
  }

  .descriptor rect {
    fill: none;
    stroke: currentColor;
    stroke-width: 5;
  }
</style>
