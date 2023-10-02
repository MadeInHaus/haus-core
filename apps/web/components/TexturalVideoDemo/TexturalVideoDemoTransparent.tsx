import TexturalVideo from '@madeinhaus/textural-video';

const TexturalVideoDemoTransparent: React.FC = () => {
  return (
    <TexturalVideo
      primaryVideoUrl="https://happiest.madeinhaus.com/videos/laughs.mp4"
      primaryVideoType='video/mp4; codecs="hvc1"'
      secondaryVideoUrl="https://happiest.madeinhaus.com/videos/laughs.webm"
      secondaryVideoType='video/webm'
  />
  );
};

export default TexturalVideoDemoTransparent;
