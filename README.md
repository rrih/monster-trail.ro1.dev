# Monster Trail

Browser-only retro monster RPG built with Next.js and deployed as Cloudflare Workers Assets.

This project is an original game. It avoids third-party copyrighted names, maps, dialogue, characters, and assets while keeping a complete RPG arc:

- trainer name registration by Dr. Lumen
- first partner selection
- wild encounters, captures, party growth, and local save
- eight town wardens and sigils
- rival matches
- five summit league battles
- Hall of Memory ending screen

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
