import Masonry from '@madeinhaus/masonry';
import '@madeinhaus/masonry/dist/index.css';
import { useData } from 'nextra/hooks';

import styles from './MasonryDemo.module.css';

const MasonryDemoBasic: React.FC = () => {
  const { images }: { images: string[] } = useData();

  return (
    <Masonry
      breakpointCols={{
        default: 2,
        768: 3,
        1024: 4,
      }}
    >
      {images.map((src, index) => {
        return (
          <figure key={index} className={styles.item}>
            <img src={src} />
            <figcaption className={styles.caption}>
              {index + 1} <br />
            </figcaption>
          </figure>
        );
      })}
    </Masonry>
  );
};

export default MasonryDemoBasic;
