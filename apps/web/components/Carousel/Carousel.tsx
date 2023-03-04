import * as React from 'react';
import cx from 'clsx';

import Carousel from '@madeinhaus/carousel';
import { useIntersectionObserver, useImagePreload } from '@madeinhaus/hooks';

import styles from './Carousel.module.css';

const dog = '/assets/images/dogs/n02097047_1028.jpg';
const dogs = new Array(20).fill(dog);

const CarouselDemo: React.FC = () => {
  return (
    <div className={styles.root}>
      <Carousel className={styles.carousel} itemClassName={styles.carouselItem}>
        {dogs.map((dog, i) => (
          <LazyImage key={i} url={dog} />
        ))}
      </Carousel>
    </div>
  );
};

interface LazyImageProps {
  url: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ url }) => {
  const [inView, intersectionRef] = useIntersectionObserver();
  const [loaded, loadRef] = useImagePreload();
  return (
    <div ref={intersectionRef}>
      <img
        ref={loadRef}
        src={inView ? url : undefined}
        className={cx(styles.image, { [styles.loaded]: loaded })}
        alt=""
      />
    </div>
  );
};

export default CarouselDemo;
