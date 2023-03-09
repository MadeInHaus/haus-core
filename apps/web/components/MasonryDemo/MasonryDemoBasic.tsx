import Masonry from '@madeinhaus/masonry';
import { useSSG } from 'nextra/ssg';

import styles from './MasonryDemo.module.css';

const MasonryDemoBasic: React.FC = () => {
  const { images }: { images: string[] } = useSSG();

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
          <div key={index} className={styles.item}>
            <img src={src} />
            <h2 className={styles.label}>
              {index + 1} <br />
            </h2>
          </div>
        );
      })}
    </Masonry>
  );
};

export default MasonryDemoBasic;
