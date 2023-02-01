import React, { createContext } from 'react';
import { joinClassNames } from '../../utils';
import styles from './Accordion.module.scss';

export interface AccordionSharedProps {
    children: React.ReactNode;
    className?: string;
}

export interface AccordionItemProps extends AccordionSharedProps {
    index: number;
}

const AccordionContext = createContext({
    openIndices: [] as number[],
    setOpenIndices: (updateFn: (prevOpenIndices: number[]) => number[]) => {},
});

const Accordion = ({ children, className }: AccordionSharedProps) => {
    return <section className={joinClassNames(styles.root, className)}>{children}</section>;
};

const AccordionButton = ({ children, className, index }: AccordionItemProps) => {
    const { setOpenIndices } = React.useContext(AccordionContext);

    const handleSelectMultiple = (index: number) => {
        setOpenIndices((prevOpenIndices: number[]) => {
            return prevOpenIndices.includes(index)
                ? prevOpenIndices.filter((select: number) => select !== index)
                : [...prevOpenIndices, index];
        });
    };

    return (
        <div className={joinClassNames(styles.item, className)}>
            <button className={styles.button} onClick={() => handleSelectMultiple(index)}>
                {children}
            </button>
        </div>
    );
};

const AccordionItem = ({ children, className, index }: AccordionItemProps) => {
    const { openIndices } = React.useContext(AccordionContext);
    return (
        <div className={joinClassNames(styles.item, className)}>
            {openIndices.includes(index) && <div className={styles.content}>{children}</div>}
        </div>
    );
};

Accordion.Root = Accordion;
Accordion.Button = AccordionButton;
Accordion.Item = AccordionItem;

export { Accordion };
