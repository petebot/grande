<script lang="ts">
  import { onMount } from 'svelte'

  import {
    BRAND_GEOMETRY,
    BRAND_LETTERS,
    COMPACT_LETTER_PATHS,
    RAIL_PATH,
    TALL_LETTER_PATHS,
  } from '$lib/design/brand-morph'

  let { animated = false, label = 'Grande Burrito' }: { animated?: boolean; label?: string } =
    $props()

  let root: HTMLDivElement

  onMount(() => {
    if (!animated) return

    let disposed = false
    let cleanup: (() => void) | undefined

    async function setupMorph() {
      const [{ gsap }, { MorphSVGPlugin }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/MorphSVGPlugin'),
        import('gsap/ScrollTrigger'),
      ])
      if (disposed) return

      gsap.registerPlugin(MorphSVGPlugin, ScrollTrigger)
      const scene = root.closest<HTMLElement>('[data-brand-scene]')
      if (!scene) return

      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const context = gsap.context(() => {
          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              end: 'bottom bottom',
              invalidateOnRefresh: true,
              scrub: 0.35,
              start: 'top top',
              trigger: scene,
            },
          })

          for (const letter of BRAND_LETTERS) {
            timeline.to(
              root.querySelector(`[data-brand-letter="${letter}"]`),
              { morphSVG: TALL_LETTER_PATHS[letter] },
              0,
            )
          }

          timeline.to(
            root.querySelector('[data-bottom-rail]'),
            { attr: { transform: `translate(0 ${BRAND_GEOMETRY.tallBottomRailY})` } },
            0,
          )
        }, root)

        return () => context.revert()
      })

      cleanup = () => media.revert()
      ScrollTrigger.refresh()
    }

    void setupMorph()

    return () => {
      disposed = true
      cleanup?.()
    }
  })
</script>

<div class:animated class="brand-mark" data-testid="brand-mark" bind:this={root}>
  <svg
    aria-label={label}
    fill="none"
    role="img"
    viewBox={`0 0 ${BRAND_GEOMETRY.width} ${animated ? BRAND_GEOMETRY.tallHeight : BRAND_GEOMETRY.compactHeight}`}
  >
    <path class="ink" d={RAIL_PATH} />
    <g transform={`translate(${BRAND_GEOMETRY.letterOffsetX} ${BRAND_GEOMETRY.letterOffsetY})`}>
      {#each BRAND_LETTERS as letter (letter)}
        <path class="ink" d={COMPACT_LETTER_PATHS[letter]} data-brand-letter={letter} />
      {/each}
    </g>
    <path
      class="ink"
      d={RAIL_PATH}
      data-bottom-rail
      transform={`translate(0 ${BRAND_GEOMETRY.compactBottomRailY})`}
    />
  </svg>
</div>

<style>
  .brand-mark {
    width: min(100%, 60rem);
    margin: 0 auto;
    color: var(--brand-mark-ink);
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .ink {
    fill: currentColor;
  }

  @media (prefers-reduced-motion: reduce) {
    .brand-mark.animated {
      aspect-ratio: 737.29 / 327.67;
      overflow: hidden;
    }
  }
</style>
