import * as React from "react";
import cx from "classnames";
import styles from "./Button.module.scss";

export interface ButtonProps {
  children: React.ReactNode;
  variant: "primary" | "secondary";
}

export function Button({ children, variant }: ButtonProps) {
  return (
    <button className={cx(styles.root, styles[variant])}>{children}</button>
  );
}
