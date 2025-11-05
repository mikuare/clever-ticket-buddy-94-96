import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square, Play, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  className?: string;
}

const AudioRecorder = ({ onAudioReady, onCancel, className }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const playRecording = () => {
    if (audioUrl && !isPlaying) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const sendRecording = () => {
    if (audioUrl) {
      fetch(audioUrl)
        .then(response => response.blob())
        .then(blob => {
          onAudioReady(blob, recordingTime);
        });
    }
  };

  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioUrl && !isRecording) {
    // Show playback interface
    return (
      <div className={cn("p-4 bg-accent/30 rounded-lg border border-accent", className)}>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={playRecording}
            className="flex-shrink-0"
          >
            <Play className={cn("w-4 h-4", isPlaying && "opacity-50")} />
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-accent-foreground">
                Audio Recording
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(recordingTime)}
              </span>
            </div>
            <div className="w-full bg-accent/50 h-1 rounded-full mt-1">
              <div className="h-full bg-primary/60 rounded-full w-1/3"></div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={discardRecording}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              onClick={sendRecording}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-accent/30 rounded-lg border border-accent", className)}>
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <Button
            type="button"
            onClick={startRecording}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Mic className="w-4 h-4 mr-2" />
            Start Recording
          </Button>
        ) : (
          <>
            <Button
              type="button"
              onClick={togglePause}
              size="sm"
              variant="outline"
              className="flex-shrink-0"
            >
              {isPaused ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm font-medium text-red-600">
                  {isPaused ? 'Paused' : 'Recording'} - {formatTime(recordingTime)}
                </span>
              </div>
            </div>
            
            <Button
              type="button"
              onClick={stopRecording}
              size="sm"
              variant="outline"
              className="flex-shrink-0"
            >
              <Square className="w-4 h-4" />
            </Button>
          </>
        )}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex-shrink-0"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AudioRecorder;