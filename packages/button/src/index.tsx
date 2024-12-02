import * as React from 'react';

export interface ButtonProps {
    children: React.ReactNode;
    variant: 'primary' | 'secondary';
}

export default function Button({ children, variant = 'primary', ...rest }: ButtonProps) {
    return (
        <button className={`root ${variant}`} {...rest}>
            {children}
        </button>
    );
}
