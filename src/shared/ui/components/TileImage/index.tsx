import React from "react";

interface ITileImageProps {
  title: string;
  src: string;
  averageColor?: string;
  onClick?: () => void;
}

const TileImage: React.FC<ITileImageProps> = ({ title, src, averageColor, onClick }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [failedLoading, setFailedLoading] = React.useState(false);

  const ready = loaded && !failedLoading;

  return (
    <img
      title={title} //
      onClick={onClick}
      src={src}
      className="pixelated"
      onLoad={() => setLoaded(true)}
      onError={() => setFailedLoading(true)}
      style={{ backgroundColor: !ready ? averageColor : undefined }}
    />
  );
};

export default TileImage;
