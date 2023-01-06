# Turborepo Design System Starter

This guide explains how to use a React design system starter powered by:

- 🏎 [Turborepo](https://turbo.build/repo) — High-performance build system for Monorepos
- 🚀 [React](https://reactjs.org/) — JavaScript library for user interfaces
- 🛠 [Rollup](https://rollupjs.org/guide/en/) — A module bundler for JavaScript
- 🛠 [Tsup](https://github.com/egoist/tsup) — TypeScript bundler powered by esbuild
- 📖 [Storybook](https://storybook.js.org/) — UI component environment powered by Vite

As well as a few others tools preconfigured:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Changesets](https://github.com/changesets/changesets) for managing versioning and changelogs
- [GitHub Actions](https://github.com/changesets/action) for fully automated package publishing

## Clone the repo

```bash
git clone https://github.com/MadeInHaus/haus-ui.git
cd haus-ui
yarn install
```

### Useful Commands

- `yarn build` - Build all packages including the Storybook site
- `yarn dev` - Run all packages locally and preview with Storybook
- `yarn lint` - Lint all packages
- `yarn changeset` - Generate a changeset
- `yarn clean` - Clean up all `node_modules` and `dist` folders (runs each package's clean script)

## Turborepo

[Turborepo](https://turbo.build/repo) is a high-performance build system for JavaScript and TypeScript codebases. It was designed after the workflows used by massive software engineering organizations to ship code at scale. Turborepo abstracts the complex configuration needed for monorepos and provides fast, incremental builds with zero-configuration remote caching.

Using Turborepo simplifes managing your design system monorepo, as you can have a single lint, build, test, and release process for all packages. [Learn more](https://vercel.com/blog/monorepos-are-changing-how-teams-build-software) about how monorepos improve your development workflow.

## Apps & Packages

This Turborepo includes the following packages and applications:

- `apps/docs`: Component documentation site with Storybook
- `packages/@haus-ui/core`: Core React components
- `packages/@haus-ui/utils`: Shared React utilities

This example sets up your `.gitignore` to exclude all generated files, other folders like `node_modules` used to store your dependencies.

### Compilation

To make the core library code work across all browsers, we need to compile the raw TypeScript and React code to plain JavaScript. We can accomplish this with `vite`, which uses `rollup` to greatly improve performance.

Running `yarn build` from the root of the Turborepo will run the `build` command defined in each package's `package.json` file. Turborepo runs each `build` in parallel and caches & hashes the output to speed up future builds.

For `haus-ui-core`, the `build` command, which depends on `rollup.config.js` is the following:

```bash
rollup -c --bundleConfigAsCjs
```

`rollup` compiles `src/index.ts`, which exports all of the components in the design system, into both ES Modules and CommonJS formats as well as their TypeScript types. The `package.json` for `haus-ui-core` then instructs the consumer to select the correct format:

```json:haus-ui-core/package.json
{
  "name": "@haus-ui/core",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
}
```

Run `yarn build` to confirm compilation is working correctly. You should see a folder `haus-ui-core/dist` which contains the compiled output.

```bash
haus-ui-core
└── dist
    ├── index.js    <-- CommonJS version
    └── index.mjs   <-- ES Modules version
```

## Components

Each file inside of `haus-ui-core/src` is a component inside our design system. For example:

```tsx:haus-ui-core/src/Button/index.tsx
import * as React from "react";
import cx from "classnames";
import styles from "./Button.module.scss";

export interface ButtonProps {
  children: React.ReactNode;
  variant: "primary" | "secondary";
}

export function Button({ children, variant }: ButtonProps) {
  return (
    <button className={cx(styles.root, styles[variant])}>{children}</button>
  );
}
```

When adding a new file, ensure the component is also exported from the entry `index.tsx` file:

```tsx:haus-ui-core/src/index.ts
import * as React from "react";
export { Button, type ButtonProps } from "./Button";
// Add new component exports here
```

## Storybook

Storybook provides us with an interactive UI playground for our components. This allows us to preview our components in the browser and instantly see changes when developing locally. This example preconfigures Storybook to:

- Use Vite to bundle stories instantly (in milliseconds)
- Automatically find any stories inside the `stories/` folder
- Support using module path aliases like `@haus-ui-core` for imports
- Write MDX for component documentation pages

For example, here's the included Story for our `Button` component:

```js:apps/docs/stories/button.stories.mdx
import { Button } from "@haus-ui/core/src";
import { Meta, Story, Canvas, ArgsTable } from "@storybook/addon-docs";

<Meta title="Components/Button" component={Button} />

export const Template = ({ children, ...args }) => (
  <Button {...args}>{children}</Button>
);

# Button

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur tempor, nisl nunc egestas nisi, euismod aliquam nisl nunc euismod.

## Props

<ArgsTable story="Default" />

## Examples

<Canvas>
  <Story
    name="Default"
    argTypes={{
      variant: {
        options: ["primary", "secondary"],
        control: { type: "radio" },
      },
    }}
    args={{
      children: "Hello World",
      variant: "primary",
    }}
  >
    {Template.bind({})}
  </Story>
</Canvas>
```

This example includes a few helpful Storybook scripts:

- `yarn dev`: Starts Storybook in dev mode with hot reloading at `localhost:6006`
- `yarn build`: Builds the Storybook UI and generates the static HTML files
- `yarn preview-storybook`: Starts a local server to view the generated Storybook UI

## Versioning & Publishing Packages

This example uses [Changesets](https://github.com/changesets/changesets) to manage versions, create changelogs, and publish to npm. It's preconfigured so you can start publishing packages immediately.

You'll need to create an `NPM_TOKEN` and `GITHUB_TOKEN` and add it to your GitHub repository settings to enable access to npm. It's also worth installing the [Changesets bot](https://github.com/apps/changeset-bot) on your repository.

### Generating the Changelog

To generate your changelog, run `yarn changeset` locally:

1. **Which packages would you like to include?** – This shows which packages and changed and which have remained the same. By default, no packages are included. Press `space` to select the packages you want to include in the `changeset`.
1. **Which packages should have a major bump?** – Press `space` to select the packages you want to bump versions for.
1. If doing the first major version, confirm you want to release.
1. Write a summary for the changes.
1. Confirm the changeset looks as expected.
1. A new Markdown file will be created in the `changeset` folder with the summary and a list of the packages included.

### Releasing

When you push your code to GitHub, the [GitHub Action](https://github.com/changesets/action) will run the `release` script defined in the root `package.json`:

```bash
turbo run build --filter=docs^... && changeset publish
```

Turborepo runs the `build` script for all publishable packages (excluding docs) and publishes the packages to npm. By default, this example includes `haus-ui` as the npm organization. To change this, do the following:

- Rename folders in `packages/*` to replace `haus-ui` with your desired scope
- Search and replace `haus-ui` with your desired scope
- Re-run `yarn install`

To publish packages to a private npm organization scope, **remove** the following from each of the `package.json`'s

```diff
- "publishConfig": {
-  "access": "public"
- },
```
