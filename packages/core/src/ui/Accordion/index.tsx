import React, { createContext, useEffect, useState } from 'react';
import { joinClassNames } from '../../utils';
import styles from './Accordion.module.scss';

export interface AccordionSharedProps {
    children: React.ReactNode;
    className?: string;
}

export interface AccordionRootProps extends AccordionSharedProps {
    type?: 'single' | 'multiple';
}

export interface AccordionItemProps extends AccordionSharedProps {
    index: number;
}

// eslint-disable-next-line no-unused-vars
type SetOPenIndices = (updateFn: (prevOpenIndices: number[]) => number[]) => void;

const AccordionContext = createContext<{
    type: 'single' | 'multiple';
    openIndices: number[];
    setOpenIndices: SetOPenIndices;
}>({
    type: 'multiple',
    openIndices: [],
    setOpenIndices: () => {},
});

const AccordionItemContext = createContext<{ index: number }>({ index: 0 });

const Accordion = ({ children, className, type = 'multiple' }: AccordionRootProps) => {
    const [openIndices, setOpenIndices] = useState<number[]>([]);

    return (
        <AccordionContext.Provider value={{ openIndices, setOpenIndices, type }}>
            <section className={className}>{children}</section>
        </AccordionContext.Provider>
    );
};

const handleSelectSingle = (index: number, setOpenIndices: SetOPenIndices) => {
    setOpenIndices(() => [index]);
};

const handleSelectMultiple = (index: number, setOpenIndices: SetOPenIndices) => {
    setOpenIndices((prevOpenIndices: number[]) => {
        return prevOpenIndices.includes(index)
            ? prevOpenIndices.filter((select: number) => select !== index)
            : [...prevOpenIndices, index];
    });
};

const AccordionTrigger = ({ children, className }: AccordionSharedProps) => {
    const { setOpenIndices, type } = React.useContext(AccordionContext);
    const { index } = React.useContext(AccordionItemContext);

    return (
        <button
            className={joinClassNames(styles.trigger, className)}
            onClick={() =>
                (type === 'single' ? handleSelectSingle : handleSelectMultiple)(
                    index,
                    setOpenIndices
                )
            }
        >
            {children}
        </button>
    );
};

const AccordionItem = ({ children, className, index }: AccordionItemProps) => {
    return (
        <AccordionItemContext.Provider value={{ index }}>
            <div className={className}>{children}</div>
        </AccordionItemContext.Provider>
    );
};

const AccordionContent = ({ children, className }: AccordionSharedProps) => {
    const [height, setHeight] = useState<number>(0);
    const ref = React.useRef<HTMLDivElement>(null);

    const { openIndices } = React.useContext(AccordionContext);
    const { index } = React.useContext(AccordionItemContext);

    const isOpen = openIndices.includes(index);

    useEffect(() => {
        if (isOpen) {
            setHeight(ref.current!.scrollHeight);
        } else {
            setHeight(0);
        }
    }, [isOpen]);

    return (
        <div ref={ref} style={{ height }} className={joinClassNames(styles.content, className)}>
            {children}
        </div>
    );
};

Accordion.Root = Accordion;
Accordion.Trigger = AccordionTrigger;
Accordion.Item = AccordionItem;
Accordion.Content = AccordionContent;

export { Accordion };
