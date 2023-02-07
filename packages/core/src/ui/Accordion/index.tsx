import React, { createContext, useContext, useEffect, useState } from 'react';
import { joinClassNames } from '../../utils';
import styles from './Accordion.module.scss';

interface HTMLSummaryElement extends HTMLElement {}

declare var HTMLSummaryElement: {
    prototype: HTMLSummaryElement;
    new (): HTMLSummaryElement;
};

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

const AccordionContext = createContext<{
    id?: string;
    type: 'single' | 'multiple';
}>({
    id: undefined,
    type: 'multiple',
});

const AccordionItemContext = createContext<{
    index: number;
    summaryEl: HTMLSummaryElement | null;
    setSummaryEl: React.Dispatch<React.SetStateAction<HTMLSummaryElement | null>>;
    contentEl: HTMLDivElement | null;
    setContentEl: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
}>({
    index: 0,
    summaryEl: null,
    setSummaryEl: () => {},
    contentEl: null,
    setContentEl: () => {},
});

const Accordion = ({ children, className, id, type = 'multiple' }: AccordionRootProps) => {
    return (
        <AccordionContext.Provider
            value={{
                id,
                type,
            }}
        >
            <section className={className}>{children}</section>
        </AccordionContext.Provider>
    );
};

const AccordionTrigger = ({ children, className }: AccordionSharedProps) => {
    const { setSummaryEl } = useContext(AccordionItemContext);

    const summaryRef = React.useRef<HTMLSummaryElement>(null);

    useEffect(() => {
        setSummaryEl(summaryRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [summaryRef]);

    return (
        <summary ref={summaryRef} className={joinClassNames(styles.trigger, className)}>
            {children}
        </summary>
    );
};

const AccordionItem = ({ children, className, index }: AccordionItemProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const [height, setHeight] = useState<number>(0);
    const [summaryEl, setSummaryEl] = useState<HTMLSummaryElement | null>(null);
    const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        setHeight(summaryEl?.offsetHeight || 0);
    }, [summaryEl]);

    const handleOpen = () => {
        const height = (summaryEl?.offsetHeight || 0) + (contentEl?.offsetHeight || 0);

        setHeight(height);
        setOpen(true);
    };

    const handleClose = () => {
        const height = summaryEl?.offsetHeight || 0;

        setHeight(height);
        setOpen(false);
    };

    const handleToggle = () => {
        if (!open) {
            handleOpen();
        }

        if (open) {
            handleClose();
        }
    };

    return (
        <AccordionItemContext.Provider
            value={{
                index,
                summaryEl,
                setSummaryEl,
                contentEl,
                setContentEl,
            }}
        >
            <details
                className={joinClassNames(styles.item, className)}
                onToggle={handleToggle}
                open={open}
                style={{ height: `${height}px` }}
            >
                {children}
            </details>
        </AccordionItemContext.Provider>
    );
};

const AccordionContent = ({ children, className }: AccordionSharedProps) => {
    const contentRef = React.useRef<HTMLDivElement>(null);

    const { setContentEl } = useContext(AccordionItemContext);

    useEffect(() => {
        setContentEl(contentRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentRef]);

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
