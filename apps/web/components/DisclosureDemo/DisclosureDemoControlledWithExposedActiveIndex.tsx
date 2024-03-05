import * as React from 'react';
import Disclosure, { RegisterDetails } from '@madeinhaus/disclosure';
import '@madeinhaus/disclosure/dist/index.css';

import items from './data/items';
import styles from './DisclosureDemo.module.css';

const defaultOpenIndex = 2;

const DisclosureDemoControlledWithExposedActiveIndex: React.FC = () => {
  const [openIndex, setOpenIndex] = React.useState(defaultOpenIndex);

  return (
    <>
      <h2>openIndex: {openIndex}</h2>
      <Disclosure.Root defaultOpenIndex={defaultOpenIndex} className={styles.root}>
        {(registerDetails: RegisterDetails) =>
          items.map(({ heading, paragraph }, index) => {
            return (
              <Disclosure.Details className={styles.details} key={index} {...registerDetails()}>
                {({ isOpen }) => {
                  if (isOpen) {
                    setOpenIndex(index);
                  }

                  return (
                    <>
                      <Disclosure.Summary className={styles.summary}>{heading}</Disclosure.Summary>
                      <Disclosure.Content className={styles.content}>
                        {paragraph}
                      </Disclosure.Content>
                    </>
                  );
                }}
              </Disclosure.Details>
            );
          })
        }
      </Disclosure.Root>
    </>
  );
};

export default DisclosureDemoControlledWithExposedActiveIndex;
