import { useState } from 'react';
import Disclosure, { RegisterDetails } from '@madeinhaus/disclosure';
import '@madeinhaus/disclosure/dist/index.css';

import items from './data/items';
import styles from './DisclosureDemo.module.css';

const defaultOpenIndex = 0;

const DisclosureDemoControlledWithExposedActiveIndex: React.FC = () => {
  const [openIndex, setOpenIndex] = useState(defaultOpenIndex);

  return (
    <>
      <h2>openIndex: {openIndex}</h2>
      <Disclosure.Root className={styles.root} defaultOpenIndex={defaultOpenIndex} preventCloseAll>
        {(registerDetails: RegisterDetails) =>
          items.map(({ heading, paragraph }, index) => (
            <Disclosure.Details key={index} {...registerDetails()}>
              {({ isOpen }) => (
                <>
                  <Disclosure.Summary>{heading}</Disclosure.Summary>
                  <Disclosure.Content>{paragraph}</Disclosure.Content>
                </>
              )}
            </Disclosure.Details>
          ))
        }
      </Disclosure.Root>
    </>
  );
};

export default DisclosureDemoControlledWithExposedActiveIndex;
