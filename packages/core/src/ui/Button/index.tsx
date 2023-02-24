import * as React from 'react';
import { joinClassNames } from '../../utils';
import styles from './Button.module.scss';

export interface ButtonProps {
    children: React.ReactNode;
    variant: 'primary' | 'secondary';
}

export function Button({ children, variant = 'primary', ...rest }: ButtonProps) {
    return (
        <button className={joinClassNames(styles.root, styles[variant])} {...rest}>
            {children}
        </button>
    );
}
