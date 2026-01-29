/**
 * Runtime style injection for @madeinhaus/nextjs-page-transition
 * Works with both Webpack and Turbopack
 */

/**
 * Injects page transition styles into the document head
 * Safe to call multiple times - will only inject once
 */
export const injectTransitionStyles = (): void => {
    // Skip on server-side
    if (typeof document === 'undefined') return;

    const styleId = 'transition-styles';

    // Don't inject if already present
    if (document.getElementById(styleId)) return;

    const styles = `
    /* Page Transition Styles */
    .transition-appear {
        opacity: 0.001;
    }

    .transition-in {
        animation: fadeIn var(--transition-in-duration, 600ms) linear both;
    }

    .transition-out {
        animation: fadeOut var(--transition-out-duration, 600ms) linear both;
    }

    .transition-idle {
        opacity: 1;
    }

    @keyframes fadeIn {
        0% {
            opacity: 0.001;
        }
        100% {
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        0% {
            opacity: 1;
        }
        100% {
            opacity: 0.001;
        }
    }
  `;

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;

    // Insert at the start of head so user styles can override
    document.head.insertBefore(styleElement, document.head.firstChild);

    if (process.env.NODE_ENV === 'development') {
        console.log('[transition] Styles injected');
    }
};

/**
 * Removes injected transition styles
 * Useful for cleanup in testing or unmounting
 */
export const removeTransitionStyles = (): void => {
    if (typeof document === 'undefined') return;

    const styleElement = document.getElementById('transition-styles');
    if (styleElement) {
        styleElement.remove();

        if (process.env.NODE_ENV === 'development') {
            console.log('[transition] Styles removed');
        }
    }
};

/**
 * Check if transition styles are already injected
 */
export const hasTransitionStyles = (): boolean => {
    if (typeof document === 'undefined') return false;
    return document.getElementById('transition-styles') !== null;
};
