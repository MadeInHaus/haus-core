import styles from 'styles/app.module.css';

export default function App({ Component, pageProps }) {
  return (
    <div className={styles.component}>
      <Component {...pageProps} />
    </div>
  );
}
