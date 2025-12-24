
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, Download, QrCode, Sparkles, RefreshCcw, Trash2, Link, MapPin, Phone, Info, Layout, Type as TypeIcon, Calendar, Clock, Shirt, UserCheck, CreditCard, Fingerprint, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import QRCanvas from './components/QRCanvas';
import TemplateRenderer from './components/TemplateRenderer';
import { EventDetails, QRConfig, CardTemplate, GuestDetails, TicketType } from './types';

const TEMPLATES: CardTemplate[] = [
  { id: 'wedding_floral', name: 'Swahili Floral', primaryColor: '#E67E22', secondaryColor: '#D35400', accentColor: '#F39C12', fontFamily: 'serif', bgGradient: 'from-orange-50 to-orange-100', hasFlowers: true, borderStyle: 'ornate' },
  { id: 'classic_gold', name: 'Royal Gold', primaryColor: '#B7950B', secondaryColor: '#9A7D0A', accentColor: '#D4AC0D', fontFamily: 'serif', bgGradient: 'from-amber-50 to-yellow-100', hasFlowers: false, borderStyle: 'ornate' },
  { id: 'royal_purple', name: 'Velvet Purple', primaryColor: '#F1C40F', secondaryColor: '#F39C12', accentColor: '#E67E22', fontFamily: 'serif', bgGradient: 'from-purple-900 to-indigo-950', hasFlowers: false, borderStyle: 'pattern' },
  { id: 'zanzibar_pattern', name: 'Zanzibar Shores', primaryColor: '#2980B9', secondaryColor: '#2C3E50', accentColor: '#3498DB', fontFamily: 'serif', bgGradient: 'from-cyan-50 to-blue-100', hasFlowers: true, borderStyle: 'pattern' },
  { id: 'modern_minimal', name: 'Minimalist Clean', primaryColor: '#2C3E50', secondaryColor: '#34495E', accentColor: '#7F8C8D', fontFamily: 'sans-serif', bgGradient: 'from-slate-50 to-slate-200', hasFlowers: false, borderStyle: 'none' },
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
  hostNames: "Familia ya Bw. na Bi. Deodatus Mussa Nachenga\ninayo furaha kubwa kukualika/kuwaalika",
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
  const [activeTab, setActiveTab] = useState<'templates' | 'details' | 'ticket' | 'qr'>('templates');
  
  const templateCanvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateImage, setTemplateImage] = useState<string | null>(null);

  const finalQRContent = useMemo(() => {
    if (!config.autoFormat) return config.content;
    return `ID:${guest.uniqueId} | T:${guest.ticketType} | N:${guest.guestName || 'GUEST'} | E:${details.names} | V:${details.venue}`;
  }, [config.autoFormat, config.content, guest, details]);

  useEffect(() => {
    if (selectedTemplate && templateCanvasRef.current) {
      const timeout = setTimeout(() => {
        setTemplateImage(templateCanvasRef.current!.toDataURL());
      }, 200);
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
      };
      reader.readAsDataURL(file);
    }
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
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Fix: Added handleDownload function to process the high-resolution export canvas and trigger an image download.
  const handleDownload = () => {
    const canvas = exportCanvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `Ecard_${guest.uniqueId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
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
              <h1 className="text-lg font-bold text-white tracking-tight">Ecard TZ Studio</h1>
              <p className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold">Tanzania Digital Invitations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditorActive && (
              <button onClick={handleDownload} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold transition-all shadow-lg active:scale-95 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Save Ecard</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-10 grid lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!isEditorActive ? (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-8 py-10">
              <div className="max-w-md space-y-4">
                <h2 className="text-4xl font-black text-white leading-tight">Professional Event Invitations</h2>
                <p className="text-slate-400">Scan, customize, and generate secure digital invitations for high-end Tanzanian events.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-full border-2 border-dashed border-slate-800 hover:border-orange-500/50 bg-slate-900/30 rounded-[32px] flex flex-col items-center justify-center gap-5 cursor-pointer transition-all p-10"
                >
                  <Upload className="w-12 h-12 text-slate-500 group-hover:text-orange-400 group-hover:scale-110 transition-all" />
                  <div>
                    <p className="text-lg font-bold text-white">Upload Your Design</p>
                    <p className="text-xs text-slate-500 mt-1">Overlay QR on your existing image</p>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left px-2">Select a Template</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => {setSelectedTemplate(t); setImage(null); setActiveTab('details');}}
                        className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3 flex flex-col items-center gap-2 hover:border-orange-500/50 transition-all group"
                      >
                        <div className={`w-full h-12 rounded-lg bg-gradient-to-tr ${t.bgGradient} opacity-40 group-hover:opacity-100 transition-opacity`} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-center bg-slate-900/20 backdrop-blur-sm p-4 rounded-[40px] border border-white/5 shadow-2xl relative">
                {selectedTemplate && (
                  <div className="hidden">
                     <TemplateRenderer template={selectedTemplate} details={details} guest={guest} canvasRef={templateCanvasRef} />
                  </div>
                )}
                
                {(image || templateImage) && (
                  <QRCanvas image={image || templateImage!} config={{...config, content: finalQRContent}} canvasRef={exportCanvasRef}
                    onPositionChange={(x, y) => setConfig(prev => ({ ...prev, posX: x, posY: y }))}
                  />
                )}
                <canvas ref={exportCanvasRef} className="hidden" />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          {isEditorActive && (
            <div className="bg-slate-900/90 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl sticky top-24 backdrop-blur-xl">
              <div className="flex bg-white/5 p-1.5 m-3 rounded-2xl">
                {['templates', 'details', 'ticket', 'qr'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                {activeTab === 'templates' ? (
                  <div className="space-y-4">
                     <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 transition-all group">
                        <div className="flex items-center gap-4">
                          <ImageIcon className="w-6 h-6 text-orange-400" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-white">Use Custom Upload</p>
                            <p className="text-[10px] text-slate-500">Overlay QR on your image</p>
                          </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                     </button>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 pt-4">Premium Styles</p>
                     {TEMPLATES.map(t => (
                        <button key={t.id} onClick={() => {setSelectedTemplate(t); setImage(null);}}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedTemplate?.id === t.id ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.bgGradient}`} />
                            <span className="text-sm font-bold uppercase">{t.name}</span>
                          </div>
                          {t.hasFlowers && <Sparkles className="w-4 h-4 text-orange-400" />}
                        </button>
                     ))}
                  </div>
                ) : activeTab === 'details' ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Invitation Header / Host Info</label>
                      <textarea value={details.hostNames} onChange={e => setDetails({...details, hostNames: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white text-xs leading-relaxed outline-none focus:border-orange-500 min-h-[80px]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Celebrant Names</label>
                      <input type="text" value={details.names} onChange={e => setDetails({...details, names: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-orange-500" />
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
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dress Code</label>
                      <input type="text" value={details.dressCode} onChange={e => setDetails({...details, dressCode: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm outline-none font-bold text-orange-400" />
                    </div>
                  </div>
                ) : activeTab === 'ticket' ? (
                  <div className="space-y-6">
                    <div className="bg-orange-500/5 p-6 rounded-[32px] border border-orange-500/10 space-y-5">
                       <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Guest & Check-in Details
                       </h4>
                       <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Personalize for Guest</label>
                            <input type="text" value={guest.guestName} onChange={e => setGuest({...guest, guestName: e.target.value})} 
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none" placeholder="e.g. Mussa Juma" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Ticket Level</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['Single', 'Double', 'VIP', 'VVIP'].map(t => (
                                <button key={t} onClick={() => setGuest({...guest, ticketType: t as TicketType})}
                                  className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${guest.ticketType === t ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                             <div className="space-y-1">
                               <p className="text-[9px] font-bold text-slate-500 uppercase">Secure Unique ID</p>
                               <p className="text-xs font-mono text-orange-500">{guest.uniqueId}</p>
                             </div>
                             <button onClick={() => setGuest({...guest, uniqueId: generateId()})} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                               <RefreshCcw className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">QR Size</label>
                      <input type="range" min="40" max="300" step="5" value={config.size}
                        onChange={(e) => setConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                        className="w-full accent-orange-500" />
                    </div>
                    <div className="p-5 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Encoded Payload</p>
                       <div className="p-4 bg-slate-900/50 rounded-2xl text-[11px] font-mono text-orange-400/80 break-all leading-relaxed border border-white/5">
                          {finalQRContent}
                       </div>
                       <p className="text-[9px] text-slate-500 italic">This data is structured for professional check-in scanners at event entrances.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-black/20 border-t border-white/5 flex items-center gap-4">
                <button onClick={resetAll} className="flex-1 py-4 text-[10px] font-black text-slate-500 hover:text-red-400 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> Reset Card
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-10 text-center border-t border-white/5 bg-slate-900/40">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Designed for high-end Tanzanian Events • Secure Check-in Enabled</p>
      </footer>
    </div>
  );
};

export default App;
