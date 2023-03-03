import * as React from 'react';
import cx from 'clsx';

import Disclosure from '@madeinhaus/disclosure';

import disclosureItems from './data/disclosureItems';

import styles from './DisclosureDemoRenderProp.module.css';

const DisclosureDemoRenderProp: React.FC = () => {
  return (
    <div className={styles.root}>
      <Disclosure.Root>
        {disclosureItems.map(({ heading, paragraph }, index) => (
          <Disclosure.Details key={index}>
            {({ isOpen }) => (
              <>
                <Disclosure.Summary>{`${heading} - ${
                  isOpen ? 'open' : 'closed'
                }`}</Disclosure.Summary>
                <Disclosure.Content>{paragraph}</Disclosure.Content>
              </>
            )}
          </Disclosure.Details>
        ))}
      </Disclosure.Root>
    </div>
  );
};

export default DisclosureDemoRenderProp;
