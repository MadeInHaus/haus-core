# @madeinhaus/nextjs-page-transition

## 4.1.0

### Minor Changes

- 88e7be9: Add aupport for React 19

### Patch Changes

- Updated dependencies [88e7be9]
    - @madeinhaus/utils@2.1.0

## 4.0.1

### Patch Changes

- b4af716: Update README

## 4.0.0

### Major Changes

- 4d730c8: Replace yarn with pnpm, rollup with tsup and other updates

### Patch Changes

- Updated dependencies [4d730c8]
    - @madeinhaus/utils@2.0.0

## 3.1.1

### Patch Changes

- cbf442b: update readme files

## 3.1.0

### Minor Changes

- 5f29fb3: Chore: Update docs and README

## 3.0.0

### Major Changes

- ccd02ff: Sets postcss extraction for css, which now requires css to be imported

## 2.0.1

### Patch Changes

- b61de9a: Fix scroll to hash on initial load

## 2.0.0

### Major Changes

- 1c63ce7: Complete rewrite of useNextCssRemovalPrevention to fix various issues with manual management of page stylesheets.
  Now returns a function that cleans up stylesheets when the out phase is complete and the new page mounts to avoid style scope collisions.
  Fixes scroll restoration in project setups where basePath or i18n is used.

## 1.2.4

### Patch Changes

- 88c2ca5: Fix LinkType to allow HTMLAnchorElement attributes as props

## 1.2.3

### Patch Changes

- 9d47224: Set opacity to 0.001 as soon as possible to prevent flash on load

## 1.2.2

### Patch Changes

- 040029a: Sets initial opacity to 0.001 instead of 0.0001 to make Lighthouse happy, and uses fill-mode "both" for the default transitions

## 1.2.1

### Patch Changes

- 3de6b74: Fix page transitions when used without PageTransitionContext

## 1.2.0

### Minor Changes

- b9a3740: Removes sourcemaps option from rollup config

## 1.1.1

### Patch Changes

- 7ab7eec: Publish

## 1.1.0

### Minor Changes

- 172cc87: Call useNextCssRemovalPrevention in PageTransition so you don't have to explicitly call it yourself

## 1.0.0

### Major Changes

- 6ee38fd: Initial release
