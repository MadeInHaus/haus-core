import React, { useEffect, useRef } from "react";
import { useIntersection } from "react-use";

const getFileExtension = (filename = "") => {
  return filename.split(".").pop();
};

const defaultProps = {
  controls: true,
};

const texturalProps = {
  autoPlay: true,
  muted: true,
  playsInline: true,
  controls: false,
  loop: true,
  preload: "auto",
  disablePictureInPicture: true,
};

export interface VideoProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  playState: "loadstart" | "play" | "pause";
  poster: string;
  sources: string[];
  textural?: boolean;
  threshold?: number;
}

export const Video = ({
  playState = "loadstart",
  poster,
  sources,
  textural = true,
  threshold = 0.25,
  ...rest
}: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const intersection = useIntersection(videoRef, {
    root: null,
    rootMargin: "0px",
    threshold,
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

  const playStateMap: {
    play: () => void;
    pause: () => void;
  } = {
    play: playVideo,
    pause: pauseVideo,
  };

  useEffect(() => {
    const isIntersecting = intersection?.isIntersecting;

    if (isIntersecting) {
      playVideo();
    }

    if (!isIntersecting) {
      pauseVideo();
    }
  }, [intersection, playState]);

  useEffect(() => {
    if (playState === "loadstart") {
      return;
    }

    const videoAction = playStateMap[playState];

    videoAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playState]);

  const videoProps = textural ? texturalProps : defaultProps;

  return (
    <video
      {...videoProps}
      {...rest}
      poster={poster ? `${poster}?w=1200&fm=webp&q=80` : undefined}
      ref={videoRef}
    >
      {sources.map((source) => {
        const type = getFileExtension(source);

        return (
          <source key={source} src={source} type={`video/${type}`}></source>
        );
      })}
    </video>
  );
};
