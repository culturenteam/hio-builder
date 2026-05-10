# /deploy — hio-builder Netlify Deploy

Deploys the current state of `D:\Vibe Coding\hio-builder` to Netlify.

**Netlify site ID:** `9a001066-8b8c-410a-afe7-96a7eb4bbf1d`  
**Live URL:** https://hio-builder.netlify.app

## Steps

1. Run `npm run build` in `D:\Vibe Coding\hio-builder` to verify the build passes.
2. Call `netlify-deploy-services-updater` with `siteId: "9a001066-8b8c-410a-afe7-96a7eb4bbf1d"` to get a fresh proxy URL.
3. Run the returned `npx -y @netlify/mcp@latest --site-id 9a001066-8b8c-410a-afe7-96a7eb4bbf1d --proxy-path "..."` command from `D:\Vibe Coding\hio-builder`.
4. Wait for "Deploy is ready!"

The proxy URL expires — always get a fresh one. Never reuse from a previous session.
