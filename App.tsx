
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, Download, QrCode, Sparkles, RefreshCcw, Trash2, Link, MapPin, Phone, Info, Layout, Type as TypeIcon, Calendar, Clock, Shirt, UserCheck, CreditCard, Fingerprint, ShieldCheck } from 'lucide-react';
import QRCanvas from './components/QRCanvas';
import TemplateRenderer from './components/TemplateRenderer';
import { EventDetails, QRConfig, CardTemplate, GuestDetails, TicketType } from './types';
import { analyzeCardImage } from './services/geminiService';

const TEMPLATES: CardTemplate[] = [
  { id: 'wedding_floral', name: 'Swahili Floral', primaryColor: '#E67E22', secondaryColor: '#D35400', accentColor: '#F39C12', fontFamily: 'serif', bgGradient: 'from-orange-50 to-orange-100', hasFlowers: true, borderStyle: 'ornate' },
  { id: 'classic_gold', name: 'Royal Gold', primaryColor: '#B7950B', secondaryColor: '#9A7D0A', accentColor: '#D4AC0D', fontFamily: 'serif', bgGradient: 'from-amber-50 to-yellow-100', hasFlowers: false, borderStyle: 'ornate' },
  { id: 'royal_purple', name: 'Velvet Purple', primaryColor: '#F1C40F', secondaryColor: '#F39C12', accentColor: '#E67E22', fontFamily: 'serif', bgGradient: 'from-purple-900 to-indigo-950', hasFlowers: false, borderStyle: 'pattern' },
];

const generateId = () => `TZ-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;

const DEFAULT_GUEST: GuestDetails = {
  guestName: "",
  ticketType: "Single",
  uniqueId: generateId(),
  guestContact: ""
};

const DEFAULT_CONFIG: QRConfig = {
  content: "",
  size: 110,
  posX: 520,
  posY: 270,
  color: "#000000",
  bgColor: "#ffffff",
  includeMargin: true,
  autoFormat: true
};

const DEFAULT_DETAILS: EventDetails = {
  eventTitle: "Kadi ya Harusi",
  hostNames: "Familia ya Bw. na Bi. Deodatus Mussa Nachenga\ninayo furaha kukualika",
  names: "Selestino & Victoria",
  date: "22 NOVEMBA 2025",
  time: "Saa 10:00 Jioni",
  venue: "PTA HALL, Sabasaba Ground",
  locationUrl: "https://maps.app.goo.gl/79UGeaJyx5YZQYTB9",
  contact: "0659228205",
  dressCode: "Burnt Orange",
  additionalInfo: "KARIBU SANA!"
};

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null);
  const [config, setConfig] = useState<QRConfig>(DEFAULT_CONFIG);
  const [details, setDetails] = useState<EventDetails>(DEFAULT_DETAILS);
  const [guest, setGuest] = useState<GuestDetails>(DEFAULT_GUEST);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'details' | 'ticket' | 'qr'>('templates');
  
  const templateCanvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateImage, setTemplateImage] = useState<string | null>(null);

  // Computed QR Content based on structured data
  const finalQRContent = useMemo(() => {
    if (!config.autoFormat) return config.content;
    
    // Construct check-in payload string
    const payload = [
      `ID:${guest.uniqueId}`,
      `T:${guest.ticketType}`,
      `N:${guest.guestName || 'GUEST'}`,
      `E:${details.names}`,
      `V:${details.venue}`,
      `L:${details.locationUrl}`
    ].join(' | ');
    
    return payload;
  }, [config.autoFormat, config.content, guest, details]);

  useEffect(() => {
    if (selectedTemplate && templateCanvasRef.current) {
      const timeout = setTimeout(() => {
        setTemplateImage(templateCanvasRef.current!.toDataURL());
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [selectedTemplate, details, guest]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
        setSelectedTemplate(null);
        setActiveTab('qr');
        setIsAnalyzing(true);
        const extracted = await analyzeCardImage(base64);
        if (extracted) {
          setDetails(prev => ({ ...prev, ...extracted }));
          if (extracted.locationUrl) setConfig(prev => ({ ...prev, content: extracted.locationUrl, autoFormat: false }));
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const canvas = exportCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${guest.ticketType}-${guest.uniqueId}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const resetAll = () => {
    if (confirm("Reset application?")) {
      setImage(null);
      setSelectedTemplate(null);
      setConfig(DEFAULT_CONFIG);
      setDetails(DEFAULT_DETAILS);
      setGuest({ ...DEFAULT_GUEST, uniqueId: generateId() });
      setActiveTab('templates');
      setTemplateImage(null);
    }
  };

  const isEditorActive = image || selectedTemplate;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-orange-500/30">
      <header className="border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center shadow-xl shadow-orange-500/10">
              <QrCode className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Ecard TZ Pro</h1>
              <p className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold">Tanzania Check-in System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditorActive && (
              <button onClick={handleDownload} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg active:scale-95 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Save Ticket</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-10 grid lg:grid-cols-12 gap-10">
        
        {/* Left Side: Preview */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!isEditorActive ? (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-8 py-10">
              <div className="max-w-md space-y-4">
                <h2 className="text-4xl font-black text-white leading-tight">Professional Event Invitations</h2>
                <p className="text-slate-400">Generate secure, scan-ready Ecards for Tanzanian weddings, send-offs, and corporate events with built-in attendee tracking.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                <button onClick={() => fileInputRef.current?.click()} className="group p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col items-center gap-4">
                  <Upload className="w-10 h-10 text-orange-500" />
                  <span className="font-bold text-white uppercase tracking-widest text-sm">Upload Paper Card</span>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => {setSelectedTemplate(t); setImage(null); setActiveTab('details');}}
                      className={`rounded-2xl border border-slate-800 bg-slate-900 p-2 flex flex-col items-center justify-center gap-1 hover:border-orange-500/50 transition-all`}>
                      <div className={`w-full h-12 rounded-lg bg-gradient-to-tr ${t.bgGradient}`} />
                      <span className="text-[9px] font-bold text-slate-500 uppercase">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="flex justify-center bg-slate-900/30 backdrop-blur-md p-6 rounded-[48px] border border-white/5 shadow-2xl relative group">
                {selectedTemplate && (
                  <div className="hidden">
                     <TemplateRenderer template={selectedTemplate} details={details} guest={guest} canvasRef={templateCanvasRef} />
                  </div>
                )}
                
                {(image || templateImage) && (
                  <QRCanvas 
                    image={image || templateImage!} 
                    config={{...config, content: finalQRContent}} 
                    canvasRef={exportCanvasRef}
                    onPositionChange={(x, y) => setConfig(prev => ({ ...prev, posX: x, posY: y }))}
                  />
                )}
                <canvas ref={exportCanvasRef} className="hidden" />
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Editor Panel */}
        <div className="lg:col-span-5">
          {isEditorActive && (
            <div className="bg-slate-900/90 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl sticky top-24 backdrop-blur-xl">
              <div className="flex bg-white/5 p-1.5 m-3 rounded-2xl">
                {['templates', 'details', 'ticket', 'qr'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl scale-100' : 'text-slate-500 hover:text-white scale-95'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                {activeTab === 'templates' ? (
                  <div className="grid grid-cols-1 gap-3">
                    {TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => {setSelectedTemplate(t); setImage(null);}}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedTemplate?.id === t.id ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.bgGradient}`} />
                          <span className="text-sm font-bold uppercase">{t.name}</span>
                        </div>
                        {t.hasFlowers && <Sparkles className="w-4 h-4 text-yellow-500" />}
                      </button>
                    ))}
                  </div>
                ) : activeTab === 'details' ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Celebrants</label>
                      <input type="text" value={details.names} onChange={e => setDetails({...details, names: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white focus:border-orange-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</label>
                        <input type="text" value={details.date} onChange={e => setDetails({...details, date: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</label>
                        <input type="text" value={details.time} onChange={e => setDetails({...details, time: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Venue</label>
                      <input type="text" value={details.venue} onChange={e => setDetails({...details, venue: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm outline-none" />
                    </div>
                  </div>
                ) : activeTab === 'ticket' ? (
                  <div className="space-y-6">
                    <div className="bg-orange-500/5 p-4 rounded-3xl border border-orange-500/10 space-y-4">
                       <h4 className="text-xs font-black text-orange-400 uppercase flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Secure Check-in Data
                       </h4>
                       <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Guest Name (Optional)</label>
                            <input type="text" value={guest.guestName} onChange={e => setGuest({...guest, guestName: e.target.value})} 
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none" placeholder="Enter attendee name..." />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Ticket Category</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['Single', 'Double', 'VIP', 'VVIP'].map(t => (
                                <button key={t} onClick={() => setGuest({...guest, ticketType: t as TicketType})}
                                  className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${guest.ticketType === t ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                             <div className="space-y-1">
                               <p className="text-[9px] font-bold text-slate-500 uppercase">Unique Invitation ID</p>
                               <p className="text-xs font-mono text-orange-500">{guest.uniqueId}</p>
                             </div>
                             <button onClick={() => setGuest({...guest, uniqueId: generateId()})} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                               <RefreshCcw className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Structured Format</label>
                      <button onClick={() => setConfig({...config, autoFormat: !config.autoFormat})}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${config.autoFormat ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                        {config.autoFormat ? 'ON (Secure Ticket)' : 'OFF (Plain Link)'}
                      </button>
                    </div>

                    {!config.autoFormat && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Custom URL / Content</label>
                        <textarea value={config.content} onChange={e => setConfig({...config, content: e.target.value})} 
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm outline-none resize-none" rows={3} />
                      </div>
                    )}

                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-4">
                       <p className="text-[10px] font-bold text-slate-500 uppercase">Encoded QR Preview</p>
                       <div className="p-3 bg-black/40 rounded-xl text-[10px] font-mono text-orange-400 break-all leading-relaxed">
                          {finalQRContent}
                       </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-black/20 border-t border-white/5">
                <button onClick={resetAll} className="w-full py-4 text-[10px] font-black text-slate-500 hover:text-red-400 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> Clear All Data
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-10 text-center border-t border-white/5 bg-slate-900/20">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Designed for high-end Tanzanian Events • VIP Access Guaranteed</p>
      </footer>
    </div>
  );
};

export default App;
