import Slider from '@madeinhaus/slider';
import { useSSG } from 'nextra/ssg';

import styles from './SliderDemoStyled.module.css';

const SliderDemoStyled: React.FC = () => {
  const { images }: { images: string[] } = useSSG();

  return (
    <Slider
      className={styles.root}
      containerClassName={styles.container}
      slideClassName={styles.slide}
    >
      {images.map((src, index) => {
        return <img className={styles.image} key={index} src={src} />;
      })}
    </Slider>
  );
};

export default SliderDemoStyled;
