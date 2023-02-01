import React, { createContext, useState } from 'react';
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

const AccordionItemContext = createContext({ index: 0 });

const Accordion = ({ children, className }: AccordionSharedProps) => {
    const [openIndices, setOpenIndices] = useState<number[]>([]);

    return (
        <AccordionContext.Provider value={{ openIndices, setOpenIndices }}>
            <section className={joinClassNames(styles.root, className)}>{children}</section>
        </AccordionContext.Provider>
    );
};

const AccordionButton = ({ children, className }: AccordionSharedProps) => {
    const { setOpenIndices } = React.useContext(AccordionContext);
    const { index } = React.useContext(AccordionItemContext);

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
    return (
        <AccordionItemContext.Provider value={{ index }}>
            <div className={joinClassNames(styles.item, className)}>{children}</div>
        </AccordionItemContext.Provider>
    );
};

const AccordionContent = ({ children, className }: AccordionSharedProps) => {
    const { openIndices } = React.useContext(AccordionContext);
    const { index } = React.useContext(AccordionItemContext);
    return (
        <div className={joinClassNames(styles.content, className)}>
            {openIndices.includes(index) && children}
        </div>
    );
};

Accordion.Root = Accordion;
Accordion.Button = AccordionButton;
Accordion.Item = AccordionItem;
Accordion.Content = AccordionContent;

export { Accordion };
