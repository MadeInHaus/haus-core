import Disclosure, { RegisterDetails } from '@madeinhaus/disclosure';
import '@madeinhaus/disclosure/dist/index.css';

import items from './data/items';
import styles from './DisclosureDemo.module.css';

const DisclosureDemoControlledWithIsOpen: React.FC = () => {
  return (
    <Disclosure.Root defaultOpenIndex={2} className={styles.root}>
      {(registerDetails: RegisterDetails) =>
        items.map(({ heading, paragraph }, index) => {
          return (
            <Disclosure.Details key={index} {...registerDetails()}>
              {({ isOpen }) => (
                <>
                  <Disclosure.Summary className={styles.summary}>
                    {heading}: {isOpen ? 'isOpen' : ''}
                  </Disclosure.Summary>
                  <Disclosure.Content className={styles.content}>{paragraph}</Disclosure.Content>
                </>
              )}
            </Disclosure.Details>
          );
        })
      }
    </Disclosure.Root>
  );
};

export default DisclosureDemoControlledWithIsOpen;
