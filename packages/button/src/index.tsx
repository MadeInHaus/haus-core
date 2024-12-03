import * as React from 'react';

import styles from './Button.module.css';

export interface ButtonProps {
    children: React.ReactNode;
    variant: 'primary' | 'secondary';
}

export default function Button({ children, variant = 'primary', ...rest }: ButtonProps) {
    return (
        <button className={`${styles.root} ${styles[variant]}`} {...rest}>
            {children}
        </button>
    );
}
