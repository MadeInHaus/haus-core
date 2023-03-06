import TexturalVideo from '@madeinhaus/textural-video';

const TexturalVideoDemoTransparent: React.FC = () => {
  return (
    <TexturalVideo
      mp4="https://happiest.madeinhaus.com/videos/laughs.mp4"
      webm="https://happiest.madeinhaus.com/videos/laughs.webm"
      isTransparent
    />
  );
};

export default TexturalVideoDemoTransparent;
