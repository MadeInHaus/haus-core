import * as React from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';

export type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> &
    NextLinkProps & {
        children?: React.ReactNode;
    } & React.RefAttributes<HTMLAnchorElement>;

export const Link: React.FC<LinkProps> = ({ children, className, ...linkProps }) => (
    <NextLink {...linkProps} scroll={false} className={className}>
        {children}
    </NextLink>
);
