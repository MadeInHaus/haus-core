---
"@madeinhaus/nextjs-page-transition": major
---

Complete rewrite of useNextCssRemovalPrevention to fix various issues with manual management of page stylesheets.
Now returns a function that cleans up stylesheets when the out phase is complete and the new page mounts to avoid style scope collisions.
Fixes scroll restoration in project setups where basePath or i18n is used.
