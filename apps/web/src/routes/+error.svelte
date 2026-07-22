<script lang="ts">
  import { page } from '$app/state'

  const heading = $derived(page.status === 404 ? 'That page wandered off.' : 'We hit a snag.')
  const message = $derived(
    page.status === 404
      ? "We couldn't find the page you were looking for."
      : (page.error?.message ?? "We couldn't load this page. Please try again in a moment."),
  )
</script>

<svelte:head>
  <title>{page.status}: {heading}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main>
  <section aria-labelledby="error-heading">
    <p class="eyebrow">Error {page.status}</p>
    <h1 id="error-heading">{heading}</h1>
    <p class="message">{message}</p>

    {#if page.error?.requestId}
      <p class="reference">
        If you contact us about this problem, share reference
        <code>{page.error.requestId}</code>.
      </p>
    {/if}

    <a href="/">Back to the homepage</a>
  </section>
</main>

<style>
  :global(html) {
    color-scheme: light;
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
    background: #f8f0dc;
    color: #24160f;
  }

  :global(body) {
    margin: 0;
  }

  main {
    display: grid;
    min-height: 100svh;
    place-items: center;
    padding: 2rem 1.25rem;
    box-sizing: border-box;
  }

  section {
    box-sizing: border-box;
    width: min(100%, 38rem);
    padding: clamp(2rem, 7vw, 4.5rem);
    border: 2px solid #24160f;
    border-radius: 1.5rem;
    background: #fffaf0;
    box-shadow: 0.5rem 0.5rem 0 #d94d2a;
  }

  .eyebrow {
    margin: 0 0 0.75rem;
    color: #a5371c;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(2.5rem, 10vw, 5.5rem);
    line-height: 0.95;
    letter-spacing: -0.04em;
  }

  .message {
    max-width: 31rem;
    margin: 1.5rem 0 0;
    font-size: clamp(1.05rem, 3vw, 1.3rem);
    line-height: 1.55;
  }

  .reference {
    margin: 1.5rem 0 0;
    color: #684d3e;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  code {
    overflow-wrap: anywhere;
    color: #24160f;
    font-size: 0.85em;
  }

  a {
    display: inline-flex;
    min-height: 2.75rem;
    align-items: center;
    margin-top: 2rem;
    padding: 0 1.1rem;
    border: 2px solid #24160f;
    border-radius: 999px;
    background: #f4bd35;
    color: #24160f;
    font-weight: 800;
    text-decoration: none;
  }

  a:hover {
    background: #ffd360;
  }

  a:focus-visible {
    outline: 3px solid #176b55;
    outline-offset: 3px;
  }
</style>
