# Haus Core

Powered by:

- 🏎 [Turborepo](https://turbo.build/repo) — High-performance build system for Monorepos
- 🚀 [React](https://reactjs.org/) — JavaScript library for user interfaces
- 🛠 [Tsup](https://github.com/egoist/tsup) — TypeScript bundler powered by esbuild
- 📖 [Nextra](https://nextra.site/) — Simple, powerful and flexible site generation framework from Next.js.

As well as a few others tools preconfigured:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Changesets](https://github.com/changesets/changesets) for managing versioning and changelogs
- [GitHub Actions](https://github.com/changesets/action) for fully automated package publishing

## Documentation

Full documentation on the everything contained in this repo can be found at [hauscore.xyz](https://hauscore.xyz/)

## Clone the repo

```bash
git clone https://github.com/MadeInHaus/haus-core.git
cd haus-core
pnpm install
```

### Useful Commands

- `pnpm build` - Build all packages, including the Storybook site
- `pnpm dev` - Run all packages locally and preview with Storybook
- `pnpm lint` - Lint all packages
- `pnpm changeset` - Generate a changeset
- `pnpm clean` - Clean up all `node_modules` and `dist` folders (runs each package's clean script)

## Turborepo

[Turborepo](https://turbo.build/repo) is a high-performance build system for JavaScript and TypeScript codebases. It was designed after the workflows used by massive software engineering organizations to ship code at scale. Turborepo abstracts the complex configuration needed for monorepos and provides fast, incremental builds with zero-configuration remote caching.

Using Turborepo simplifies managing your design system monorepo, as you can have a single lint, build, test, and release process for all packages. [Learn more](https://vercel.com/blog/monorepos-are-changing-how-teams-build-software) about how monorepos improve your development workflow.

## Apps & Packages

This Turborepo includes the following packages and applications:

- `apps/docs`: Component documentation site with Nextra
- `packages/[package]`: React components
- `packages/hooks`: Shared React hooks
- `packages/utils`: Shared utilities

This example sets up your `.gitignore` to exclude all generated files, other folders like `node_modules` used to store your dependencies.

### Compilation

To make the core library code work across all browsers, we need to compile the raw TypeScript and React code to plain JavaScript. We can accomplish this with `vite`, which uses `rollup` to greatly improve performance.

Running `pnpm build` from the root of the Turborepo will run the `build` command defined in each package's `package.json` file. Turborepo runs each `build` in parallel and caches & hashes the output to speed up future builds.

For `ui`, the `build` command is the following:

```bash
tsup src/index.tsx --format esm,cjs --dts --external react
```

`tsup` compiles `src/index.tsx`, which exports all of the components in the design system, into both ES Modules and CommonJS formats as well as their TypeScript types. The `package.json` for `acme-core` then instructs the consumer to select the correct format:

```json:textural-video/package.json
{
  "name": "@madeinhaus/textural-video",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
}
```

Run `pnpm build` to confirm compilation is working correctly. You should see a folder `[package]/dist` which contains the compiled output.

```bash
textural-video
└── dist
    ├── index.js    <-- CommonJS version
    └── index.mjs   <-- ES Modules version
```

## Package

### Example

```tsx:button/src/index.tsx
import * as React from "react";
import cx from 'clsx';
import styles from "./Button.module.scss";

export interface ButtonProps {
  children: React.ReactNode;
  variant: "primary" | "secondary";
}

export default function Button({ children, variant }: ButtonProps) {
  return (
    <button className={cx(styles.root, styles[variant])}>{children}</button>
  );
}
```

## Nextra

Nextra provides us with an interactive UI playground for our components. This allows us to preview our components in the browser and instantly see changes when developing locally. This example preconfigures Nextra to:

- The Nextra repository uses PNPM Workspaces and Turborepo. To install dependencies, run pnpm install in the project root directory.
- Write MDX for component documentation pages

- `pnpm dev`: Starts Nextra in dev mode with hot reloading at `localhost:3001`
- `pnpm build`: Builds the Nextra app and generates the static files

For example, here's the Nextra markdown for our `Portal` component:

````js
# Portal

The Portal component allows you to render a child component outside of its parent hierarchy, by creating a portal to another part of the DOM. This can be useful in situations where you need to render a component in a specific part of the page or outside of the component tree.

## Installation

import { Tab, Tabs } from 'nextra-theme-docs';

<Tabs items={['npm', 'yarn', 'pnpm']}>
    <Tab>
        ```bash copy
        npm install @madeinhaus/portal
        ```
    </Tab>
    <Tab>
        ```bash copy
        yarn add @madeinhaus/portal
        ```
    </Tab>
    <Tab>
        ```bash copy
        pnpm add @madeinhaus/portal
        ```
    </Tab>
</Tabs>

## Import

`import Portal from '@madeinhaus/portal';`

## Props

The `Portal` component accepts two props:

- `selector`: A string representing the CSS selector for the DOM element where the portal will be created. If no selector is provided, the default selector `#__portal__` will be used.
- `children`: The child component(s) to be rendered within the portal.

## Usage

Wrap your desired child component(s) within the `Portal` component:

```tsx copy showLineNumbers
function MyComponent() {
  return (
    <div>
      <h1>My Component</h1>
      <Portal>
        <div>
          <p>This component will be rendered outside of the parent hierarchy.</p>
        </div>
      </Portal>
    </div>
  );
}
````

## Versioning & Publishing Packages

This example uses [Changesets](https://github.com/changesets/changesets) to manage versions, create changelogs, and publish to npm. It's preconfigured so you can start publishing packages immediately.

You'll need to create an `NPM_TOKEN` and `GITHUB_TOKEN` and add it to your GitHub repository settings to enable access to npm. It's also worth installing the [Changesets bot](https://github.com/apps/changeset-bot) on your repository.

### Generating the Changelog

To generate your changelog, run `pnpm changeset` locally:

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

To publish packages to a private npm organization scope, **remove** the following from each of the `package.json`'s

```diff
- "publishConfig": {
-  "access": "public"
- },
```
