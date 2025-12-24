
import React, { useEffect } from 'react';
import { EventDetails, CardTemplate, GuestDetails } from '../types';

interface TemplateRendererProps {
  template: CardTemplate;
  details: EventDetails;
  guest: GuestDetails;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  width?: number;
  height?: number;
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ template, details, guest, canvasRef, width = 800, height = 1100 }) => {
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
    } else {
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#f1f2f6');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Decorative elements
    if (template.hasFlowers) {
      const drawFlower = (x: number, y: number, color: string, scale = 1) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.fillStyle = color;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.rotate((Math.PI * 2) / 6);
          ctx.ellipse(20, 0, 25, 12, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      };
      drawFlower(100, 100, template.accentColor, 0.7);
      drawFlower(width - 100, 100, template.accentColor, 0.7);
    }

    // 3. Border
    if (template.borderStyle === 'ornate') {
      ctx.strokeStyle = template.primaryColor;
      ctx.lineWidth = 12;
      ctx.strokeRect(30, 30, width - 60, height - 60);
    }

    // 4. Content
    ctx.textAlign = 'center';
    
    // Header
    ctx.fillStyle = '#555';
    if (template.id === 'royal_purple') ctx.fillStyle = '#D1D1D1';
    ctx.font = `italic 16px ${template.fontFamily}`;
    ctx.fillText(details.hostNames.split('\n')[0] || "Invitation", width / 2, 80);

    // Event Title
    ctx.fillStyle = template.secondaryColor;
    ctx.font = `bold 38px ${template.fontFamily}`;
    ctx.fillText(details.eventTitle || "Kadi ya Harusi", width / 2, 160);

    // Main Names
    ctx.fillStyle = template.primaryColor;
    ctx.font = `bold 60px ${template.fontFamily}`;
    ctx.fillText(details.names || "Selestino & Victoria", width / 2, 320);

    // Details
    ctx.fillStyle = '#2C3E50';
    if (template.id === 'royal_purple') ctx.fillStyle = '#FFF';
    ctx.font = `bold 30px ${template.fontFamily}`;
    ctx.fillText(details.date || "Date", width / 2, 420);
    ctx.font = `22px ${template.fontFamily}`;
    ctx.fillText(details.time || "Time", width / 2, 455);

    // Venue
    ctx.fillStyle = template.accentColor;
    ctx.font = `bold 26px ${template.fontFamily}`;
    ctx.fillText(details.venue || "Venue", width / 2, 530);

    // Dress Code
    if (details.dressCode) {
      ctx.fillStyle = '#7F8C8D';
      ctx.font = `bold 18px ${template.fontFamily}`;
      ctx.fillText("DRESS CODE: " + details.dressCode.toUpperCase(), width / 2, 600);
    }

    // --- TICKET TYPE BADGE ---
    // Draw a label for the ticket type (Single/Double/VIP)
    const badgeX = width - 150;
    const badgeY = 220;
    
    ctx.save();
    ctx.fillStyle = guest.ticketType === 'VIP' || guest.ticketType === 'VVIP' ? '#D4AC0D' : '#34495E';
    ctx.beginPath();
    ctx.roundRect(badgeX - 60, badgeY - 20, 120, 40, 10);
    ctx.fill();
    
    ctx.fillStyle = '#FFF';
    ctx.font = `bold 18px sans-serif`;
    ctx.fillText(guest.ticketType.toUpperCase(), badgeX, badgeY + 7);
    ctx.restore();

    // Guest Name (Personalization)
    if (guest.guestName) {
      ctx.fillStyle = '#333';
      ctx.font = `italic 20px ${template.fontFamily}`;
      ctx.fillText(`Mgeni: ${guest.guestName}`, width / 2, 670);
    }

    // Unique ID footer
    ctx.fillStyle = '#BDC3C7';
    ctx.font = `bold 14px monospace`;
    ctx.fillText(`ID: ${guest.uniqueId}`, width / 2, height - 60);

    // Scan instructions
    ctx.fillStyle = '#95A5A6';
    ctx.font = `italic 14px ${template.fontFamily}`;
    ctx.fillText("Skani kadi hii kwa ajili ya kuingilia ukumbini (Check-in)", width / 2, height - 180);

  }, [template, details, guest, width, height]);

  return <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg shadow-2xl border border-slate-700 bg-white" />;
};

export default TemplateRenderer;
