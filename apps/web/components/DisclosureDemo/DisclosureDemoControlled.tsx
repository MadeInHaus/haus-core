import Disclosure, { RegisterDetails } from '@madeinhaus/disclosure';
import '@madeinhaus/disclosure/dist/index.css';

import items from './data/items';
import styles from './DisclosureDemo.module.css';

const DisclosureDemoControlled: React.FC = () => {
  return (
    <Disclosure.Root defaultOpenIndex={1} className={styles.root}>
      {(registerDetails: RegisterDetails) =>
        items.map(({ heading, paragraph }, index) => {
          return (
            <Disclosure.Details key={index} {...registerDetails()}>
              <Disclosure.Summary className={styles.summary}>{heading}</Disclosure.Summary>
              <Disclosure.Content className={styles.content}>{paragraph}</Disclosure.Content>
            </Disclosure.Details>
          );
        })
      }
    </Disclosure.Root>
  );
};

export default DisclosureDemoControlled;
