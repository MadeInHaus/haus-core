import Disclosure from '@madeinhaus/disclosure';
import items from './data/items';
import styles from './DisclosureDemo.module.css';

const DisclosureDemoBasic: React.FC = () => {
  return (
    <Disclosure.Root className={styles.root}>
      {items.map(({ heading, paragraph }, index) => (
        <Disclosure.Details key={index}>
          <Disclosure.Summary>{heading}</Disclosure.Summary>
          <Disclosure.Content>{paragraph}</Disclosure.Content>
        </Disclosure.Details>
      ))}
    </Disclosure.Root>
  );
};

export default DisclosureDemoBasic;
