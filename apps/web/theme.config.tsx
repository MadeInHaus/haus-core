import React from 'react';
import { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  head: (
    <>
      <link rel="icon" href="/favicon.svg"/>
    </>
  ),
  logo: (
    <svg x="0" y="0" viewBox="0 0 316.3 45" height="24">
      <path
        fill="currentColor"
        d="M0 43.3V1.1h9.6v16.7h17V1.1h9.6v42.2h-9.6V26.6h-17v16.7H0zm42.7 0L58.2 1.1h10.6l15.5 42.2H74.2L71.3 35H55.2l-2.8 8.2-9.7.1zm15.1-16.2h11l-5.5-16.5c-.1 0-5.5 16.5-5.5 16.5zm30.6-.3V1.1h9.3v24.8c0 3.4.6 5.1 1.9 6.6.8.8 1.7 1.5 2.7 2 1 .5 2.2.7 3.3.7 1.1 0 2.2-.2 3.3-.7 1-.5 2-1.1 2.7-2 1.2-1.4 1.9-3.2 1.9-6.6V1.1h9.4v25.7c0 11.2-6.2 17.2-17.3 17.2s-17.2-6-17.2-17.2zm42.3 3.7h9.8c0 .9.3 1.8.8 2.5s1.2 1.4 2 1.7c1.9 1.1 4 1.7 6.2 1.6 1.6.1 3.2-.4 4.6-1.4 1.2-.6 1.9-1.8 2-3.1 0-2.3-1.2-3.9-4.9-4.9l-8.5-2.3c-7.3-2-10.9-5.9-10.9-11.9 0-4.2 1.6-7.6 4.7-9.7C140 .9 144-.2 148.1-.1c4.8 0 8.7 1.1 11.8 3.4 3 2.3 4.8 5.5 5.1 9.9h-9.7c0-1.7-.9-3.3-2.3-4.2-1.6-1-3.6-1.5-5.5-1.3-1.5-.1-3 .3-4.2 1.1-.5.4-.9.8-1.2 1.4-.3.6-.4 1.2-.4 1.8 0 .5.1 1.1.3 1.6.2.5.5.9.9 1.3 1.1 1 2.4 1.7 3.8 2l8.5 2.3c7.3 2 10.7 6 10.7 12 .1 1.9-.3 3.7-1.1 5.4-.8 1.7-2.1 3.1-3.6 4.2-3.1 2.4-7.3 3.3-12.2 3.3-5.3 0-9.6-1.2-12.9-3.6-1.6-1.1-2.9-2.6-3.8-4.3-1-1.8-1.5-3.7-1.6-5.7z"
      />
      <path
        fill="currentColor"
        d="M177.1 22.3c0-11.7 9.7-21.1 21.4-21.1 4.2 0 9.7 1.8 12.5 4.5v3.9c-2-1.9-7.2-5-12.5-5-10.5 0-17.7 8-17.7 18 0 10.2 7.6 17.8 17.2 17.8 5.3 0 9-1.8 12.7-4.8v3.8c-1.9 1.7-7.2 4.5-12.6 4.5-11.6-.1-21-10-21-21.6zM216.3 22.3c0-11.6 9.5-21.1 21.1-21.1 11.5 0 21.3 9.5 21.3 21.2 0 12.1-9.4 21.5-21.5 21.5-11.7 0-20.9-9.9-20.9-21.6zm21.3-17.7c-9.8 0-17.8 7.7-17.8 17.9 0 10 7.8 18 17.5 18 10.1 0 17.8-7.9 17.8-18.1.1-9.8-7.5-17.8-17.5-17.8zM269.4 22v21h-3.5V1.9h9.3c6.7 0 11.1 4.8 11.1 10.8 0 6.2-4.5 10.9-11 10.9C277.5 26 292.7 43 292.7 43h-4.5l-18.8-21zm0-16.9v15.6h5.5c5.4 0 7.8-3.8 7.8-7.9 0-5.5-3.7-7.7-8-7.7h-5.3zM296.1 1.9h19.5v3.4h-16V19h15.6v3.3h-15.6v17.3h16.2V43h-19.6V1.9z"
      />
    </svg>
  ),
  project: {
    link: 'https://github.com/MadeInHaus/haus-core',
  },
  docsRepositoryBase: 'https://github.com/MadeInHaus/haus-core',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Haus Core Component Library',
    };
  },
  feedback: {
    content: null,
  },
  editLink: {
    component: () => null,
  },
  footer: {
    component: null,
  },
  navigation: false,
  primaryHue: 300,
};

export default config;
