import React, { useRef, useEffect } from 'react';
import { useIntersection } from 'react-use';

export interface TexturalVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    className?: string;
    isTransparent?: boolean;
    mp4?: string;
    webm?: string;
}

export const TexturalVideo = ({
    className,
    title,
    isTransparent = false,
    mp4,
    webm,
    poster,
    ...rest
}: TexturalVideoProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const intersection = useIntersection(videoRef, {
        root: null,
        rootMargin: '0px',
        threshold: 0,
    });

    function playVideo() {
        try {
            videoRef.current?.play();
        } catch (e) {
            console.warn(e);
        }
    }

    function pauseVideo() {
        try {
            videoRef.current?.pause();
        } catch (e) {
            console.warn(e);
        }
    }

    useEffect(() => {
        const intersecting = intersection?.isIntersecting;

        if (intersecting) {
            playVideo();
        }

        if (!intersecting) {
            pauseVideo();
        }
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
