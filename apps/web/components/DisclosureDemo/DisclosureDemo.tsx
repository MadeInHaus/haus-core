import Disclosure from '@madeinhaus/disclosure';

import disclosureItems from './data/disclosureItems';

import styles from './DisclosureDemo.module.css';

const DisclosureDemoBasic: React.FC = () => {
  return (
    <div className={styles.root}>
      <Disclosure.Root>
        {disclosureItems.map(({ heading, paragraph }, index) => (
          <Disclosure.Details key={index}>
            <Disclosure.Summary>{heading}</Disclosure.Summary>
            <Disclosure.Content>{paragraph}</Disclosure.Content>
          </Disclosure.Details>
        ))}
      </Disclosure.Root>
    </div>
  );
};

export default DisclosureDemoBasic;
