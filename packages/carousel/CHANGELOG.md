# @madeinhaus/carousel

## 3.2.0

### Minor Changes

- 88e7be9: Add aupport for React 19

### Patch Changes

- Updated dependencies [88e7be9]
    - @madeinhaus/utils@2.1.0

## 3.1.0

### Minor Changes

- 65f7375: Fixes bug that caused infinite loops under certain conditions, adds direction prop and implements vertical carousels, Fixes carousel not reacting to changes in children

## 3.0.0

### Major Changes

- 4d730c8: Replace yarn with pnpm, rollup with tsup and other updates

### Patch Changes

- Updated dependencies [4d730c8]
    - @madeinhaus/utils@2.0.0

## 2.5.0

### Minor Changes

- 583fef3: bugfix: Measure container width using offsetWidth instead of getBoundingClientRect

## 2.4.0

### Minor Changes

- 6e613cc: Add options argument to moveIntoView method

## 2.3.1

### Patch Changes

- 1dbaeab: Bugfix: Allow click events to go through when disabled

## 2.3.0

### Minor Changes

- e19efc6: Fix intermittent problem where the isDisabled state isn't updated

## 2.2.0

### Minor Changes

- 66602af: Remove "use client" directive, opting for handling outside package

## 2.1.0

### Minor Changes

- fdbcf69: For NextJS 13 compatibility, prepend files with 'use client', if applicable

## 2.0.1

### Patch Changes

- cbf442b: update readme files

## 2.0.0

### Major Changes

- ccd02ff: Sets postcss extraction for css, which now requires css to be imported

## 1.1.1

### Patch Changes

- 1283131: Bugfix: Adapt to stronger typed 'last()' util function

## 1.1.0

### Minor Changes

- b9a3740: Removes sourcemaps option from rollup config

## 1.0.0

### Major Changes

- 6ee38fd: Initial release
