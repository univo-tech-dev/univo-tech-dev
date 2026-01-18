import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX, Minimize } from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    className?: string;
    poster?: string;
}

export default function VideoPlayer({ src, className = "", poster }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    let controlsTimeout: NodeJS.Timeout;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            setCurrentTime(video.currentTime);
            setProgress((video.currentTime / video.duration) * 100);
        };

        const updateDuration = () => {
            setDuration(video.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setShowControls(true);
        };

        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('loadedmetadata', updateDuration);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', updateProgress);
            video.removeEventListener('loadedmetadata', updateDuration);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (videoRef.current) {
            const time = (value / 100) * videoRef.current.duration;
            videoRef.current.currentTime = time;
            setProgress(value);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = value;
            setVolume(value);
            setIsMuted(value === 0);
        }
    };

    const toggleFullscreen = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            try {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } catch (err) {
                console.error("Error attempting to enable fullscreen:", err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Auto-hide controls
    const handleMouseMove = () => {
        setShowControls(true);
        clearTimeout(controlsTimeout);
        if (isPlaying) {
            controlsTimeout = setTimeout(() => setShowControls(false), 2000);
        }
    };

    const handleMouseLeave = () => {
        if (isPlaying) {
            setShowControls(false);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div 
            ref={containerRef}
            className={`relative group bg-black overflow-hidden select-none ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={togglePlay}
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain"
                poster={poster}
            />

            {/* Play/Pause Overlay Icon (Centered) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <div className="bg-black/50 p-4 rounded-full backdrop-blur-sm">
                        <Play size={32} className="text-white fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Controls Bar */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-12 pb-2 px-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} onClick={(e) => e.stopPropagation()}>
                {/* Progress Bar */}
                <div className="relative h-1 mb-4 group/progress cursor-pointer">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    />
                    <div className="absolute inset-0 bg-white/30 rounded-full">
                        <div 
                            className="bg-primary h-full rounded-full relative" 
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/progress:scale-100 transition-transform" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                            {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
                        </button>

                        <div className="flex items-center gap-2 group/volume">
                            <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
                                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                />
                            </div>
                        </div>

                        <span className="text-white/80 text-xs font-mono">
                            {formatTime(currentTime)} / {formatTime(duration || 0)}
                        </span>
                    </div>

                    <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
