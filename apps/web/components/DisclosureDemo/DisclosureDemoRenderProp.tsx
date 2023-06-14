import Disclosure from '@madeinhaus/disclosure';
import '@madeinhaus/disclosure/dist/index.css';
import items from './data/items';
import styles from './DisclosureDemoRenderProp.module.css';

const DisclosureDemoRenderProp: React.FC = () => {
  return (
    <Disclosure.Root className={styles.root}>
      {items.map(({ heading, paragraph }, index) => (
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
  );
};

export default DisclosureDemoRenderProp;
