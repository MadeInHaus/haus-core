import * as React from 'react';
import cx from 'clsx';

import Carousel from '@madeinhaus/carousel';
import '@madeinhaus/carousel/dist/index.css';

import styles from './CarouselDemoTicker.module.css';

const str = 'You spin me right round baby right round like a record baby right round round round';

const CarouselDemoTicker: React.FC = () => {
  const carouselClass = cx('nx-text-primary-600', styles.carousel);
  return (
    <div className={styles.root}>
      <Carousel damping={300} align="center" as="div" childAs="span" className={carouselClass}>
        {`🎶 ${str} 🎶 ${str} `.split(' ')}
      </Carousel>
    </div>
  );
};

export default CarouselDemoTicker;
