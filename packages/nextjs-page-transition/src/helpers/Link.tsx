import * as React from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';

export interface LinkProps extends NextLinkProps {
    children: React.ReactNode;
    className?: string;
}

export const Link: React.FC<LinkProps> = ({ children, className, ...linkProps }) => (
    <NextLink {...linkProps} scroll={false} className={className}>
        {children}
    </NextLink>
);
