# Contract: Public Experience

## Page hierarchy

The primary page presents, in a mobile-first order determined during design exploration:

- brand identity and concise value proposition;
- current hours state plus today's hours;
- primary action cluster: view menu, call, directions, and ordering when confirmed;
- active operational announcement when present;
- complete categorized menu with prices and verified labels;
- short authentic story or positioning copy;
- location, weekly hours, contact details, and map/directions handoff;
- footer with canonical name and essential legal/ownership links if required.

The exact visual composition is governed by the design system, not CMS fields.

## Essential information

Menu, prices, current/today hours, weekly hours, address, phone, and directions are
server-rendered in semantic HTML. They remain readable with JavaScript disabled and are
not hidden behind a carousel, modal-only interaction, hover state, or client fetch.

## Current status

The interface reports one of:

- Open now, with today's closing time
- Closed, with the next opening day/time
- Closed today
- Hours unavailable, with a prompt to call

The message respects ranged exceptions, deterministic specificity/priority, and
overnight intervals. It does not claim an open state when schedule data is invalid or
provisional.

## Action behavior

- Phone uses a valid `tel:` link and a visible formatted number.
- Directions use confirmed coordinates/address and open an external map safely.
- Ordering appears only when an owner-confirmed URL is configured.
- In-page menu navigation uses real anchors and preserves browser behavior.
- External destinations are labeled clearly; new-window behavior is not forced unless
  required by the destination.

## Accessibility

- One descriptive page title and one logical heading hierarchy.
- Landmark regions and navigation have accessible names where needed.
- All controls work by keyboard with visible focus.
- Text and essential graphics meet WCAG 2.2 AA contrast.
- Touch targets are at least 44 by 44 CSS pixels where practical.
- Images have intentional alternative text or are explicitly decorative.
- Motion respects `prefers-reduced-motion`; no essential meaning depends on motion.
- Status and announcement updates do not unexpectedly steal focus.

## Responsive behavior

The P1 journey is complete at 320 CSS pixels wide without horizontal scrolling. Menu
item names, descriptions, labels, and prices wrap without collision. Sticky or fixed
actions cannot obscure page content or browser controls. Desktop layouts preserve a
clear reading order rather than merely stretching the mobile composition.

## Performance and resilience

- LCP <= 2.5 seconds, INP <= 200 ms, and CLS <= 0.1 at the 75th percentile target.
- Essential public-route JavaScript <= 100 kB compressed, excluding preview code.
- Responsive images declare dimensions and appropriate source sizes.
- Fonts are self-hosted or system-based unless licensing and performance justify a
  third-party source; text remains visible during font loading.
- No third-party map, social feed, analytics, or ordering script may block essentials.
- Valid fallback content renders when the live CMS request fails.

## Search and sharing

The page has canonical URL, unique title and description, Open Graph metadata, social
image when licensed, and Restaurant/LocalBusiness structured data built only from
confirmed facts. Content visible to users and structured data must agree.

## Brand review

Before visual implementation is accepted, the design-system route records:

- confirmed logo variants and clear-space behavior;
- palette tokens and verified contrast pairings;
- type scale and fallback behavior;
- shape, border, shadow, spacing, and motion vocabulary;
- button, link, card, announcement, menu, hours, and empty/error states;
- mobile and desktop compositions using representative real/provisional content.

Any invented brand element is labeled as a proposed extension in portfolio notes and
must be approved before being represented as existing Grande Burrito branding.

## Journey acceptance

### Decide and visit

At a 390 by 844 viewport, a new visitor can determine what the restaurant serves,
whether it is open, approximate price, location, and how to call/get directions within
the 30-second moderated-test target.

### Explore the menu

A visitor can scan every active category, associate each price with its item, and
understand only verified dietary/heat labels without opening additional pages.

### Degraded dependency

With Sanity requests forced to fail and JavaScript disabled, the last deployed menu,
hours, phone, address, and directions remain usable.
