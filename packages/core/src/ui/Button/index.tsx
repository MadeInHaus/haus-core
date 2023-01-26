import * as React from 'react';
import styles from './Button.module.scss';

export interface ButtonProps {
    '';
    children: React.ReactNode;
    variant: 'primary' | 'secondary';
}

export function Button({ children, variant = 'primary', ...rest }: ButtonProps) {
    return (
        <button className={[styles.root, styles[variant]].filter(Boolean).join(' ')} {...rest}>
            {children}
        </button>
    );
}
