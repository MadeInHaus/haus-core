# @madeinhaus/disclosure

## 4.0.0

### Major Changes

- d029b6b: ### Major Breaking Changes to `@madeinhaus/disclosure`

    - **Removed Controlled Accordion Support:** The ability to control `Disclosure` using the `registerDetails` function has been removed. This change simplifies the API and aligns with the intended behavior of `Disclosure` as an uncontrolled component.
    - **Updated `defaultOpen` Logic:** The `defaultOpen` prop now ensures that the initially open `Disclosure.Details` is present during hydration, improving SSR compatibility.
    - **Simplified State Management:** Internal logic has been streamlined.

## 3.2.0

### Minor Changes

- f1653d8: Add aupport for React 19

## 3.1.0

### Minor Changes

- 88e7be9: Add aupport for React 19

## 3.0.0

### Major Changes

- 4d730c8: Replace yarn with pnpm, rollup with tsup and other updates

## 2.5.0

### Minor Changes

- 2c2e578: Default controlled open index to -1, Add isOpen default awareness of defaultOpenIndex

## 2.4.0

### Minor Changes

- 5d1a6fa: Remove warning for adding a className to Details element

## 2.3.0

### Minor Changes

- 66602af: Remove "use client" directive, opting for handling outside package

## 2.2.0

### Minor Changes

- fdbcf69: For NextJS 13 compatibility, prepend files with 'use client', if applicable

## 2.1.0

### Minor Changes

- d99d441: Enhanced Disclosure component for Accordion behavior using registerDetails.

## 2.0.1

### Patch Changes

- cbf442b: update readme files

## 2.0.0

### Major Changes

- ccd02ff: Sets postcss extraction for css, which now requires css to be imported

## 1.1.0

### Minor Changes

- b9a3740: Removes sourcemaps option from rollup config

## 1.0.0

### Major Changes

- 6ee38fd: Initial release
