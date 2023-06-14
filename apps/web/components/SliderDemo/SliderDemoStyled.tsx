import * as React from 'react';
import Slider from '@madeinhaus/slider';
import '@madeinhaus/slider/dist/index.css';
import { useSSG } from 'nextra/ssg';

import styles from './SliderDemoStyled.module.css';

const SliderDemoStyled: React.FC = () => {
  const { images }: { images: string[] } = useSSG();

  return (
    <Slider
      className={styles.root}
      slideClassName={styles.slide}
      renderNavigation={({ isBeginning, isEnd, handleNavigation }) => {
        return (
          <div className={styles.navigation}>
            <button
              className={styles.button}
              onClick={() => handleNavigation('prev')}
              disabled={isBeginning}
              aria-label="Previous"
            >
              {'<'} Previous
            </button>
            <button
              className={styles.button}
              onClick={() => handleNavigation('next')}
              disabled={isEnd}
              aria-label="Next"
            >
              Next {'>'}
            </button>
          </div>
        );
      }}
    >
      {images.map((src, index) => {
        return <img className={styles.image} key={index} src={src} />;
      })}
    </Slider>
  );
};

export default SliderDemoStyled;
