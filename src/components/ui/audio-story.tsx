import React from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AudioStoryProps {
  title?: string;
  description?: string;
  audioUrl: string;
  className?: string;
}

const AudioStory: React.FC<AudioStoryProps> = ({ 
  title = "Real Victim Story", 
  description = "Listen to a firsthand account from a solar fraud victim",
  audioUrl,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`my-8 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-full">
            <Volume2 className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Audio Element */}
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          />
          
          {/* Play Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="flex items-center justify-center w-12 h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors"
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
            
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(currentTime / duration) * 100}%, #fed7aa ${(currentTime / duration) * 100}%, #fed7aa 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
          
          {/* Warning Notice */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Content Warning:</strong> This audio contains accounts of financial fraud that some listeners may find distressing.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioStory;