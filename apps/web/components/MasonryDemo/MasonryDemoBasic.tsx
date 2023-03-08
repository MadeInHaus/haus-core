import Masonry from '@madeinhaus/masonry';
import styles from './MasonryDemo.module.css';

const dog = '/assets/images/dogs/n02097047_1028.jpg';
const dogs = new Array(20).fill(dog);

function generateRandomInteger(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

const MasonryDemoBasic: React.FC = () => {
  return (
    <Masonry
      breakpointCols={{
        default: 2,
        768: 3,
      }}
    >
      {dogs.map((_, index) => {
        const height = generateRandomInteger(300, 500);
        return (
          <div key={index} className={styles.item}>
            <img
              className={styles.image}
              src={dog}
              style={
                {
                  '--image-height': `${height}px`,
                } as React.CSSProperties
              }
            />
            <h2 className={styles.label}>
              Index: {index} <br />
              {/* Height: {height} */}
            </h2>
          </div>
        );
      })}
    </Masonry>
  );
};

export default MasonryDemoBasic;
