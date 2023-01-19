import React, { useRef, useEffect } from 'react';
import { useIntersection } from '../../hooks/useIntersection';

export interface TexturalVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    className?: string;
    isTransparent?: boolean;
    mp4?: string;
    webm?: string;
    threshold: number;
}

export const TexturalVideo = ({
    className,
    isTransparent = false,
    mp4,
    webm,
    poster,
    threshold = 0,
    title,

    ...rest
}: TexturalVideoProps) => {
    if (isTransparent && !mp4) {
        console.warn('TexturalVideo: Safari requires mp4 format for transparent vidoes.');
    }

    const videoRef = useRef<HTMLVideoElement>(null);

    // Ref: https://developer.chrome.com/blog/play-request-was-interrupted/
    const playPromise = videoRef.current && videoRef.current.play();

    const intersection = useIntersection(videoRef, {
        root: null,
        rootMargin: '0px',
        threshold,
    });

    function playVideo() {
        playPromise &&
            playPromise
                .then(() => {
                    videoRef.current?.play();
                })
                .catch(error => {
                    console.error(error);
                });
    }

    function pauseVideo() {
        playPromise &&
            playPromise
                .then(() => {
                    videoRef.current?.pause();
                })
                .catch(error => {
                    console.error(error);
                });
    }

    useEffect(() => {
        const intersecting = intersection?.isIntersecting;

        if (intersecting) {
            playVideo();
        }

        if (!intersecting) {
            pauseVideo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intersection]);

    return (
        <video
            ref={videoRef}
            className={className}
            poster={poster}
            title={title}
            aria-hidden
            autoPlay
            disableRemotePlayback
            loop
            muted
            playsInline
            {...rest}
        >
            {mp4 && (
                <source src={mp4} type={isTransparent ? 'video/mp4; codecs="hvc1"' : 'video/mp4'} />
            )}
            {webm && <source src={webm} type="video/webm" />}
        </video>
    );
};
