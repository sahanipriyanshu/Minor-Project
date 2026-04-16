import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Activity, AlertTriangle, CheckCircle, Volume2 } from 'lucide-react';

const FitnessCoach = ({ exerciseType, uid }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState({ state: "UP", reps: 0, angle: 180, feedback: "" });
  const [lastSpeechTime, setLastSpeechTime] = useState(0);

  // Initialize Speech Synthesis
  const speakFeedback = useCallback((text) => {
    const now = Date.now();
    // Throttle speech to avoid overlapping (every 2.5 seconds minimum)
    if (now - lastSpeechTime > 2500 && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      setLastSpeechTime(now);
    }
  }, [lastSpeechTime]);

  useEffect(() => {
    // Basic cleanup logic if connecting again
    if (wsRef.current) wsRef.current.close();
    
    // Setup WebSocket with exercise type and uid query param
    wsRef.current = new WebSocket(`ws://localhost:8000/ws/cv?exercise=${exerciseType}&uid=${uid}`);
    
    wsRef.current.onopen = () => {
      console.log('Connected to CV Engine for ' + exerciseType);
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === 'success' && data.metrics) {
        setMetrics(data.metrics);
        if (data.metrics.feedback) {
          speakFeedback(data.metrics.feedback);
        }
        
        // Draw Skeleton overlay
        drawOverlay(data.landmarks);
      }
    };

    wsRef.current.onclose = () => setIsConnected(false);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [speakFeedback, exerciseType]);

  // Capture frame and send over WS
  const captureFrame = useCallback(() => {
    if (
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN &&
      webcamRef.current
    ) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        wsRef.current.send(imageSrc);
      }
    }
  }, []);

  // Frame processing loop
  useEffect(() => {
    const interval = setInterval(() => {
      captureFrame();
    }, 100); // 10 FPS to balance load; adjust if real-time needs MORE

    return () => clearInterval(interval);
  }, [captureFrame]);

  // Canvas Drawing
  const drawOverlay = (landmarks) => {
    if (!canvasRef.current || !webcamRef.current?.video) return;
    
    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw landmarks
    landmarks.forEach((lm) => {
      // Threshold for visibility
      if (lm.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#00ff88';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'white';
        ctx.stroke();
      }
    });

    // We can add lines between landmarks based on POSE_CONNECTIONS later
    // if required, but dots serve as a good primitive indicator.
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto h-screen bg-slate-900 text-white">
      {/* Metrics Dashboard */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              AI Coach
            </h2>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {isConnected ? 'LIVE' : 'DISCONNECTED'}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-slate-700/50 rounded-xl">
              <p className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
                <Activity size={16} /> Total Reps (Session)
              </p>
              <p className="text-5xl font-black text-white">{metrics.reps}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <p className="text-slate-400 text-sm font-medium mb-1">State</p>
                <p className={`text-xl font-bold ${metrics.state === 'UP' ? 'text-cyan-400' : 'text-amber-400'}`}>
                  {metrics.state}
                </p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <p className="text-slate-400 text-sm font-medium mb-1">Joint Angle</p>
                <p className="text-xl font-bold text-white">{metrics.angle}°</p>
              </div>
            </div>

            {/* Live Feedback Window */}
            <div className={`p-4 rounded-xl border ${metrics.feedback.includes("Good") || !metrics.feedback ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
              <p className="text-sm font-medium flex items-center gap-2 mb-2 text-slate-300">
                <Volume2 size={16} /> Coach Feedback
              </p>
              <p className="text-lg font-medium text-white min-h-[2rem]">
                {metrics.feedback || "Awaiting movement..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Feed */}
      <div className="w-full lg:w-2/3 relative rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-2xl flex items-center justify-center">
        {!isConnected && (
            <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                <AlertTriangle className="text-amber-400 w-12 h-12 mb-4 animate-bounce" />
                <h3 className="text-xl font-bold text-white mb-2">Connecting to Engine...</h3>
                <p className="text-slate-400">Ensure the FastAPI backend is running on port 8000.</p>
            </div>
        )}
        
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user" }}
          className="w-full h-full object-cover transform -scale-x-100"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none transform -scale-x-100"
        />
        
        {/* Helper overlay lines */}
        <div className="absolute inset-0 border-4 border-slate-400/20 rounded-2xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default FitnessCoach;
