import * as React from 'react';

export interface TexturalVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    className?: string;
    primaryVideoUrl?: string;
    primaryVideoType?: string;
    secondaryVideoUrl?: string;
    secondaryVideoType?: string;
}

const TexturalVideo = React.forwardRef<HTMLVideoElement, TexturalVideoProps>((props, ref) => {
    const {
        className,
        primaryVideoUrl,
        primaryVideoType = 'video/webm',
        secondaryVideoUrl,
        secondaryVideoType = 'video/mp4',
        poster,
        ...rest
    } = props;

    const primaryVideoSource = primaryVideoUrl && (
        <source src={primaryVideoUrl} type={primaryVideoType} />
    );

    const secondaryVideoSource = secondaryVideoUrl && (
        <source src={secondaryVideoUrl} type={secondaryVideoType} />
    );

    return (
        <video
            ref={ref}
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
});

export default TexturalVideo;
