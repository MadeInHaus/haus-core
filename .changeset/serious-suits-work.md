---
"@madeinhaus/nextjs-page-transition": major
---

Removed CSS module imports in favor of runtime style injection for compatibility with Turbopack's CSS lifecycle management. CSS imports should be removed from `_app.tsx`.
