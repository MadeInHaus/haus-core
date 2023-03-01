import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>HAUS CORE</span>,
  project: {
    link: "https://github.com/MadeInHaus/haus-core-docs",
  },
  docsRepositoryBase: "https://github.com/MadeInHaus/haus-core-docs",
  useNextSeoProps() {
    return {
      titleTemplate: "%s – Haus Core Component Library",
    };
  },
  footer: {
    text: "(c) 2023 Haus LA",
  },
};

export default config;
