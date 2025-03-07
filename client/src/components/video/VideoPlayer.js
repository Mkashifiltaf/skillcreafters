import React, { useState, useRef } from 'react';
import { saveAs } from 'file-saver';

const VideoPlayer = ({ 
  videoUrl, 
  title, 
  description, 
  instructor,
  downloadUrl,
  onLike,
  onShare,
  onSave,
  relatedVideos,
  comments,
  transcripts
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [quality, setQuality] = useState('auto');
  const videoRef = useRef(null);

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    videoRef.current.volume = value;
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    videoRef.current.playbackRate = speed;
  };

  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
    // TODO: Implement quality switching logic
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      saveAs(blob, `${title}.mp4`);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s]
      .map(v => v < 10 ? '0' + v : v)
      .filter((v, i) => v !== '00' || i > 0)
      .join(':');
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="bg-black relative">
        <video
          ref={videoRef}
          className="w-full aspect-video"
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
        
        {/* Custom Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="relative h-1 bg-gray-600 cursor-pointer mb-4">
            <div
              className="absolute h-full bg-red-600"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <button onClick={handlePlayPause}>
                {isPlaying ? (
                  <i className="fas fa-pause"></i>
                ) : (
                  <i className="fas fa-play"></i>
                )}
              </button>

              <div className="flex items-center space-x-2">
                <i className="fas fa-volume-up"></i>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="hover:text-gray-300">
                  {playbackSpeed}x
                </button>
                <div className="absolute bottom-full right-0 hidden group-hover:block bg-black/90 p-2 rounded">
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className="block w-full text-left px-4 py-1 hover:bg-gray-700"
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <button className="hover:text-gray-300">
                  {quality}
                </button>
                <div className="absolute bottom-full right-0 hidden group-hover:block bg-black/90 p-2 rounded">
                  {['auto', '1080p', '720p', '480p', '360p'].map(q => (
                    <button
                      key={q}
                      onClick={() => handleQualityChange(q)}
                      className="block w-full text-left px-4 py-1 hover:bg-gray-700"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setShowTranscript(!showTranscript)}>
                <i className="fas fa-closed-captioning"></i>
              </button>

              <button onClick={() => videoRef.current.requestFullscreen()}>
                <i className="fas fa-expand"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="mt-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-4">
            <img
              src={instructor.avatar}
              alt={instructor.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium">{instructor.name}</p>
              <p className="text-sm text-gray-500">{instructor.subscribers} subscribers</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={onLike} className="flex items-center space-x-1">
              <i className="far fa-thumbs-up"></i>
              <span>Like</span>
            </button>
            <button onClick={onShare} className="flex items-center space-x-1">
              <i className="fas fa-share"></i>
              <span>Share</span>
            </button>
            <button onClick={onSave} className="flex items-center space-x-1">
              <i className="far fa-bookmark"></i>
              <span>Save</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
            >
              <i className="fas fa-download"></i>
              <span>Download</span>
            </button>
          </div>
        </div>

        <div className="mt-4 bg-gray-100 rounded-lg p-4">
          <p className="text-gray-800">{description}</p>
        </div>
      </div>

      {/* Transcript */}
      {showTranscript && (
        <div className="mt-4 bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Transcript</h3>
          <div className="max-h-60 overflow-y-auto">
            {transcripts.map((item, index) => (
              <div
                key={index}
                className="py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  videoRef.current.currentTime = item.timestamp;
                }}
              >
                <span className="text-gray-500 mr-2">{formatTime(item.timestamp)}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Videos */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Related Videos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedVideos.map((video, index) => (
            <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h4 className="font-medium">{video.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{video.views} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
