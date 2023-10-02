import * as React from 'react';
import { useIntersectionObserver } from '../../hooks/src/useIntersectionObserver';

export interface TexturalVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    className?: string;
    primaryVideoUrl?: string;
    primaryVideoType?: string;
    secondaryVideoUrl?: string;
    secondaryVideoType?: string;
    threshold?: number;
}

const TexturalVideo = ({
    className,
    primaryVideoUrl,
    primaryVideoType = 'video/webm',
    secondaryVideoUrl,
    secondaryVideoType = 'video/mp4',
    poster,
    threshold = 0,
    ...rest
}: TexturalVideoProps) => {
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

    const primaryVideoSource = primaryVideoUrl && (
        <source src={primaryVideoUrl} type={primaryVideoType} />
    );

    const secondaryVideoSource = secondaryVideoUrl && (
        <source src={secondaryVideoUrl} type={secondaryVideoType} />
    );

    return (
        <video
            ref={videoRef}
            className={className}
            poster={poster}
            aria-hidden
            autoPlay
            disableRemotePlayback
            loop
            muted
            playsInline
            {...rest}
        >
            {primaryVideoSource}
            {secondaryVideoSource}
        </video>
    );
};

export default TexturalVideo;
