<script lang="ts">
  import { resolve } from '$app/paths'
  import type { Announcement } from '@grande/content'

  let { announcement }: { announcement: Announcement } = $props()

  const hasExternalAction = $derived(
    announcement.action ? /^[a-z][a-z\d+.-]*:/i.test(announcement.action.url) : false,
  )
</script>

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

<style>
  aside {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    border-left: 0.4rem solid #245c38;
    background: #f2e8d8;
  }

  aside.urgent {
    border-left-color: #8a251f;
  }

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-family: Georgia, 'Times New Roman', serif;
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
