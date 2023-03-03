import * as React from 'react';

import Carousel from '@madeinhaus/carousel';

import styles from './CarouselDemoTicker.module.css';

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

const str = 'You spin me right round baby right round like a record baby right round round round';

const CarouselDemoTicker: React.FC = () => {
  return (
    <div className={styles.root}>
      <Carousel align="center" as="div" childAs="span" className={styles.carousel}>
        {`🎶 ${str} 🎶 ${str} `.split(' ')}
      </Carousel>
    </div>
  );
};

export default CarouselDemoTicker;
