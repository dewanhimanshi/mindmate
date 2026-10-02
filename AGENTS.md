## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## MindMate project notes

- Plan and decisions: `PLAN.md`.
- Static Astro site (`output: 'static'`) + React islands. `firebase.json` deploys the same build to two Hosting sites: `mindmate-bbps` (main link) and `mindmate-d7b02` (default site). No SSR, no Cloud Functions (free Spark plan).
- Firebase CLI: this directory is pinned to account `dewanhimanshi6@gmail.com` and project `mindmate-d7b02`. Deploy with `pnpm deploy` (always passes `--project`; a parent-directory mapping points elsewhere).
- All app content lives in `src/data/*.ts` (typed). `pnpm test` checks content integrity: run it after editing content.
- Design tokens are CSS variables in `src/styles/global.css`; use tone utilities (`bg-violet-soft`, `text-violet-ink`, …) rather than raw colours so high-contrast/dark themes keep working.
- Firebase is browser-only: import from `src/lib/firebase.ts` inside islands, never at the top level of `.astro` files.
