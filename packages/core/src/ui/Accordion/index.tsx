import React, { createContext, useContext, useEffect, useState } from 'react';
import { joinClassNames } from '../../utils';
import styles from './Accordion.module.scss';

export interface AccordionSharedProps {
    children: React.ReactNode;
    className?: string;
}

export interface AccordionRootProps extends AccordionSharedProps {
    type?: 'single' | 'multiple';
    id: string;
}

export interface AccordionItemProps extends AccordionSharedProps {
    index: number;
}

// eslint-disable-next-line no-unused-vars
type SetOPenIndices = (updateFn: (prevOpenIndices: number[]) => number[]) => void;

const AccordionContext = createContext<{
    id?: string;
    type: 'single' | 'multiple';
    openIndices: number[];
    setOpenIndices: SetOPenIndices;
}>({
    id: undefined,
    type: 'multiple',
    openIndices: [],
    setOpenIndices: () => {},
});

const AccordionItemContext = createContext<{ index: number }>({ index: 0 });

const Accordion = ({ children, className, id, type = 'multiple' }: AccordionRootProps) => {
    const [openIndices, setOpenIndices] = useState<number[]>([]);

    return (
        <AccordionContext.Provider value={{ id, openIndices, setOpenIndices, type }}>
            <section className={className}>{children}</section>
        </AccordionContext.Provider>
    );
};

const handleSelectSingle = (index: number, setOpenIndices: SetOPenIndices) => {
    setOpenIndices((prevOpenIndices: number[]) => {
        return prevOpenIndices.includes(index) ? [] : [index];
    });
};

const handleSelectMultiple = (index: number, setOpenIndices: SetOPenIndices) => {
    setOpenIndices((prevOpenIndices: number[]) => {
        return prevOpenIndices.includes(index)
            ? prevOpenIndices.filter((select: number) => select !== index)
            : [...prevOpenIndices, index];
    });
};

const AccordionTrigger = ({ children, className }: AccordionSharedProps) => {
    return <summary className={joinClassNames(styles.trigger, className)}>{children}</summary>;
};

const AccordionItem = ({ children, className, index }: AccordionItemProps) => {
    const { setOpenIndices, type } = useContext(AccordionContext);

    return (
        <AccordionItemContext.Provider value={{ index }}>
            <details
                onToggle={() =>
                    (type === 'single' ? handleSelectSingle : handleSelectMultiple)(
                        index,
                        setOpenIndices
                    )
                }
                className={className}
            >
                {children}
            </details>
        </AccordionItemContext.Provider>
    );
};

const AccordionContent = ({ children, className }: AccordionSharedProps) => {
    const [height, setHeight] = useState<number>(0);
    const ref = React.useRef<HTMLDivElement>(null);

    const { id, openIndices } = useContext(AccordionContext);
    const { index } = useContext(AccordionItemContext);

    const isOpen = openIndices.includes(index);

    useEffect(() => {
        if (isOpen) {
            setHeight(ref.current!.scrollHeight);
        } else {
            setHeight(0);
        }
    }, [isOpen]);

    return (
        <div
            ref={ref}
            aria-labelledby={`accordion-button-${id}-${index}`}
            id={`accordion-trigger-${id}-${index}`}
            style={{ height }}
            className={joinClassNames(styles.content, className)}
        >
            {children}
        </div>
    );
};

Accordion.Root = Accordion;
Accordion.Trigger = AccordionTrigger;
Accordion.Item = AccordionItem;
Accordion.Content = AccordionContent;

export { Accordion };
