# @madeinhaus/textural-video

## 2.0.0

### Major Changes

- e0ef130: Sunset mp4, webm and isTransparent props in favor of {primary/secondary}Video{Url/Type}, primaryVideoType now defaults to "video/webm", and secondaryVideoType to "video/mp4"

## 1.6.0

### Minor Changes

- 66602af: Remove "use client" directive, opting for handling outside package

## 1.5.0

### Minor Changes

- fdbcf69: For NextJS 13 compatibility, prepend files with 'use client', if applicable

## 1.4.0

### Minor Changes

- ba2202d: Deprecate mp4 and webm props in favor of primaryVideoUrl and secondaryVideoUrl

### Patch Changes

- cbf442b: update readme files

## 1.3.0

### Minor Changes

- ccd02ff: Sets postcss extraction for css, which now requires css to be imported

## 1.2.0

### Minor Changes

- b9a3740: Removes sourcemaps option from rollup config

## 1.1.0

### Minor Changes

- 74a3fd4: Change threshold prop to optional

## 1.0.0

### Major Changes

- 6ee38fd: Initial release
