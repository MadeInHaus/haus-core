# @madeinhaus/nextjs-page-transition

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
