import Disclosure from '@madeinhaus/disclosure';
import '@madeinhaus/disclosure/dist/index.css';

import items from './data/items';
import styles from './DisclosureDemo.module.css';

const DisclosureDemoBasic: React.FC = () => {
  return (
    <Disclosure.Root defaultOpenIndex={2} className={styles.root}>
      {items.map(({ heading, paragraph }, index) => (
        <Disclosure.Details key={index}>
          <Disclosure.Summary>Minka: {heading}</Disclosure.Summary>
          <Disclosure.Content>{paragraph}</Disclosure.Content>
        </Disclosure.Details>
      ))}
    </Disclosure.Root>
  );
};

export default DisclosureDemoBasic;
