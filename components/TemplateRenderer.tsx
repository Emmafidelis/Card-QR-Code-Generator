
import React, { useEffect } from 'react';
import { EventDetails, CardTemplate } from '../types';

interface TemplateRendererProps {
  template: CardTemplate;
  details: EventDetails;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  width?: number;
  height?: number;
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ template, details, canvasRef, width = 800, height = 1100 }) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // 1. Background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (template.id === 'wedding_floral') {
      gradient.addColorStop(0, '#FFFBF0');
      gradient.addColorStop(1, '#F5E6D3');
    } else if (template.id === 'classic_gold') {
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(1, '#FFF5E1');
    } else if (template.id === 'royal_purple') {
      gradient.addColorStop(0, '#2E1A47');
      gradient.addColorStop(1, '#1A0F2B');
    } else if (template.id === 'zanzibar_pattern') {
      gradient.addColorStop(0, '#FDF5E6');
      gradient.addColorStop(1, '#FAEBD7');
    } else {
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#f1f2f6');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Patterns & Textures
    if (template.borderStyle === 'pattern') {
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = template.primaryColor;
      for (let i = 0; i < width; i += 40) {
        for (let j = 0; j < height; j += 40) {
          ctx.strokeRect(i, j, 30, 30);
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // 3. Floral Decorations (Improved)
    if (template.hasFlowers) {
      const drawDetailedFlower = (x: number, y: number, color: string, scale = 1) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.fillStyle = color;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.rotate((Math.PI * 2) / 6);
          ctx.ellipse(25, 0, 30, 15, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      // Corner flowers
      drawDetailedFlower(80, 80, template.accentColor, 0.8);
      drawDetailedFlower(width - 80, 80, template.accentColor, 0.8);
      
      // Bottom floral arrangement (Like the user image)
      for (let i = 0; i < 7; i++) {
        const x = 80 + i * (width - 160) / 6;
        const y = height - 100;
        const color = i % 2 === 0 ? template.accentColor : '#FAD7A0';
        drawDetailedFlower(x, y + (i % 2 === 0 ? -20 : 20), color, 0.9);
      }
    }

    // 4. Ornate Border
    if (template.borderStyle === 'ornate') {
      ctx.strokeStyle = template.primaryColor;
      ctx.lineWidth = 15;
      ctx.strokeRect(30, 30, width - 60, height - 60);
      ctx.lineWidth = 2;
      ctx.strokeRect(55, 55, width - 110, height - 110);
      
      // Corner accents
      const sz = 100;
      ctx.lineWidth = 8;
      // Top-Left
      ctx.beginPath(); ctx.moveTo(30, 30 + sz); ctx.lineTo(30, 30); ctx.lineTo(30 + sz, 30); ctx.stroke();
      // Top-Right
      ctx.beginPath(); ctx.moveTo(width - 30 - sz, 30); ctx.lineTo(width - 30, 30); ctx.lineTo(width - 30, 30 + sz); ctx.stroke();
      // Bottom-Left
      ctx.beginPath(); ctx.moveTo(30, height - 30 - sz); ctx.lineTo(30, height - 30); ctx.lineTo(30 + sz, height - 30); ctx.stroke();
      // Bottom-Right
      ctx.beginPath(); ctx.moveTo(width - 30 - sz, height - 30); ctx.lineTo(width - 30, height - 30); ctx.lineTo(width - 30, height - 30 - sz); ctx.stroke();
    }

    // 5. Text Content (Cultural Layout)
    ctx.textAlign = 'center';
    
    // Host Info (Smaller, top)
    if (details.hostNames) {
      ctx.fillStyle = '#555';
      if (template.id === 'royal_purple') ctx.fillStyle = '#D1D1D1';
      ctx.font = `italic 18px ${template.fontFamily}`;
      const lines = details.hostNames.split('\n');
      lines.forEach((line, idx) => {
        ctx.fillText(line, width / 2, 100 + idx * 22);
      });
    }

    // Title / Card Type
    ctx.fillStyle = template.secondaryColor;
    ctx.font = `bold 42px ${template.fontFamily}`;
    ctx.fillText(details.eventTitle || "Kadi ya Mwaliko", width / 2, 220);

    // Celebrant Names (Huge & Elegant)
    ctx.fillStyle = template.primaryColor;
    ctx.font = `bold 68px ${template.fontFamily}`;
    ctx.fillText(details.names || "Names Here", width / 2, 400);

    // Event Info (Date & Time)
    ctx.fillStyle = '#2C3E50';
    if (template.id === 'royal_purple') ctx.fillStyle = '#FFF';
    ctx.font = `bold 34px ${template.fontFamily}`;
    ctx.fillText(details.date || "Date", width / 2, 520);
    ctx.font = `26px ${template.fontFamily}`;
    ctx.fillText(details.time || "Time", width / 2, 560);

    // Venue
    ctx.fillStyle = template.accentColor;
    ctx.font = `bold 30px ${template.fontFamily}`;
    ctx.fillText(details.venue || "Venue", width / 2, 660);

    // Dress Code (Highlighted like reference)
    if (details.dressCode) {
      ctx.fillStyle = '#7F8C8D';
      if (template.id === 'royal_purple') ctx.fillStyle = '#AAA';
      ctx.font = `bold 20px ${template.fontFamily}`;
      ctx.fillText("DRESS CODE:", width / 2, 730);
      ctx.fillStyle = template.primaryColor;
      ctx.font = `bold 24px ${template.fontFamily}`;
      ctx.fillText(details.dressCode.toUpperCase(), width / 2, 765);
    }

    // Contact
    if (details.contact) {
      ctx.fillStyle = '#34495E';
      if (template.id === 'royal_purple') ctx.fillStyle = '#DDD';
      ctx.font = `18px ${template.fontFamily}`;
      ctx.fillText(`Mawasiliano: ${details.contact}`, width / 2, 850);
    }

    // Scan Text
    ctx.fillStyle = '#95A5A6';
    ctx.font = `italic 16px ${template.fontFamily}`;
    ctx.fillText("Skani QR kupata ramani na maelekezo", width / 2, height - 180);

  }, [template, details, width, height]);

  return <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg shadow-2xl border border-slate-700 bg-white" />;
};

export default TemplateRenderer;
