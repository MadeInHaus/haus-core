import * as React from 'react';

type ImagePreloadResult = readonly [
    boolean,
    (el: HTMLImageElement | null) => void, // eslint-disable-line no-unused-vars
    React.MutableRefObject<HTMLImageElement | null>
];

export const useImagePreload = (): ImagePreloadResult => {
    const [loaded, setLoaded] = React.useState<boolean>(false);
    const imgRef = React.useRef<HTMLImageElement | null>(null);
    const handleLoad = React.useCallback(() => {
        if (imgRef.current) {
            imgRef.current.removeEventListener('load', handleLoad);
            imgRef.current.removeEventListener('error', handleLoad);
        }
        setLoaded(true);
    }, []);
    const fnRef = React.useCallback(
        (img: HTMLImageElement | null) => {
            if (img) {
                if (img.complete && img.naturalWidth && img.naturalHeight) {
                    handleLoad();
                } else {
                    img.addEventListener('load', handleLoad);
                    img.addEventListener('error', handleLoad);
                }
            } else {
                if (imgRef.current) {
                    imgRef.current.removeEventListener('load', handleLoad);
                    imgRef.current.removeEventListener('error', handleLoad);
                }
            }
            imgRef.current = img;
        },
        [handleLoad]
    );
    return [loaded, fnRef, imgRef] as const;
};
