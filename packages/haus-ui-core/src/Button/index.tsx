import styles from "./Button.module.scss";

export interface ButtonProps {
  children: React.ReactNode;
}

export function Button(props: ButtonProps) {
  return <button className={styles.root}>{props.children}</button>;
}

Button.displayName = "Button";
