import React, { useState, useRef } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

const VideoToGifConverter = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const fileInputRef = useRef();

  const loadFFmpeg = async () => {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }
    setIsLoaded(true);
  };

  const handleFileChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const convertToGif = async () => {
    await loadFFmpeg();

    if (videoFile) {
      const fileName = videoFile.name;
      const fileExtension = fileName.split('.').pop();

      ffmpeg.FS('writeFile', `input.${fileExtension}`, await fetchFile(videoFile));
      await ffmpeg.run('-i', `input.${fileExtension}`, '-t', '5', '-vf', 'fps=10,scale=320:-1:flags=lanczos', 'output.gif');
      const data = ffmpeg.FS('readFile', 'output.gif');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));

      setGifUrl(url);
    }
  };

  return (
    <div>
      <h1>Video to GIF Converter</h1>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
      />
      <button onClick={convertToGif} disabled={!videoFile}>
        Convert to GIF
      </button>
      {gifUrl && (
        <div>
          <h2>Resulting GIF:</h2>
          <img src={gifUrl} alt="Converted GIF" />
        </div>
      )}
    </div>
  );
};

export default VideoToGifConverter;
