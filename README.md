# Monster Trail

Browser-only retro monster RPG built with Next.js and deployed as Cloudflare Workers Assets.

This project is an original game. It avoids third-party copyrighted names, maps, dialogue, characters, and assets while keeping a familiar handheld monster-RPG structure:

- professor name registration
- first partner selection from three elemental choices
- grid-based top-down movement
- keyboard arrows, A-style interaction, X-style menu
- tall grass encounters, captures, party growth, and local save
- eight badge towns and leaders
- rival matches
- five league battles
- Hall of Records ending screen

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

## Deploy

```bash
npm run deploy
```

The Worker is configured in `wrangler.jsonc` for `monster-trail.ro1.dev`.
