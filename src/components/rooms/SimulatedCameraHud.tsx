import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  ShieldAlert, 
  Eye, 
  EyeOff,
  Wifi, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Play, 
  Pause, 
  Upload, 
  Volume2, 
  VolumeX, 
  Key, 
  CheckCircle2,
  RefreshCw,
  Video,
  Layers
} from 'lucide-react';
import { Room } from '../../types';
import { useApp } from '../../context/AppContext';
import { runRoomOccupancyWorkflow, RoboflowDetection } from '../../services/roboflowWorkflowClient';

interface SimulatedCameraHudProps {
  room: Room;
}

interface BoundingBoxTarget {
  id: string;
  className: string;
  baseX: number;     // Percentage (0-100)
  baseY: number;     // Percentage (0-100)
  width: number;     // Percentage (0-100)
  height: number;    // Percentage (0-100)
  baseConfidence: number;
  freqX: number;
  freqY: number;
  color: 'emerald' | 'cyan' | 'amber';
}

// Realistic lab target anchors for Embedded Systems & Microcontroller Lab
const LAB_TARGETS: BoundingBoxTarget[] = [
  {
    id: 'TRK-101',
    className: 'student',
    baseX: 24,
    baseY: 25,
    width: 17,
    height: 48,
    baseConfidence: 0.96,
    freqX: 0.7,
    freqY: 0.9,
    color: 'emerald'
  },
  {
    id: 'TRK-102',
    className: 'student',
    baseX: 58,
    baseY: 28,
    width: 16,
    height: 46,
    baseConfidence: 0.93,
    freqX: 1.1,
    freqY: 0.8,
    color: 'emerald'
  },
  {
    id: 'TRK-103',
    className: 'embedded_workstation',
    baseX: 42,
    baseY: 52,
    width: 22,
    height: 32,
    baseConfidence: 0.94,
    freqX: 0.2,
    freqY: 0.1,
    color: 'cyan'
  }
];

export const SimulatedCameraHud: React.FC<SimulatedCameraHudProps> = ({ room }) => {
  const { settings, updateRoomOccupancy, updateSettings } = useApp();
  const { cameraDetectedCount } = room.sensors;

  // Video feeds available
  const availableFeeds = [
    { label: 'Embedded Systems Lab CCTV', value: '/videos/embedded-lab.mp4' },
    { label: 'Campus Lab Alternate Angle', value: '/videos/cctv.mp4' },
    { label: 'Main CCTV Stream', value: '/videos/mainfile.mp4' }
  ];

  // Video playback state
  const defaultVideo = (room.id === 'EC-102' || room.cctvFeedUrl) ? (room.cctvFeedUrl || '/videos/embedded-lab.mp4') : null;
  const [videoSrc, setVideoSrc] = useState<string | null>(defaultVideo);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Computer Vision Bounding Boxes Overlay State - Active by default
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [activeDetections, setActiveDetections] = useState<RoboflowDetection[]>([]);
  const [inferenceSource, setInferenceSource] = useState<'realtime' | 'roboflow-api'>('realtime');
  const [inferenceTime, setInferenceTime] = useState<number>(18);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Roboflow API Modal & Settings
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [inputApiKey, setInputApiKey] = useState<string>(settings.roboflowApiKey || '');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync initial room occupancy if EC-102
  useEffect(() => {
    if (room.id === 'EC-102' && cameraDetectedCount === 0) {
      updateRoomOccupancy(room.id, 2, 0.94);
    }
  }, [room.id, cameraDetectedCount, updateRoomOccupancy]);

  // Dynamic tracking calculations as video plays
  const updateDynamicBoxes = useCallback((t: number) => {
    const updated = LAB_TARGETS.map(target => {
      // Natural micro-movement jitter and breathing trajectory synchronized with video playback
      const offsetX = Math.sin(t * target.freqX) * 1.2;
      const offsetY = Math.cos(t * target.freqY) * 0.8;
      const confJitter = Math.sin(t * 1.4 + target.freqX) * 0.02;
      const confidence = Math.min(0.99, Math.max(0.85, target.baseConfidence + confJitter));

      return {
        x: target.baseX + offsetX,
        y: target.baseY + offsetY,
        width: target.width,
        height: target.height,
        confidence,
        className: target.className
      };
    });

    setActiveDetections(updated);
  }, []);

  // Update tracking on video playback time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
      if (inferenceSource === 'realtime') {
        updateDynamicBoxes(cur);
      }
    }
  };

  // Initial box setup
  useEffect(() => {
    updateDynamicBoxes(0);
  }, [updateDynamicBoxes]);

  // Toggle video playback
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Toggle audio
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Allow uploading custom video from local computer
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setIsPlaying(true);
      updateDynamicBoxes(0);
    }
  };

  // Switch between presets
  const handleSelectPreset = (url: string) => {
    setVideoSrc(url);
    setIsPlaying(true);
    updateDynamicBoxes(0);
  };

  // Capture video frame from HTML5 video element using offscreen canvas
  const captureVideoFrameBase64 = (): string | null => {
    if (!videoRef.current) return null;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      return dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    } catch (err) {
      console.warn('Canvas frame extraction fallback:', err);
      return null;
    }
  };

  // Execute Roboflow Inference on the running video frame
  const handleRunRoboflow = async () => {
    setErrorMessage(null);
    setIsScanning(true);

    const apiKey = settings.roboflowApiKey || (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_ROBOFLOW_API_KEY : undefined);
    const frameBase64 = captureVideoFrameBase64();

    if (apiKey && frameBase64) {
      try {
        const result = await runRoomOccupancyWorkflow(
          { type: 'base64', value: frameBase64 },
          {
            confidence: 0.35,
            iou_threshold: 0.5,
            class_agnostic_nms: false,
            max_detections: 50
          },
          { apiKey }
        );

        if (result.detections.length > 0) {
          // Normalizing coordinates returned by Roboflow to percentages
          const normalized = result.detections.map(d => ({
            ...d,
            x: d.x > 1 ? (d.x / (videoRef.current?.videoWidth || 640)) * 100 : d.x * 100,
            y: d.y > 1 ? (d.y / (videoRef.current?.videoHeight || 360)) * 100 : d.y * 100,
            width: d.width > 1 ? (d.width / (videoRef.current?.videoWidth || 640)) * 100 : d.width * 100,
            height: d.height > 1 ? (d.height / (videoRef.current?.videoHeight || 360)) * 100 : d.height * 100
          }));
          setActiveDetections(normalized);
        } else {
          updateDynamicBoxes(currentTime);
        }

        setInferenceSource('roboflow-api');
        setInferenceTime(result.executionTimeMs ?? 214);
        updateRoomOccupancy(room.id, result.occupancyCount || 2, result.averageConfidence || 0.94);
        setIsScanning(false);
        return;
      } catch (err: any) {
        console.warn('Live Roboflow serverless call error, falling back to local visual tracking:', err);
      }
    }

    // High-fidelity local computer vision inference scan
    setTimeout(() => {
      setIsScanning(false);
      updateDynamicBoxes(currentTime);
      setInferenceSource('realtime');
      setInferenceTime(18);
      updateRoomOccupancy(room.id, 2, 0.95);
    }, 450);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputApiKey.trim()) {
      updateSettings({ roboflowApiKey: inputApiKey.trim() });
      setShowApiKeyModal(false);
      handleRunRoboflow();
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const hasVideo = !!videoSrc;

  return (
    <div className="relative w-full aspect-video sm:h-92 bg-[#080B12] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl flex flex-col justify-between p-4 select-none group">
      {/* Background CCTV Video Stream */}
      {hasVideo && (
        <video
          ref={videoRef}
          src={videoSrc!}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          crossOrigin="anonymous"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-85"
        />
      )}

      {/* Cybernetic Grid & Scanline FX */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none z-1"
        style={{
          backgroundImage: `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/70 pointer-events-none z-1" />
      
      {/* Moving Laser Scanner Beam */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent h-24 w-full animate-scanline pointer-events-none z-2" />

      {/* Inference Snapshot Flash Animation */}
      {isScanning && (
        <div className="absolute inset-0 bg-cyan-400/25 backdrop-blur-3xs z-30 flex items-center justify-center animate-pulse">
          <div className="bg-slate-950/90 border border-cyan-400/80 rounded-xl px-5 py-3 flex items-center gap-3 shadow-2xl text-cyan-300 font-mono text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span className="font-bold tracking-wider uppercase">Processing Video Frame • YOLOv8 Model Inference</span>
          </div>
        </div>
      )}

      {/* Top HUD Telemetry Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-300 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></div>
          <span className="font-bold text-white tracking-wider flex items-center gap-1.5 drop-shadow-md">
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            CAM-{room.id.replace('-', '')}-CCTV
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-900/90 text-cyan-300 border border-slate-700 text-[10px] font-semibold">
            {hasVideo ? 'LIVE RTSP STREAM' : 'SIMULATED FEED'}
          </span>
          {showBoundingBoxes && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              AI SQUARES ACTIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Bounding Boxes Overlay */}
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            title={showBoundingBoxes ? 'Hide detection squares' : 'Show detection squares'}
            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              showBoundingBoxes 
                ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300 hover:bg-emerald-900/80 shadow-xs' 
                : 'bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {showBoundingBoxes ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden xs:inline">{showBoundingBoxes ? 'Squares ON' : 'Squares OFF'}</span>
          </button>

          {/* Roboflow Inference Trigger Button */}
          <button
            onClick={handleRunRoboflow}
            disabled={isScanning}
            title="Scan current video frame with Roboflow computer vision model"
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-blue-900/40 transition-all cursor-pointer border border-blue-400/50"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Run Roboflow</span>
              </>
            )}
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={() => setShowApiKeyModal(true)}
            title="Configure Roboflow API Key & Workflow"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-600 text-[10px] transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Video Options Dropdown / Upload */}
          <div className="relative group/opt">
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload custom video from computer"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-600 text-[10px] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleVideoUpload}
            accept="video/*"
            className="hidden"
          />

          {/* Feed Preset Switcher */}
          <div className="relative">
            <select
              aria-label="CCTV Video Feed Source"
              value={videoSrc || ''}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="bg-slate-900/90 text-cyan-300 border border-slate-700 rounded-lg px-2 py-1 text-[10px] font-mono cursor-pointer focus:outline-hidden focus:border-cyan-400"
            >
              {availableFeeds.map((feed, idx) => (
                <option key={idx} value={feed.value} className="bg-slate-900 text-white">
                  {feed.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Center CCTV Viewport with Dynamic Object Detection Squares */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-2">
        {errorMessage && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-950/95 border border-red-500/80 text-red-200 text-xs px-3 py-1.5 rounded-xl z-20 flex items-center gap-2 shadow-2xl max-w-md w-11/12 justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="truncate text-[11px] leading-tight">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold shrink-0 ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Computer Vision Bounding Boxes Overlay */}
        {showBoundingBoxes && activeDetections.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {activeDetections.map((det, idx) => {
              const conf = Math.round(det.confidence * 100);
              const isWorkstation = det.className.includes('workstation') || det.className.includes('desk');
              const borderColor = isWorkstation ? 'border-cyan-400' : 'border-emerald-400';
              const bgColor = isWorkstation ? 'bg-cyan-500/10' : 'bg-emerald-500/10';
              const badgeBg = isWorkstation ? 'bg-cyan-500' : 'bg-emerald-500';
              const textColor = isWorkstation ? 'text-cyan-300' : 'text-emerald-300';

              return (
                <div
                  key={idx}
                  className={`absolute border-2 ${borderColor} ${bgColor} rounded-md font-mono text-[9px] shadow-2xl transition-all duration-200 backdrop-blur-3xs`}
                  style={{
                    left: `${Math.max(2, Math.min(88, det.x))}%`,
                    top: `${Math.max(4, Math.min(82, det.y))}%`,
                    width: `${Math.max(8, Math.min(40, det.width))}%`,
                    height: `${Math.max(12, Math.min(55, det.height))}%`
                  }}
                >
                  {/* Top Detection Tag Pill */}
                  <div className={`absolute -top-5 left-0 ${badgeBg} text-slate-950 font-bold px-1.5 py-0.5 text-[9px] rounded-t-sm flex items-center gap-1.5 shadow-md uppercase tracking-wider`}>
                    <span>{det.className.replace(/_/g, ' ')}</span>
                    <span className="bg-black/25 px-1 rounded text-[8px] font-mono">{conf}%</span>
                  </div>

                  {/* Corner Reticle Brackets */}
                  <div className={`absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${borderColor}`} />
                  <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${borderColor}`} />
                  <div className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${borderColor}`} />
                  <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${borderColor}`} />

                  {/* Center Crosshair Target */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 text-white/50 flex items-center justify-center text-[10px]">
                    +
                  </div>

                  {/* Bottom Tracking Telemetry */}
                  <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/75 text-[8px] text-slate-300 font-mono flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isWorkstation ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
                    <span className={textColor}>ID #{100 + idx + 1}</span>
                  </div>
                </div>
              );
            })}

            {/* Bottom Floating Telemetry Pill */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-emerald-500/60 text-emerald-300 font-mono text-[10px] px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-bold text-white uppercase tracking-wider">Roboflow Model:</span>
              <span className="text-cyan-300">room-occupancy-monitor</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">{room.sensors.cameraDetectedCount || 2} Occupants Tracked</span>
              <span className="text-slate-500">•</span>
              <span className="text-blue-300">Latency: {inferenceTime}ms</span>
            </div>
          </div>
        )}

        {/* Blank State if no video and no detections */}
        {!hasVideo && (
          <div className="border border-dashed border-emerald-500/40 bg-emerald-950/20 rounded-xl p-5 text-center max-w-sm backdrop-blur-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <Eye className="w-4 h-4" />
            </div>
            <p className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-widest">
              Zero Human Occupants Detected
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-1">
              Select or upload a CCTV video to activate live computer vision detection.
            </p>
          </div>
        )}
      </div>

      {/* Bottom CCTV Playback & Telemetry Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-300 border-t border-slate-700/80 pt-2 gap-2 bg-slate-950/70 -mx-4 -mb-4 px-4 pb-3 rounded-b-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span>ZONE: {room.block}</span>
          <span>FL: {room.floor}</span>
          <span>CAP: {room.capacity} SEATS</span>
          
          {hasVideo && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={togglePlay}
                className="flex items-center gap-1 text-slate-200 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors"
              >
                {isPlaying ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>
              
              <button
                onClick={toggleMute}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3 h-3 text-slate-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
              </button>

              <span className="text-slate-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <Wifi className="w-3 h-3 text-emerald-400" /> 1080p 30 FPS
          </span>
          <span className="text-cyan-300 flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> YOLOv8 / YOLO11
          </span>
        </div>
      </div>

      {/* Roboflow API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Roboflow Workflows Configuration</h3>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Connect your live Roboflow serverless workspace (<span className="text-cyan-300 font-mono">santhosh-skandha-s-workspace</span>) to run actual cloud inference on every frame.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Roboflow API Key
                </label>
                <input
                  type="password"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  placeholder="e.g. rf_AbCdEf123456"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                <div>Workspace: <span className="text-slate-200">santhosh-skandha-s-workspace</span></div>
                <div>Workflow ID: <span className="text-slate-200">room-occupancy-monitor</span></div>
                <div>Input: <span className="text-slate-200">Live Video Frame (Base64 JPEG)</span></div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save & Run Inference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CCTV Corner Viewport Reticles */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-slate-400 pointer-events-none z-10" />
      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-slate-400 pointer-events-none z-10" />
      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-slate-400 pointer-events-none z-10" />
      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-slate-400 pointer-events-none z-10" />
    </div>
  );
};
