import * as React from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

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
    if (isTransparent && !(mp4 && webm)) {
        console.warn(
            'TexturalVideo: Please make sure you have both webm and mp4 formats for cross-browser support for transparent videos.'
        );
    }

    const [isIntersecting, videoRef, videoEl] = useIntersectionObserver<HTMLVideoElement>({
        once: false,
        threshold,
    });

    // Ref: https://developer.chrome.com/blog/play-request-was-interrupted/
    const playPromise = videoEl.current && videoEl.current.play();

    function playVideo() {
        playPromise &&
            playPromise
                .then(() => {
                    videoEl.current?.play();
                })
                .catch(error => {
                    console.error(error);
                });
    }

    function pauseVideo() {
        playPromise &&
            playPromise
                .then(() => {
                    videoEl.current?.pause();
                })
                .catch(error => {
                    console.error(error);
                });
    }

    React.useEffect(() => {
        if (isIntersecting) {
            playVideo();
        } else {
            pauseVideo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isIntersecting]);

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
