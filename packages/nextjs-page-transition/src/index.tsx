import * as React from 'react';

import cx from 'clsx';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getHash, removeHash } from '../../utils/src/url';
import { useNextCssRemovalPrevention } from './helpers/useNextCssRemovalPrevention';

import styles from './PageTransition.module.scss';

export interface PageTransitionProps {
    /** The container element (default: main) */
    as?: React.ElementType<any>;
    /** The duration of the appear phase in ms (default: 600) */
    inPhaseDuration?: number;
    /** The duration of the out phase in ms (default: 600) */
    outPhaseDuration?: number;
    /** Disable default styles (default: false) */
    disableDefaultStyles?: boolean;
    /** Callback to save scroll position */
    onSaveScrollPos?: (url: string, scrollPos: ScrollPos) => void;
    /** Callback to retrieve scroll position */
    onRetrieveScrollPos?: (url: string) => ScrollPos;
    /** Additional class name */
    className?: string;
    /** The content */
    children: React.ReactElement;
}

export enum PageTransitionPhase {
    IDLE = 'IDLE',
    APPEAR = 'APPEAR',
    IN = 'IN',
    OUT = 'OUT',
}

export interface PageTransitionState {
    phase: PageTransitionPhase;
    phaseOutAnticipated?: boolean;
    currentUrl?: string | null;
    targetUrl?: string | null;
    scrollPosY?: number;
}

type ScrollPos = {
    x: number;
    y: number;
    hash?: string;
};

const initialState = {
    phase: PageTransitionPhase.APPEAR,
    phaseOutAnticipated: false,
    currentUrl: null,
    targetUrl: null,
    scrollPosY: 0,
};

const StateContext = React.createContext<PageTransitionState>(initialState);
const DispatchContext = React.createContext<React.Dispatch<PageTransitionState> | null>(null);

function saveScrollPosDefault(url: string, scrollPos: ScrollPos) {
    try {
        sessionStorage.setItem(url, JSON.stringify(scrollPos));
    } catch (error) {}
}

function retrieveScrollPosDefault(url: string): ScrollPos {
    const scrollToTop = { x: 0, y: 0 };
    try {
        const sessionItem = sessionStorage.getItem(url);
        return sessionItem ? JSON.parse(sessionItem) : scrollToTop;
    } catch (error) {
        return scrollToTop;
    }
}

function getFullAsPath({
    asPath,
    basePath,
    locale,
}: {
    asPath: string;
    basePath?: string;
    locale?: string;
}): string {
    let fullAsPath = asPath;
    if (basePath) fullAsPath = basePath + (fullAsPath === '/' ? '' : fullAsPath);
    if (locale) fullAsPath = `/${locale}${fullAsPath}`;
    return fullAsPath;
}

const PageTransition = React.forwardRef<HTMLElement, PageTransitionProps>((props, ref) => {
    const {
        as: Wrapper = 'main',
        inPhaseDuration = 600,
        outPhaseDuration = 600,
        disableDefaultStyles = false,
        onSaveScrollPos,
        onRetrieveScrollPos,
        className,
        children,
    } = props;

    const removeExpiredStyles = useNextCssRemovalPrevention();

    const saveScrollPos = onSaveScrollPos ?? saveScrollPosDefault;
    const retrieveScrollPos = onRetrieveScrollPos ?? retrieveScrollPosDefault;

    const router = useRouter();
    const nextChild = React.useRef<React.ReactElement | null>(null);
    const timeout = React.useRef<number>(0);
    const scrollPos = React.useRef<ScrollPos | null>(null);
    const doRestoreScroll = React.useRef<boolean>(false);

    const [currentChild, setCurrentChild] = React.useState<React.ReactElement | null>(children);

    const [localState, setLocalState] = React.useState<PageTransitionState>(initialState);
    const contextState = React.useContext(StateContext);
    const setContextState = React.useContext(DispatchContext);
    const state = setContextState ? contextState : localState;
    const setState = setContextState ?? setLocalState;
    const phase = state.phase;

    const updateState = React.useCallback(
        (state: PageTransitionState) => {
            const { phase, currentUrl, targetUrl, phaseOutAnticipated = false } = state;
            const fullAsPath = getFullAsPath(router);
            const newState: PageTransitionState = {
                phase,
                phaseOutAnticipated,
                targetUrl: removeHash(fullAsPath),
                scrollPosY: scrollPos.current?.y ?? 0,
            };
            if (currentUrl) newState.currentUrl = removeHash(currentUrl);
            if (targetUrl) newState.targetUrl = removeHash(targetUrl);
            setState(newState);
        },
        [router, setState]
    );

    React.useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';

            const fullAsPath = getFullAsPath(router);

            const onBeforeUnload = (event: BeforeUnloadEvent) => {
                saveScrollPos(fullAsPath, { x: window.scrollX, y: window.scrollY });
                delete event.returnValue;
            };

            const onRouteChangeStart = (url: string) => {
                scrollPos.current = doRestoreScroll.current
                    ? retrieveScrollPos(url)
                    : { x: 0, y: 0, hash: getHash(url) };
                saveScrollPos(fullAsPath, { x: window.scrollX, y: window.scrollY });
                if (url !== fullAsPath) {
                    updateState({
                        phase,
                        phaseOutAnticipated: true,
                        currentUrl: fullAsPath,
                        targetUrl: url,
                    });
                }
                doRestoreScroll.current = false;
            };

            const onHashChangeComplete = (url: string) => {
                if (!getHash(url)) {
                    window.scrollTo(0, 0);
                }
            };

            window.addEventListener('beforeunload', onBeforeUnload);
            router.events.on('routeChangeStart', onRouteChangeStart);
            router.events.on('hashChangeComplete', onHashChangeComplete);
            router.beforePopState(state => {
                state.options.scroll = false;
                scrollPos.current = null;
                doRestoreScroll.current = true;
                return true;
            });

            return () => {
                window.removeEventListener('beforeunload', onBeforeUnload);
                router.events.off('routeChangeStart', onRouteChangeStart);
                router.events.off('hashChangeComplete', onHashChangeComplete);
                router.beforePopState(() => true);
            };
        }
    }, [router, phase, updateState, saveScrollPos, retrieveScrollPos]);

    React.useEffect(() => {
        const transitionOut = (next: React.ReactElement) => {
            nextChild.current = next;
            clearTimeout(timeout.current);
            timeout.current = window.setTimeout(handleOutComplete, outPhaseDuration);
            updateState({ phase: PageTransitionPhase.OUT });
        };

        const handleOutComplete = () => {
            const _nextChild = nextChild.current;
            const nextPhase = _nextChild ? PageTransitionPhase.APPEAR : PageTransitionPhase.IDLE;
            nextChild.current = null;
            setCurrentChild(_nextChild);
            updateState({ phase: nextPhase });
            removeExpiredStyles();
        };

        const transitionIn = () => {
            clearTimeout(timeout.current);
            timeout.current = window.setTimeout(handleInComplete, inPhaseDuration);
            updateState({ phase: PageTransitionPhase.IN });
        };

        const handleInComplete = () => {
            updateState({ phase: PageTransitionPhase.IDLE });
        };

        const restoreScroll = () => {
            if (scrollPos.current?.hash) {
                // Scroll to hash
                const el = document.querySelector(scrollPos.current.hash) as Element;
                if (el) {
                    const style = window.getComputedStyle(el);
                    const scrollMargin = style.getPropertyValue('scroll-margin-top');
                    const { top } = el.getBoundingClientRect();
                    const { scrollTop } = document.scrollingElement as HTMLElement;
                    const y = top + scrollTop - (scrollMargin ? parseFloat(scrollMargin) : 0);
                    window.scrollTo(0, y);
                    return;
                }
            }
            if (scrollPos.current) {
                // Restore scroll position
                const { x, y } = scrollPos.current;
                window.scrollTo(x, y);
            } else {
                // scrollPos is null on initial load.
                // We don't want to scroll to top in that case.
            }
        };

        switch (phase) {
            case PageTransitionPhase.APPEAR:
                transitionIn();
                break;
            case PageTransitionPhase.IDLE:
                if (children?.key !== currentChild?.key) {
                    transitionOut(children);
                }
                break;
            case PageTransitionPhase.OUT:
                nextChild.current = children;
                break;
            case PageTransitionPhase.IN:
                if (children !== currentChild) {
                    if (children?.key !== currentChild?.key) {
                        transitionOut(children);
                    } else {
                        // Here we swap the children
                        setCurrentChild(children);
                    }
                } else {
                    // TODO: handle anchors on initial load
                    restoreScroll();
                }
                break;
        }
    }, [phase, currentChild, children]); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        return () => {
            clearTimeout(timeout.current);
        };
    }, []);

    const defaultStyles = disableDefaultStyles ? null : styles[`transition-${phase.toLowerCase()}`];
    const rootClasses = cx(defaultStyles, className);
    const rootStyle = {
        '--transition-in-duration': `${inPhaseDuration}ms`,
        '--transition-out-duration': `${outPhaseDuration}ms`,
    };

    return (
        <Wrapper ref={ref} className={rootClasses} style={rootStyle}>
            {!disableDefaultStyles && (
                <Head>
                    <style type="text/css">
                        {`${styles['transition-appear']} { opacity: 0.001; }`}
                    </style>
                </Head>
            )}
            {currentChild}
        </Wrapper>
    );
});

interface PageTransitionContextProps {
    children: React.ReactNode;
}
export const PageTransitionContext: React.FC<PageTransitionContextProps> = ({ children }) => {
    const [state, setState] = React.useState<PageTransitionState>(initialState);
    return (
        <DispatchContext.Provider value={setState}>
            <StateContext.Provider value={state}>{children}</StateContext.Provider>
        </DispatchContext.Provider>
    );
};

export const usePageTransitionState = (): PageTransitionState => {
    return React.useContext(StateContext);
};

export { Link, type LinkProps } from './helpers/Link';
export { useAsPathWithoutHash } from './helpers/useAsPathWithoutHash';
export { useNextCssRemovalPrevention } from './helpers/useNextCssRemovalPrevention';

export default PageTransition;
