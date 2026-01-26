import React, { useRef, useEffect } from 'react';
import * as Tone from 'tone';

interface AudioVisualizerProps {
  isAudioEnabled: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isAudioEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isAudioEnabled) return;

    analyserRef.current = new Tone.Analyser('fft', 256);
    Tone.Destination.connect(analyserRef.current);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const values = analyserRef.current!.getValue() as Float32Array;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw background glow
      ctx.fillStyle = 'rgba(18, 18, 18, 0.2)';
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / values.length) * 2.5;
      let x = 0;

      for (let i = 0; i < values.length; i++) {
        // Convert dB to a normalized value for display
        const val = (values[i] + 140) * 2; // Rough normalization
        const barHeight = Math.max(2, (val / 255) * height);

        // Gradient color from orange to transparent
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, '#b06a3b');
        gradient.addColorStop(1, 'rgba(176, 106, 59, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (analyserRef.current) {
        Tone.Destination.disconnect(analyserRef.current);
        analyserRef.current.dispose();
      }
    };
  }, [isAudioEnabled]);

  return (
    <div className="w-full h-24 bg-[#121212] rounded-lg border border-stone-800 overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        width={800}
        height={100}
        className="w-full h-full opacity-60"
      />
    </div>
  );
};

export default AudioVisualizer;
