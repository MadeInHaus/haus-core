import Masonry from '@madeinhaus/masonry';
import styles from './MasonryDemo.module.css';

const dog = '/assets/images/dogs/n02097047_1028.jpg';
const dogs = new Array(20).fill(dog);

const MasonryDemoBasic: React.FC = () => {
  return (
    <Masonry
      breakpointCols={{
        default: 2,
        768: 3,
        1024: 4,
      }}
    >
      {dogs.map((_, index) => {
        return (
          <img
            className={styles.image}
            key={index}
            src={dog}
            style={
              {
                '--image-height': `${Math.floor(300 + Math.random() * (500 - 300 + 1))}px`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </Masonry>
  );
};

export default MasonryDemoBasic;
