<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Game state (progress, score, achievements, settings) lives in `src/game/store.ts` via localStorage + useSyncExternalStore; why: single-player game with no accounts, autosave without a backend.
- Puzzle content lives only in `src/game/puzzles.ts`; why: one place to add/edit puzzles and stages.
- PWA is manifest-only (`public/manifest.webmanifest`), no service worker; why: installability without stale-cache risk in preview.
