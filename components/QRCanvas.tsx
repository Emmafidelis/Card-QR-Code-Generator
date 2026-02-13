
import React, { useRef, useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QRConfig } from '../types';

interface QRCanvasProps {
  image: string;
  config: QRConfig;
  onPositionChange: (x: number, y: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const QRCanvas: React.FC<QRCanvasProps> = ({ image, config, onPositionChange, canvasRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgSize({ width: img.width, height: img.height });
      // Update main canvas for export
      drawFinalCanvas(img);
    };
    img.src = image;
  }, [image, config]);

  const drawFinalCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Draw QR Code on top for the hidden export canvas
    const qrCanvas = document.getElementById('qr-source') as HTMLCanvasElement;
    if (qrCanvas) {
      // Calculate real position based on displayed vs original size
      const displayedWidth = containerRef.current?.clientWidth || 1;
      const ratio = img.width / displayedWidth;
      
      ctx.drawImage(
        qrCanvas, 
        config.posX * ratio, 
        config.posY * ratio, 
        config.size * ratio, 
        config.size * ratio
      );
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    let newX = e.clientX - containerRect.left - offset.x;
    let newY = e.clientY - containerRect.top - offset.y;

    // Constrain within bounds
    newX = Math.max(0, Math.min(newX, containerRect.width - config.size));
    newY = Math.max(0, Math.min(newY, containerRect.height - config.size));

    onPositionChange(newX, newY);
  };

  const handleMouseUp = () => setIsDragging(false);

  const getBoundedPosition = (nextX: number, nextY: number) => {
    if (!containerRef.current) return { x: nextX, y: nextY };
    const { width, height } = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(nextX, width - config.size)),
      y: Math.max(0, Math.min(nextY, height - config.size))
    };
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const baseStep = e.shiftKey ? 10 : 2;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

    e.preventDefault();
    const deltaX = e.key === 'ArrowRight' ? baseStep : e.key === 'ArrowLeft' ? -baseStep : 0;
    const deltaY = e.key === 'ArrowDown' ? baseStep : e.key === 'ArrowUp' ? -baseStep : 0;
    const bounded = getBoundedPosition(config.posX + deltaX, config.posY + deltaY);
    onPositionChange(bounded.x, bounded.y);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      <div 
        ref={containerRef}
        className="relative overflow-hidden cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
          src={image} 
          alt="Event Card Template" 
          className="w-full h-auto block" 
          draggable={false}
        />
        
        {/* The QR Overlay */}
        <div
          className="absolute cursor-move border-2 border-transparent hover:border-blue-500 transition-colors"
          style={{
            left: config.posX,
            top: config.posY,
            width: config.size,
            height: config.size,
            zIndex: 10
          }}
          onMouseDown={handleMouseDown}
          onKeyDown={handleOverlayKeyDown}
          tabIndex={0}
          role="button"
          aria-label="QR code positioner. Drag with mouse or use arrow keys to move."
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown Shift+ArrowLeft Shift+ArrowRight"
        >
          <QRCodeCanvas
            id="qr-preview"
            value={config.content || " "}
            size={config.size}
            level="H"
            fgColor={config.color}
            bgColor={config.bgColor}
            includeMargin={config.includeMargin}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Hidden QR for rendering to high-res canvas */}
        <div className="hidden">
           <QRCodeCanvas
            id="qr-source"
            value={config.content || " "}
            size={512} // High res source
            level="H"
            fgColor={config.color}
            bgColor={config.bgColor}
            includeMargin={config.includeMargin}
          />
        </div>
      </div>
      
      <div className="p-3 bg-slate-900/50 text-xs text-slate-400 text-center">
        Drag the QR code to position it on your card
      </div>
    </div>
  );
};

export default QRCanvas;
