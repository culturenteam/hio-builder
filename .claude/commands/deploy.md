# /deploy — hio-builder Netlify Deploy

Deploys the current state of `D:\Vibe Coding\hio-builder` to Netlify via GitHub.

**Netlify site ID:** `9a001066-8b8c-410a-afe7-96a7eb4bbf1d`  
**Live URL:** https://build.hio.space (also https://hio-builder.netlify.app)  
**GitHub:** https://github.com/culturenteam/hio-builder

## Steps

1. Run `npm run build` in `D:\Vibe Coding\hio-builder` to verify the build passes.
2. Stage and commit any pending changes with `git add` + `git commit`.
3. Run `git push origin main` from `D:\Vibe Coding\hio-builder`.
4. Netlify automatically builds and deploys on push. Monitor at https://app.netlify.com/projects/hio-builder

## Notes

- No manual deploy token needed — Netlify is connected to the GitHub repo.
- The `/deploy` skill in the **portfolio project** (`D:\Vibe Coding\claude`) is a different command for a different site. They are separate.
- hio-builder Supabase project: `yfvqmzaqhayveqllchuh`
