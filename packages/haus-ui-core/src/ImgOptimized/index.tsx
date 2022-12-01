import { Fragment, memo } from "react";

// This component requires Contentful's Image API
// Inspiration: https://www.contentful.com/blog/2019/10/31/webp-source-sets-images-api/

type Source = {
  breakpoint?: number;
  src?: string;
  imageWidth: number;
  orientation?: string;
};

export interface ImgOptimizedProps {
  alt: string;
  className?: string;
  customSources?: Source[];
  decoding?: "async" | "sync" | "auto";
  draggable?: boolean;
  fallbackImageWidth: number;
  loading?: "eager" | "lazy";
  priority?: boolean;
  src: string;
}

const breakpoints = {
  small: 768,
  medium: 1024,
  large: 1440,
  xLarge: 1440,
  xxLarge: 1920,
};

function getDefaultCustomSources(ogSrc: string) {
  const breakpointSources = Object.values(breakpoints).map((breakpoint) => {
    return {
      breakpoint: breakpoint,
      src: ogSrc,
      imageWidth: breakpoint * 1.5,
    };
  });

  return [...breakpointSources, { src: ogSrc, imageWidth: 768 }];
}

// detects webp in accept headers and redirects to webp
function negotiatedFallback(ogSrc: String) {
  return ogSrc.replace(`//images.ctfassets.net`, `/api/images/cdn`);
}

export const ImgOptimized = memo(
  ({
    alt = "",
    className,
    customSources = [],
    draggable = false,
    fallbackImageWidth = 1280,
    loading = "lazy",
    priority = false,
    decoding,
    src: ogSrc,
    ...rest
  }: ImgOptimizedProps) => {
    const hasNoFallbackCustomSource =
      customSources?.length &&
      customSources.length > 0 &&
      customSources.every((source) => source.breakpoint);

    hasNoFallbackCustomSource &&
      console.warn(
        "ImgOptimized.js: For optimization purposes, it is *highly recommended* that you include a fallback custom source with no breakpoint."
      );

    // Round with to nearest integer to keep Contentful's Image API happy
    const fallbackWidth = Math.round(fallbackImageWidth);
    const isGif = /.gif$/i.test(ogSrc);
    const fallbackQuality = isGif ? 100 : 90;
    const quality = isGif ? 100 : 80;
    const sources: Source[] =
      customSources?.length && customSources?.length > 0
        ? customSources
        : getDefaultCustomSources(ogSrc);

    return (
      <picture>
        {sources.map(
          ({ breakpoint, orientation, imageWidth, src: breakpointSrc }, i) => {
            // Max image values at 2560px and round width to nearest integer to keep Contentful's Image API happy
            const w = Math.round(Math.min(imageWidth, 2560));

            return (
              <Fragment key={i}>
                <source
                  media={
                    orientation
                      ? `(orientation: ${orientation})`
                      : breakpoint
                      ? `(min-width: ${String(breakpoint)}px)`
                      : undefined
                  }
                  srcSet={`${
                    breakpointSrc ?? ogSrc
                  }?w=${w}&fm=webp&q=${quality}`}
                  type="image/webp"
                />
                <source
                  media={
                    orientation
                      ? `(orientation: ${orientation})`
                      : breakpoint
                      ? `(min-width: ${breakpoint}px)`
                      : undefined
                  }
                  srcSet={`${breakpointSrc ?? ogSrc}?w=${w}&q=${quality}`}
                />
              </Fragment>
            );
          }
        )}
        <img
          alt={alt}
          src={negotiatedFallback(
            `${ogSrc}?w=${fallbackWidth}&q=${fallbackQuality}`
          )}
          className={className}
          draggable={draggable}
          loading={priority ? "eager" : loading}
          decoding={priority ? "sync" : decoding}
          // @ts-ignore:next-line
          // eslint-disable-next-line react/no-unknown-property
          fetchriority={priority ? "high" : "low"}
          {...rest}
        />
      </picture>
    );
  }
);

ImgOptimized.displayName = "ImgOptimized";
