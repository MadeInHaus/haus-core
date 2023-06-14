import Carousel from '@madeinhaus/carousel';
import '@madeinhaus/carousel/dist/index.css';

import styles from './CarouselDemo.module.css';

const dog = '/assets/images/dogs/n02097047_1028.jpg';
const dogs = new Array(20).fill(dog);

const CarouselDemo: React.FC = () => {
  return (
    <div className={styles.root}>
      <Carousel className={styles.carousel} itemClassName={styles.carouselItem}>
        {dogs.map((dog, i) => (
          <img key={i} src={dog} alt="" className={styles.image} />
        ))}
      </Carousel>
    </div>
  );
};
export default CarouselDemo;
