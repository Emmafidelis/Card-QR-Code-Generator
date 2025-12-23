
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, QrCode, Sparkles, RefreshCcw, Trash2, Link, MapPin, Phone, Info, Layout, Type as TypeIcon, Calendar, Clock, Shirt, UserCheck } from 'lucide-react';
import QRCanvas from './components/QRCanvas';
import TemplateRenderer from './components/TemplateRenderer';
import { EventDetails, QRConfig, CardTemplate } from './types';
import { analyzeCardImage } from './services/geminiService';

const TEMPLATES: CardTemplate[] = [
  { id: 'wedding_floral', name: 'Swahili Floral', primaryColor: '#E67E22', secondaryColor: '#D35400', accentColor: '#F39C12', fontFamily: 'serif', bgGradient: 'from-orange-50 to-orange-100', hasFlowers: true, borderStyle: 'ornate' },
  { id: 'classic_gold', name: 'Royal Gold', primaryColor: '#B7950B', secondaryColor: '#9A7D0A', accentColor: '#D4AC0D', fontFamily: 'serif', bgGradient: 'from-amber-50 to-yellow-100', hasFlowers: false, borderStyle: 'ornate' },
  { id: 'royal_purple', name: 'Velvet Purple', primaryColor: '#F1C40F', secondaryColor: '#F39C12', accentColor: '#E67E22', fontFamily: 'serif', bgGradient: 'from-purple-900 to-indigo-950', hasFlowers: false, borderStyle: 'pattern' },
  { id: 'zanzibar_pattern', name: 'Spice Island', primaryColor: '#273c75', secondaryColor: '#192a56', accentColor: '#40739e', fontFamily: 'serif', bgGradient: 'from-blue-50 to-cyan-50', hasFlowers: true, borderStyle: 'pattern' },
  { id: 'birthday_party', name: 'Party Burst', primaryColor: '#e84393', secondaryColor: '#d63031', accentColor: '#00cec9', fontFamily: 'sans-serif', bgGradient: 'from-pink-50 to-rose-100', hasFlowers: true, borderStyle: 'simple' },
];

const DEFAULT_CONFIG: QRConfig = {
  content: "https://maps.app.goo.gl/79UGeaJyx5YZQYTB9",
  size: 110,
  posX: 520,
  posY: 270,
  color: "#000000",
  bgColor: "#ffffff",
  includeMargin: true
};

const DEFAULT_DETAILS: EventDetails = {
  eventTitle: "Kadi ya Harusi",
  hostNames: "Familia ya Bw. na Bi. Deodatus Mussa Nachenga wa\nYombo Dovya Dar es Salaam inayo furaha kubwa\nkukualika/kuwaalika",
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'details' | 'qr'>('templates');
  
  const templateCanvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateImage, setTemplateImage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTemplate && templateCanvasRef.current) {
      const timeout = setTimeout(() => {
        setTemplateImage(templateCanvasRef.current!.toDataURL());
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [selectedTemplate, details]);

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
          if (extracted.locationUrl) setConfig(prev => ({ ...prev, content: extracted.locationUrl }));
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
    link.download = `ecard-${details.names.replace(/\s/g, '-') || 'invitation'}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const resetAll = () => {
    if (confirm("Reset everything?")) {
      setImage(null);
      setSelectedTemplate(null);
      setConfig(DEFAULT_CONFIG);
      setDetails(DEFAULT_DETAILS);
      setIsAnalyzing(false);
      setActiveTab('templates');
      setTemplateImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
              <h1 className="text-lg font-bold text-white tracking-tight">Ecard TZ Studio</h1>
              <p className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold">Tanzania Digital Invitations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditorActive && (
              <>
                <button onClick={resetAll} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
                <button onClick={handleDownload} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold transition-all shadow-lg active:scale-95 text-sm">
                  <Download className="w-4 h-4" />
                  <span>Save Card</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-10 grid lg:grid-cols-12 gap-10">
        
        {/* Preview Area */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!isEditorActive ? (
            <div className="space-y-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-[350px] border-2 border-dashed border-slate-800 hover:border-orange-500/50 bg-slate-900/30 rounded-3xl flex flex-col items-center justify-center gap-5 cursor-pointer transition-all overflow-hidden"
              >
                <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all border border-slate-700">
                  <Upload className="w-10 h-10 text-slate-400 group-hover:text-orange-400" />
                </div>
                <div className="text-center px-4">
                  <p className="text-xl font-semibold text-white">Upload Your Paper Design</p>
                  <p className="text-sm text-slate-500 mt-2">AI will automatically scan names, dress code, and hall details to digitalize it.</p>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>

              <div className="space-y-4">
                <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest px-1">Or Create from Premium Templates</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => {setSelectedTemplate(t); setImage(null); setActiveTab('details');}}
                      className="aspect-[3/4] rounded-2xl border border-slate-800 bg-slate-900 hover:border-orange-500/50 p-2 flex flex-col transition-all group overflow-hidden"
                    >
                      <div className={`flex-1 rounded-xl bg-gradient-to-tr ${t.bgGradient} flex items-center justify-center overflow-hidden`}>
                         <Layout className="w-8 h-8 opacity-20" />
                      </div>
                      <span className="p-2 text-[10px] font-bold text-slate-400 group-hover:text-orange-400 transition-colors uppercase truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  Ecard Editor
                </h2>
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-orange-400 animate-pulse bg-orange-400/10 px-3 py-1 rounded-full text-xs font-bold">
                    <RefreshCcw className="w-3 h-3 animate-spin" />
                    AI scanning details...
                  </div>
                )}
              </div>
              
              <div className="flex justify-center bg-slate-900/20 backdrop-blur-sm p-4 rounded-[40px] border border-white/5 shadow-2xl relative">
                {selectedTemplate && (
                  <div className="hidden">
                     <TemplateRenderer template={selectedTemplate} details={details} canvasRef={templateCanvasRef} />
                  </div>
                )}
                
                {(image || templateImage) && (
                  <QRCanvas image={image || templateImage!} config={config} canvasRef={exportCanvasRef}
                    onPositionChange={(x, y) => setConfig(prev => ({ ...prev, posX: x, posY: y }))}
                  />
                )}
                <canvas ref={exportCanvasRef} className="hidden" />
              </div>
            </div>
          )}
        </div>

        {/* Edit Panel */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/80 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl sticky top-24 backdrop-blur-md">
            <div className="flex bg-white/5 p-1 m-2 rounded-2xl">
              <button onClick={() => setActiveTab('templates')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'templates' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>
                Style
              </button>
              <button onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'details' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>
                Details
              </button>
              <button onClick={() => setActiveTab('qr')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'qr' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>
                QR Code
              </button>
            </div>

            <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
              {activeTab === 'templates' ? (
                <div className="space-y-6">
                   <button onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 transition-all group">
                      <div className="flex items-center gap-3">
                        <Upload className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-all" />
                        <span className="text-sm font-bold text-white">Switch to Custom Upload</span>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                   </button>
                   <div className="grid grid-cols-1 gap-3">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Templates</p>
                      {TEMPLATES.map(t => (
                        <button key={t.id} onClick={() => {setSelectedTemplate(t); setImage(null);}}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedTemplate?.id === t.id ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.bgGradient}`} />
                            <span className="text-sm font-bold uppercase">{t.name}</span>
                          </div>
                          {t.hasFlowers && <Sparkles className="w-3 h-3 text-yellow-500" />}
                        </button>
                      ))}
                   </div>
                </div>
              ) : activeTab === 'details' ? (
                <div className="space-y-5">
                   <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><TypeIcon className="w-3 h-3"/> Event Type</label>
                      <input type="text" value={details.eventTitle} onChange={e => setDetails({...details, eventTitle: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-medium focus:border-orange-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><UserCheck className="w-3 h-3"/> Invitation Host / Header</label>
                      <textarea value={details.hostNames} onChange={e => setDetails({...details, hostNames: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-medium focus:border-orange-500 outline-none text-xs leading-relaxed" rows={3} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1">Celebrant Names</label>
                      <input type="text" value={details.names} onChange={e => setDetails({...details, names: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-orange-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Date</label>
                        <input type="text" value={details.date} onChange={e => setDetails({...details, date: e.target.value})}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Time (Saa)</label>
                        <input type="text" value={details.time} onChange={e => setDetails({...details, time: e.target.value})}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Venue / Location</label>
                      <input type="text" value={details.venue} onChange={e => setDetails({...details, venue: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><Shirt className="w-3 h-3"/> Dress Code</label>
                      <input type="text" value={details.dressCode} onChange={e => setDetails({...details, dressCode: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none font-bold text-orange-400" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><Phone className="w-3 h-3"/> Contact / RSVP</label>
                      <input type="text" value={details.contact} onChange={e => setDetails({...details, contact: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none" />
                    </div>
                   </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><Link className="w-3 h-3"/> QR Action Link</label>
                    <textarea value={config.content} onChange={(e) => setConfig(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm outline-none resize-none font-mono" rows={3} placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1">QR Size</label>
                      <input type="range" min="40" max="350" step="5" value={config.size}
                        onChange={(e) => setConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                        className="w-full accent-orange-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1">Margin</label>
                      <button onClick={() => setConfig(prev => ({ ...prev, includeMargin: !prev.includeMargin }))}
                        className={`w-full py-2 rounded-xl text-xs font-bold border transition-all ${config.includeMargin ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                        {config.includeMargin ? 'WITH BORDER' : 'COMPACT'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center border-t border-white/5 bg-slate-900/40">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Crafted for the Beautiful People of Tanzania • Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;
