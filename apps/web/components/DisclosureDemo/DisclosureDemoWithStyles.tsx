import Disclosure from '@madeinhaus/disclosure';
import '@madeinhaus/disclosure/dist/index.css';
import items from './data/items';
import styles from './DisclosureDemo.module.css';

const DisclosureDemoWithStyles: React.FC = () => {
  return (
    <Disclosure.Root className={styles.root}>
      {items.map(({ heading, paragraph }, index) => (
        <Disclosure.Details key={index} defaultOpen={index === 2}>
          <Disclosure.Summary className={styles.summary}>{heading}</Disclosure.Summary>
          <Disclosure.Content className={styles.content}>{paragraph}</Disclosure.Content>
        </Disclosure.Details>
      ))}
    </Disclosure.Root>
  );
};

export default DisclosureDemoWithStyles;
