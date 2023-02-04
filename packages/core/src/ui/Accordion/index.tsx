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
    setOpenIndices: React.Dispatch<React.SetStateAction<number[]>>;
    animation: Animation | null;
    setAnimation: React.Dispatch<React.SetStateAction<Animation | null>>;
    isClosing: boolean;
    setIsClosing: React.Dispatch<React.SetStateAction<boolean>>;
    isExpanding: boolean;
    setIsExpanding: React.Dispatch<React.SetStateAction<boolean>>;
    detailsRef: HTMLElement | null;
    setDetailsRef: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    summaryRef: HTMLElement | null;
    setSummaryRef: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    contentRef: HTMLElement | null;
    setContentRef: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
}>({
    id: undefined,
    type: 'multiple',
    openIndices: [],
    setOpenIndices: () => {},
    animation: null,
    setAnimation: () => {},
    isClosing: false,
    setIsClosing: () => {},
    isExpanding: false,
    setIsExpanding: () => {},
    detailsRef: null,
    setDetailsRef: () => {},
    summaryRef: null,
    setSummaryRef: () => {},
    contentRef: null,
    setContentRef: () => {},
});

const AccordionItemContext = createContext<{ index: number }>({ index: 0 });

const Accordion = ({ children, className, id, type = 'multiple' }: AccordionRootProps) => {
    const [openIndices, setOpenIndices] = useState<number[]>([]);
    const [animation, setAnimation] = useState<Animation | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isExpanding, setIsExpanding] = useState(false);
    const [detailsRef, setDetailsRef] = useState<HTMLElement | null>(null);
    const [summaryRef, setSummaryRef] = useState<HTMLElement | null>(null);
    const [contentRef, setContentRef] = useState<HTMLElement | null>(null);

    return (
        <AccordionContext.Provider
            value={{
                animation,
                setAnimation,
                isClosing,
                setIsClosing,
                isExpanding,
                setIsExpanding,
                openIndices,
                setOpenIndices,
                detailsRef,
                setDetailsRef,
                summaryRef,
                setSummaryRef,
                contentRef,
                setContentRef,
                id,
                type,
            }}
        >
            <section className={className}>{children}</section>
        </AccordionContext.Provider>
    );
};

// const handleSelectSingle = (index: number, setOpenIndices: SetOPenIndices) => {
//     setOpenIndices((prevOpenIndices: number[]) => {
//         return prevOpenIndices.includes(index) ? [] : [index];
//     });
// };

// const handleSelectMultiple = (index: number, setOpenIndices: SetOPenIndices) => {
//     setOpenIndices((prevOpenIndices: number[]) => {
//         return prevOpenIndices.includes(index)
//             ? prevOpenIndices.filter((select: number) => select !== index)
//             : [...prevOpenIndices, index];
//     });
// };

const AccordionTrigger = ({ children, className }: AccordionSharedProps) => {
    const summaryRef = React.useRef<HTMLElement>(null);

    const { setSummaryRef } = useContext(AccordionContext);

    useEffect(() => {
        setSummaryRef(summaryRef.current);
    }, [setSummaryRef]);

    const handleClick = () => {
        console.log('Summary Click', summaryRef?.current);
    };

    return (
        <summary
            ref={summaryRef}
            onClick={handleClick}
            className={joinClassNames(styles.trigger, className)}
        >
            {children}
        </summary>
    );
};

const AccordionItem = ({ children, className, index }: AccordionItemProps) => {
    const { setDetailsRef } = useContext(AccordionContext);

    const detailsRef = React.useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        setDetailsRef(detailsRef.current);
    }, [setDetailsRef]);

    return (
        <AccordionItemContext.Provider value={{ index }}>
            <details ref={detailsRef} className={joinClassNames(styles.item, className)}>
                {children}
            </details>
        </AccordionItemContext.Provider>
    );
};

const AccordionContent = ({ children, className }: AccordionSharedProps) => {
    const contentRef = React.useRef<HTMLDivElement>(null);

    const { setContentRef } = useContext(AccordionContext);

    useEffect(() => {
        setContentRef(contentRef.current);
    }, [setContentRef]);

    return (
        <div ref={contentRef} className={className}>
            {children}
        </div>
    );
};

Accordion.Root = Accordion;
Accordion.Trigger = AccordionTrigger;
Accordion.Item = AccordionItem;
Accordion.Content = AccordionContent;

export { Accordion };
