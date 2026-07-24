# Grande Burrito web app

The public SvelteKit app renders restaurant-controlled content from Sanity, with a validated
deployment snapshot for continuity. Google Places can optionally enrich the visit section with a
current public rating and review count.

## Local development

Copy the repository `.env.example` to `apps/web/.env.local`, populate the Sanity values, then run:

```sh
pnpm --filter @grande/web dev
```

The design-system specimen is available at `/system` in development.

## Google Places setup

The integration does not require access to Grande Burrito's Google Business Profile. It uses public
Place Details data and remains disabled until both server-only variables are configured.

1. Create or select a Google Cloud project and enable billing.
2. Enable **Places API (New)**.
3. Create an API key and restrict it to the Places API. Add application restrictions compatible with
   the production host where possible.
4. Find and verify Grande Burrito's Place ID using Google's Place ID Finder or a one-off Text Search
   request. Confirm the name, address, and phone before saving it.
5. Set these values locally and in the deployment environment:

```sh
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
```

Never add a `PUBLIC_` prefix to the API key. The browser calls the local `/api/google-place`
endpoint, which keeps the key server-side and returns only the rating, review count, review link,
and required provider attributions.

The endpoint uses `Cache-Control: private, no-store` because ordinary storage of Places rating data
is not permitted. It requests only `rating`, `userRatingCount`, Google Maps links, and attributions;
Google bills the request at the highest tier represented by those fields. If configuration is
missing, the Google card is omitted. If the configured provider times out or returns invalid data,
the live values are omitted, the direct Google Maps link remains, and the restaurant-controlled
page continues to work. Configure a conservative quota and billing alert for the Places API because
the public no-store endpoint performs a billable request for each successful card load.

## Validation

From the repository root:

```sh
pnpm check
pnpm test
pnpm build
```
