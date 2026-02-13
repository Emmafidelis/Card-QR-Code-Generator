
import React, { useEffect, useRef } from 'react';
import { EventDetails, CardTemplate, GuestDetails } from '../types';

interface TemplateRendererProps {
  template: CardTemplate;
  details: EventDetails;
  guest: GuestDetails;
  canvasRef?: React.RefObject<HTMLCanvasElement>; // Made optional to prevent crashes
  width?: number;
  height?: number;
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ template, details, guest, canvasRef, width = 800, height = 1100 }) => {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const effectiveRef = canvasRef || internalRef;

  useEffect(() => {
    const canvas = effectiveRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // 1. Background
    ctx.fillStyle = "#FFFFFF";
    if (template.id === 'royal_purple') ctx.fillStyle = '#2E1A47';
    if (template.id === 'zanzibar_pattern') ctx.fillStyle = '#E0F7FA';
    ctx.fillRect(0, 0, width, height);

    // 2. Decorative Patterns & Borders
    if (template.id === 'lyakurwa_red_navy') {
      ctx.strokeStyle = template.accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(80, 50); ctx.lineTo(width - 80, 50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(100, 60); ctx.lineTo(width - 100, 60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(80, height - 50); ctx.lineTo(width - 80, height - 50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(100, height - 60); ctx.lineTo(width - 100, height - 60); ctx.stroke();
    }

    // 3. Flowers (Sophisticated rendering)
    if (template.hasFlowers) {
      const drawRose = (x: number, y: number, color: string, scale = 1, rotation = 0) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        
        // Petal layers for a richer look
        for (let j = 0; j < 3; j++) {
            ctx.fillStyle = j === 0 ? color : j === 1 ? color + 'DD' : color + 'BB';
            const petals = 6 + j * 2;
            const size = 20 - j * 4;
            for (let i = 0; i < petals; i++) {
              ctx.beginPath();
              ctx.rotate((Math.PI * 2) / petals);
              ctx.ellipse(size * 0.8, 0, size, size * 0.7, 0, 0, Math.PI * 2);
              ctx.fill();
            }
        }
        
        ctx.fillStyle = '#FFD700'; // Center
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      };

      const drawLeaf = (x: number, y: number, rotation: number, scale = 1) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        ctx.fillStyle = '#3E5622';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Vein
        ctx.strokeStyle = '#2D3E19';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(15, 0); ctx.stroke();
        ctx.restore();
      };

      if (template.id === 'lyakurwa_red_navy') {
        // TOP RIGHT CLUSTER
        const trX = width - 120;
        const trY = 120;
        drawLeaf(trX - 60, trY - 40, -0.6, 1.8);
        drawLeaf(trX + 30, trY + 60, 0.4, 1.3);
        drawRose(trX, trY, '#A11515', 2.0, 0); 
        drawRose(trX - 50, trY + 50, '#FDF5E6', 1.4, 0.4); 
        drawRose(trX + 40, trY - 30, '#8B0000', 1.1, -0.2);

        // BOTTOM LEFT CLUSTER
        const blX = 120;
        const blY = height - 120;
        drawLeaf(blX + 60, blY + 40, 0.3, 1.6);
        drawRose(blX, blY, '#A11515', 1.8, 0);
        drawRose(blX + 50, blY - 40, '#FFDAB9', 1.2, -0.5);
      } else {
        drawRose(100, 100, template.accentColor, 1.2);
        drawRose(width - 100, 100, template.accentColor, 1.2);
      }
    }

    // 4. Text Content
    ctx.textAlign = 'center';
    const drawWrappedCenteredText = (
      text: string,
      startY: number,
      maxWidth: number,
      lineHeight: number,
      maxLines = 6
    ) => {
      const words = (text || '').trim().split(/\s+/).filter(Boolean);
      if (!words.length) return startY;

      const lines: string[] = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = `${currentLine} ${words[i]}`;
        if (ctx.measureText(testLine).width > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      const safeLines = lines.slice(0, maxLines);
      safeLines.forEach((line, idx) => ctx.fillText(line, width / 2, startY + idx * lineHeight));
      return startY + (safeLines.length - 1) * lineHeight;
    };
    
    // Main Title
    ctx.fillStyle = template.secondaryColor;
    ctx.font = `bold 62px ${template.fontFamily}`;
    const titleText = details.eventTitle || "Mwaliko wa harusi";
    const titleY = 210;
    ctx.fillText(titleText, width / 2, titleY);

    // TICKET BADGE POSITION REFINEMENT
    // Placed as a neat floating pill above the main title to ensure no text overlap
    ctx.save();
    const badgeX = width / 2;
    const badgeY = titleY - 85;
    ctx.fillStyle = (guest.ticketType === 'VIP' || guest.ticketType === 'VVIP') ? '#D4AC0D' : '#1A237E';
    ctx.beginPath();
    ctx.roundRect(badgeX - 50, badgeY - 18, 100, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = `bold 14px sans-serif`;
    ctx.fillText(guest.ticketType.toUpperCase(), badgeX, badgeY + 5);
    ctx.restore();

    // Hosts
    ctx.fillStyle = '#212121';
    ctx.font = `bold 22px ${template.fontFamily}`;
    const hostLines = (details.hostNames || "").split('\n');
    hostLines.forEach((l, i) => ctx.fillText(l, width / 2, 290 + i * 28));

    // Celebrants
    ctx.fillStyle = template.primaryColor;
    ctx.font = `bold 68px ${template.fontFamily}`;
    const nameLines = (details.names || "").split('\n');
    nameLines.forEach((l, i) => ctx.fillText(l, width / 2, 460 + i * 65));

    // Ceremony paragraph
    ctx.fillStyle = '#212121';
    ctx.font = `bold 22px ${template.fontFamily}`;
    const ceremonyBottomY = drawWrappedCenteredText(details.ceremonyText, 700, width - 180, 34, 7);
    const guestLabelY = Math.max(830, ceremonyBottomY + 70);
    const contactTitleY = Math.max(890, guestLabelY + (guest.guestName ? 60 : 20));

    // Contact
    if (details.contact) {
      ctx.fillStyle = template.primaryColor;
      ctx.font = `bold 28px ${template.fontFamily}`;
      ctx.fillText("Mawasiliano", width / 2, contactTitleY);
      ctx.font = `bold 24px sans-serif`;
      ctx.fillText(details.contact, width / 2, contactTitleY + 40);
    }

    // Guest name
    if (guest.guestName) {
      ctx.fillStyle = '#333';
      ctx.font = `italic bold 22px ${template.fontFamily}`;
      ctx.fillText(`Mgeni: ${guest.guestName}`, width / 2, guestLabelY);
    }

    // Footer
    ctx.fillStyle = '#95A5A6';
    ctx.font = `italic 16px ${template.fontFamily}`;
    ctx.fillText(details.instruction || "Skani kadi hii kwa ajili ya kuingilia ukumbini", width / 2, height - 150);
    ctx.font = `bold 14px monospace`;
    ctx.fillText(`ID: ${guest.uniqueId}`, width / 2, height - 40);

  }, [template, details, guest, width, height]);

  return <canvas ref={effectiveRef} className="max-w-full h-auto rounded-lg shadow-2xl bg-white" />;
};

export default TemplateRenderer;
