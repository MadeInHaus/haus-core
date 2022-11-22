import { useEffect, useRef } from "react";
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

export interface VideoProps {
  playState: "loadstart" | "play" | "pause";
  poster: string;
  sources: string[];
  textural?: boolean;
  threshold?: number;
  [key: string]: any;
}

export const Video = ({
  playState = "loadstart",
  poster,
  sources,
  textural = true,
  threshold = 0.25,
  ...props
}: VideoProps) => {
  const videoRef = useRef<any>(null);

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

  useEffect(() => {
    const intersecting = intersection && intersection.isIntersecting;
    intersecting === true && playVideo();
    intersecting === false && pauseVideo();
  }, [intersection, playState]);

  useEffect(() => {
    playState === "play" && playVideo();
    playState === "pause" && pauseVideo();
  }, [playState]);

  const videoProps = Object.assign(
    textural ? texturalProps : defaultProps,
    props
  );

  return (
    <video
      {...videoProps}
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
