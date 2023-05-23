import * as React from 'react';
import Slider from '@madeinhaus/slider';
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
            >
              {'<'} Previous
            </button>
            <button
              className={styles.button}
              onClick={() => handleNavigation('next')}
              disabled={isEnd}
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
