import Disclosure from '@madeinhaus/disclosure';

import disclosureItems from './data/disclosureItems';
import styles from './DisclosureDemo.module.css';

const DisclosureDemoWithStyles: React.FC = () => {
  return (
    <div className={styles.root}>
      <Disclosure.Root>
        {disclosureItems.map(({ heading, paragraph }, index) => (
          <Disclosure.Details key={index}>
            <Disclosure.Summary className={styles.summary}>{heading}</Disclosure.Summary>
            <Disclosure.Content className={styles.content}>{paragraph}</Disclosure.Content>
          </Disclosure.Details>
        ))}
      </Disclosure.Root>
    </div>
  );
};

export default DisclosureDemoWithStyles;
