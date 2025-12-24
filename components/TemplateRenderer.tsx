
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
    } else if (template.id === 'zanzibar_pattern') {
      gradient.addColorStop(0, '#E0F7FA');
      gradient.addColorStop(1, '#B2EBF2');
    } else {
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#f1f2f6');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Decorative Patterns & Flowers
    if (template.borderStyle === 'pattern') {
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = template.primaryColor;
      for (let i = 0; i < width; i += 50) {
        for (let j = 0; j < height; j += 50) {
          ctx.strokeRect(i, j, 40, 40);
        }
      }
      ctx.globalAlpha = 1.0;
    }

    if (template.hasFlowers) {
      const drawDetailedFlower = (x: number, y: number, color: string, scale = 1) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.fillStyle = color;
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.rotate((Math.PI * 2) / 8);
          ctx.ellipse(25, 0, 30, 15, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      };
      
      // Top corner florals
      drawDetailedFlower(80, 80, template.accentColor, 0.8);
      drawDetailedFlower(width - 80, 80, template.accentColor, 0.8);
      
      // Bottom floral arrangement
      for (let i = 0; i < 5; i++) {
        drawDetailedFlower(150 + i * 125, height - 100, i % 2 === 0 ? template.accentColor : '#FAD7A0', 0.9);
      }
    }

    // 3. Ornate Border
    if (template.borderStyle === 'ornate') {
      ctx.strokeStyle = template.primaryColor;
      ctx.lineWidth = 15;
      ctx.strokeRect(30, 30, width - 60, height - 60);
      ctx.lineWidth = 2;
      ctx.strokeRect(55, 55, width - 110, height - 110);
      
      // Corner accents
      const sz = 80;
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(30, 30+sz); ctx.lineTo(30, 30); ctx.lineTo(30+sz, 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(width-30-sz, 30); ctx.lineTo(width-30, 30); ctx.lineTo(width-30, 30+sz); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30, height-30-sz); ctx.lineTo(30, height-30); ctx.lineTo(30+sz, height-30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(width-30-sz, height-30); ctx.lineTo(width-30, height-30); ctx.lineTo(width-30, height-30-sz); ctx.stroke();
    }

    // 4. Dynamic Text Content
    ctx.textAlign = 'center';
    
    // Dynamic Header (Host Info) - Multi-line support
    ctx.fillStyle = template.id === 'royal_purple' ? '#AAA' : '#555';
    ctx.font = `italic 18px ${template.fontFamily}`;
    const hostLines = (details.hostNames || "").split('\n');
    hostLines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, 100 + idx * 24);
    });

    // Event Type Title
    ctx.fillStyle = template.secondaryColor;
    ctx.font = `bold 42px ${template.fontFamily}`;
    ctx.fillText(details.eventTitle || "Mwaliko", width / 2, 220);

    // Celebrant Names
    ctx.fillStyle = template.primaryColor;
    ctx.font = `bold 65px ${template.fontFamily}`;
    ctx.fillText(details.names || "Selestino & Victoria", width / 2, 380);

    // Details Block
    ctx.fillStyle = template.id === 'royal_purple' ? '#FFF' : '#2C3E50';
    ctx.font = `bold 34px ${template.fontFamily}`;
    ctx.fillText(details.date || "Date", width / 2, 490);
    ctx.font = `24px ${template.fontFamily}`;
    ctx.fillText(details.time || "Time", width / 2, 530);

    // Venue
    ctx.fillStyle = template.accentColor;
    ctx.font = `bold 28px ${template.fontFamily}`;
    ctx.fillText(details.venue || "PTA HALL", width / 2, 620);

    // Dress Code
    if (details.dressCode) {
      ctx.fillStyle = template.id === 'royal_purple' ? '#DDD' : '#7F8C8D';
      ctx.font = `bold 20px ${template.fontFamily}`;
      ctx.fillText("DRESS CODE: " + details.dressCode.toUpperCase(), width / 2, 700);
    }

    // --- Ticket Badge (Visual Check-in) ---
    const badgeX = width - 150;
    const badgeY = 220;
    ctx.save();
    ctx.fillStyle = (guest.ticketType === 'VIP' || guest.ticketType === 'VVIP') ? '#D4AC0D' : '#2C3E50';
    ctx.beginPath();
    ctx.roundRect(badgeX - 65, badgeY - 22, 130, 44, 12);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = `bold 18px sans-serif`;
    ctx.fillText(guest.ticketType.toUpperCase(), badgeX, badgeY + 7);
    ctx.restore();

    // Personal Guest Name
    if (guest.guestName) {
      ctx.fillStyle = template.id === 'royal_purple' ? '#EEE' : '#333';
      ctx.font = `italic bold 22px ${template.fontFamily}`;
      ctx.fillText(`Mgeni: ${guest.guestName}`, width / 2, 780);
    }

    // Unique Identification Footer
    ctx.fillStyle = '#95A5A6';
    ctx.font = `bold 14px monospace`;
    ctx.fillText(`UNIQUE ID: ${guest.uniqueId}`, width / 2, height - 60);
    ctx.font = `italic 14px ${template.fontFamily}`;
    ctx.fillText("Skani kadi hii kwa ajili ya kuingilia ukumbini", width / 2, height - 180);

  }, [template, details, guest, width, height]);

  return <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg shadow-2xl border border-slate-700 bg-white" />;
};

export default TemplateRenderer;
