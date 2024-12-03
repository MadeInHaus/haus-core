import Slider from '@madeinhaus/slider';
import '@madeinhaus/slider/dist/index.css';
import { useData } from 'nextra/hooks';

import styles from './SliderDemoBasic.module.css';

const SliderDemoBasic: React.FC = () => {
  const { images }: { images: string[] } = useData();

  return (
    <Slider>
      {images.map((src, index) => (
        <figure key={index} className={styles.item}>
          <img src={src} />
          <figcaption>
            {index + 1} <br />
          </figcaption>
        </figure>
      ))}
    </Slider>
  );
};

export default SliderDemoBasic;
