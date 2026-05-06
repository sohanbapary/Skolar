import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  Download, 
  Plus, 
  Trash2, 
  Search,
  Zap,
  Lightbulb,
  Target,
  Rocket,
  Loader2 as Loader2Icon
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface CVData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  experience: { company: string; role: string; duration: string; location: string; bullets: string[] }[];
  education: { school: string; degree: string; year: string; location: string; details: string }[];
  skills: { category: string; items: string }[];
  awards: { title: string; year: string; organization: string }[];
}

export default function CVTool() {
  const [mode, setMode] = useState<'selection' | 'analyze' | 'maker'>('selection');
  const [makerStep, setMakerStep] = useState(1);
  
  // Analyzer State
  const [cvText, setCvText] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Maker State
  const [cvData, setCvData] = useState<CVData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    awards: []
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCvText(prev => prev + "\n" + content.substring(0, 5000));
    };
    reader.readAsText(file);
  };

  const analyzeCV = async () => {
    if (!cvText.trim()) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an elite International Admissions & Career Strategist. Analyze the following CV content for a student applying to top-tier global scholarships and universities. 
        
        Provide:
        1. MERIT SCORE (0-100)
        2. CRITICAL GAPS: What is missing for elite institutions?
        3. QUANTUM REFINE: How to rephrase 2-3 specific points to sound more "high-impact".
        4. STRATEGIC POSITIONING: How should this student brand themselves? (e.g. "The Technical Humanitarian")

        CV CONTENT:
        ${cvText}

        Format as structured sections with titles.`
      });
      setAnalysis(response.text || "Analysis failed.");
    } catch (err) {
      console.error(err);
      setAnalysis("AI Analysis node timed out. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadCV = () => {
    const content = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Times New Roman', serif; line-height: 1.5; padding: 40px; color: #333; }
  h1 { text-align: center; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }
  .contact { text-align: center; font-size: 14px; margin-bottom: 30px; }
  h2 { border-bottom: 2px solid #555; text-transform: uppercase; font-size: 18px; margin-top: 30px; }
  .item { margin-bottom: 20px; }
  .item-header { display: flex; justify-content: space-between; font-weight: bold; }
  .sub-header { display: flex; justify-content: space-between; font-style: italic; font-size: 14px; color: #555; }
  ul { padding-left: 20px; margin-top: 5px; }
  li { margin-bottom: 5px; font-size: 14px; }
</style>
</head>
<body>
  <h1>${cvData.name || 'Candidate Name'}</h1>
  <div class="contact">
    ${cvData.email} | ${cvData.phone} | ${cvData.location}<br/>
    ${cvData.linkedin} | ${cvData.website}
  </div>

  <h2>Summary</h2>
  <p style="font-size: 14px;">${cvData.summary}</p>

  <h2>Education</h2>
  ${cvData.education.map(edu => `
    <div class="item">
      <div class="item-header"><span>${edu.school}</span><span>${edu.year}</span></div>
      <div class="sub-header"><span>${edu.degree}</span><span>${edu.location}</span></div>
      <p style="font-size: 13px; color: #666; margin-top: 5px;">${edu.details}</p>
    </div>
  `).join('')}

  <h2>Experience</h2>
  ${cvData.experience.map(exp => `
    <div class="item">
      <div class="item-header"><span>${exp.company}</span><span>${exp.duration}</span></div>
      <div class="sub-header"><span>${exp.role}</span><span>${exp.location}</span></div>
      <ul>
        ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>
  `).join('')}

  <h2>Skills</h2>
  ${cvData.skills.map(s => `
    <p style="font-size: 14px;"><strong>${s.category}:</strong> ${s.items}</p>
  `).join('')}

  <h2>Awards & Honors</h2>
  ${cvData.awards.map(a => `
    <div class="item-header" style="font-size: 14px;"><span>${a.title} - ${a.organization}</span><span>${a.year}</span></div>
  `).join('')}
</body>
</html>
    `;
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = `${cvData.name.replace(/\s+/g, '_')}_CV.html`;
    document.body.appendChild(element);
    element.click();
  };

  const nextStep = () => setMakerStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setMakerStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-[600px] bg-brand-navy/30 rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
      <AnimatePresence mode="wait">
        {mode === 'selection' && (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 gap-8 h-full"
          >
            <button 
              onClick={() => setMode('analyze')}
              className="p-10 glass-card rounded-[2.5rem] border border-white/5 hover:border-brand-gold/40 transition-all text-left flex flex-col group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-brand-gold/5 group-hover:bg-brand-gold/10 transition-colors" />
              <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-8 group-hover:scale-110 transition-transform relative z-10">
                <Search size={32} />
              </div>
              <h3 className="text-3xl font-display font-black text-white mb-4 relative z-10 uppercase tracking-tighter">Sovereign Analysis</h3>
              <p className="text-slate-500 font-medium leading-relaxed relative z-10">
                Audit your current CV against global merit benchmarks. Receive elite-tier refinements and impact calibration.
              </p>
              <div className="mt-8 flex items-center gap-3 text-brand-gold font-black text-[10px] uppercase tracking-widest relative z-10">
                Open Analysis Engine <ChevronRight size={14} />
              </div>
            </button>

            <button 
              onClick={() => setMode('maker')}
              className="p-10 glass-card rounded-[2.5rem] border border-white/5 hover:border-brand-gold/40 transition-all text-left flex flex-col group relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-white/5 group-hover:bg-white/[0.08] transition-colors" />
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform relative z-10">
                <Plus size={32} />
              </div>
              <h3 className="text-3xl font-display font-black text-white mb-4 relative z-10 uppercase tracking-tighter">CV Architect</h3>
              <p className="text-slate-500 font-medium leading-relaxed relative z-10">
                Build a high-fidelity institutional resume from scratch. Optimized for international scholarship boards.
              </p>
              <div className="mt-8 flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-widest relative z-10 opacity-50">
                Launch Architect <ChevronRight size={14} />
              </div>
            </button>
          </motion.div>
        )}

        {mode === 'analyze' && (
          <motion.div 
            key="analyze"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <button onClick={() => setMode('selection')} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">
                <ArrowLeft size={14} /> Back to Selection
              </button>
              <span className="text-brand-gold text-[10px] font-black uppercase tracking-widest">Sovereign Audit Node</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter">CV Input</h2>
                  <div className="flex gap-4">
                    <input 
                      type="file" 
                      id="cv-analyzer-upload" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      accept=".txt,.md" 
                    />
                    <button 
                      onClick={() => document.getElementById('cv-analyzer-upload')?.click()}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-brand-gold hover:border-brand-gold/30 transition-all"
                    >
                      Attach Document
                    </button>
                  </div>
                </div>
                <textarea 
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Paste your professional narrative here..."
                  className="w-full h-96 bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 text-slate-300 focus:outline-none focus:border-brand-gold/30 transition-all resize-none shadow-inner"
                />
                <button 
                  onClick={analyzeCV}
                  disabled={analyzing || !cvText.trim()}
                  className="w-full py-6 bg-brand-gold text-brand-navy rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-gold/20 disabled:opacity-20"
                >
                  {analyzing ? <Loader2Icon className="animate-spin" size={20} /> : <Zap size={20} />}
                  Run Merit Audit
                </button>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 flex flex-col h-[600px] overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <Sparkles size={20} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-[0.3em]">AI Intelligence Node</h4>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-4 scrollbar-hide space-y-8 italic text-slate-400 leading-relaxed font-medium">
                  {analysis ? (
                    <div className="prose prose-invert max-w-none prose-p:text-slate-400 prose-headings:text-white prose-headings:font-display prose-headings:font-black">
                      {analysis.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                       <Lightbulb size={48} className="mb-6" />
                       <p className="max-w-xs uppercase tracking-widest text-[10px] font-black">Analysis results will manifest here upon payload transmission.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'maker' && (
          <motion.div 
            key="maker"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
             <div className="flex items-center justify-between">
              <button onClick={() => setMode('selection')} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">
                <ArrowLeft size={14} /> Back to Selection
              </button>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <div 
                      key={s} 
                      className={`w-8 h-1 rounded-full transition-all ${makerStep >= s ? 'bg-brand-gold' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
                <button 
                  onClick={downloadCV}
                  className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-brand-gold text-[10px] font-black uppercase tracking-widest hover:bg-brand-gold/10 transition-all"
                >
                  <Download size={14} /> Export Institutional CV
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 space-y-8">
                 <AnimatePresence mode="wait">
                   {makerStep === 1 && (
                     <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Core Identity</h2>
                        <div className="space-y-6">
                           <InputField label="Full Identity" value={cvData.name} onChange={v => setCvData({...cvData, name: v})} placeholder="Julius Caesar" />
                           <div className="grid grid-cols-2 gap-4">
                              <InputField label="Email Node" value={cvData.email} onChange={v => setCvData({...cvData, email: v})} placeholder="hq@skolar.ai" />
                              <InputField label="Telecom" value={cvData.phone} onChange={v => setCvData({...cvData, phone: v})} placeholder="+1 800 MATRIX" />
                           </div>
                           <InputField label="Location Index" value={cvData.location} onChange={v => setCvData({...cvData, location: v})} placeholder="London, United Kingdom" />
                           <div className="grid grid-cols-2 gap-4">
                              <InputField label="LinkedIn URL" value={cvData.linkedin} onChange={v => setCvData({...cvData, linkedin: v})} placeholder="linkedin.com/in/..." />
                              <InputField label="Global Website" value={cvData.website} onChange={v => setCvData({...cvData, website: v})} placeholder="julius.sh" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 pl-4">Strategic Summary</label>
                              <textarea 
                                value={cvData.summary}
                                onChange={e => setCvData({ ...cvData, summary: e.target.value })}
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:border-brand-gold/30 outline-none transition-all placeholder:text-slate-800 italic resize-none"
                                placeholder="A student of global trajectories..."
                              />
                           </div>
                        </div>
                     </motion.div>
                   )}

                   {makerStep === 2 && (
                     <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="flex items-center justify-between">
                          <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Academic Merit</h2>
                          <button onClick={() => setCvData({...cvData, education: [...cvData.education, { school: "", degree: "", year: "", location: "", details: "" }]})} className="w-10 h-10 rounded-xl bg-brand-gold text-brand-navy flex items-center justify-center hover:scale-110 transition-transform">
                            <Plus size={20} />
                          </button>
                        </div>
                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                           {cvData.education.map((edu, i) => (
                             <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 relative group">
                                <button onClick={() => setCvData({...cvData, education: cvData.education.filter((_, idx) => idx !== i)})} className="absolute top-4 right-4 text-red-500/50 hover:text-red-500 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                                <InputField label="Institution" value={edu.school} onChange={v => {
                                  const next = [...cvData.education];
                                  next[i].school = v;
                                  setCvData({...cvData, education: next});
                                }} placeholder="University of Oxford" />
                                <div className="grid grid-cols-2 gap-4">
                                  <InputField label="Degree" value={edu.degree} onChange={v => {
                                    const next = [...cvData.education];
                                    next[i].degree = v;
                                    setCvData({...cvData, education: next});
                                  }} placeholder="MSc Neural Systems" />
                                  <InputField label="Graduation Year" value={edu.year} onChange={v => {
                                    const next = [...cvData.education];
                                    next[i].year = v;
                                    setCvData({...cvData, education: next});
                                  }} placeholder="2024" />
                                </div>
                             </div>
                           ))}
                        </div>
                     </motion.div>
                   )}
                   
                   {makerStep === 3 && (
                     <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="flex items-center justify-between">
                          <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Experience</h2>
                          <button onClick={() => setCvData({...cvData, experience: [...cvData.experience, { company: "", role: "", duration: "", location: "", bullets: [""] }]})} className="w-10 h-10 rounded-xl bg-brand-gold text-brand-navy flex items-center justify-center hover:scale-110 transition-transform">
                            <Plus size={20} />
                          </button>
                        </div>
                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                           {cvData.experience.map((exp, i) => (
                             <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 relative group">
                                <button onClick={() => setCvData({...cvData, experience: cvData.experience.filter((_, idx) => idx !== i)})} className="absolute top-4 right-4 text-red-500/50 hover:text-red-500 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                                <InputField label="Company / Entity" value={exp.company} onChange={v => {
                                  const next = [...cvData.experience];
                                  next[i].company = v;
                                  setCvData({...cvData, experience: next});
                                }} placeholder="DeepMind Robotics" />
                                <div className="grid grid-cols-2 gap-4">
                                  <InputField label="Role Title" value={exp.role} onChange={v => {
                                    const next = [...cvData.experience];
                                    next[i].role = v;
                                    setCvData({...cvData, experience: next});
                                  }} placeholder="Lead Strategist" />
                                  <InputField label="Time Vector" value={exp.duration} onChange={v => {
                                    const next = [...cvData.experience];
                                    next[i].duration = v;
                                    setCvData({...cvData, experience: next});
                                  }} placeholder="2022 - Present" />
                                </div>
                             </div>
                           ))}
                        </div>
                     </motion.div>
                   )}

                   {makerStep === 4 && (
                     <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="flex items-center justify-between">
                          <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Skill Clusters</h2>
                          <button onClick={() => setCvData({...cvData, skills: [...cvData.skills, { category: "", items: "" }]})} className="w-10 h-10 rounded-xl bg-brand-gold text-brand-navy flex items-center justify-center hover:scale-110 transition-transform">
                            <Plus size={20} />
                          </button>
                        </div>
                        <div className="space-y-6">
                           {cvData.skills.map((skill, i) => (
                             <div key={i} className="grid grid-cols-12 gap-4 items-end">
                                <div className="col-span-4">
                                  <InputField label="Category" value={skill.category} onChange={v => {
                                    const next = [...cvData.skills];
                                    next[i].category = v;
                                    setCvData({...cvData, skills: next});
                                  }} placeholder="Technical" />
                                </div>
                                <div className="col-span-7">
                                  <InputField label="Items (Comma separated)" value={skill.items} onChange={v => {
                                    const next = [...cvData.skills];
                                    next[i].items = v;
                                    setCvData({...cvData, skills: next});
                                  }} placeholder="Python, Rust, AI" />
                                </div>
                                <div className="col-span-1">
                                  <button onClick={() => setCvData({...cvData, skills: cvData.skills.filter((_, idx) => idx !== i)})} className="mb-4 text-red-500/50 hover:text-red-500">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                             </div>
                           ))}
                        </div>
                     </motion.div>
                   )}

                   {makerStep === 5 && (
                     <motion.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Honors / Awards</h2>
                        <div className="space-y-6">
                           {cvData.awards.map((award, i) => (
                             <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 relative">
                                <button onClick={() => setCvData({...cvData, awards: cvData.awards.filter((_, idx) => idx !== i)})} className="absolute top-4 right-4 text-red-500/50 hover:text-red-500">
                                  <Trash2 size={16} />
                                </button>
                                <InputField label="Award Title" value={award.title} onChange={v => {
                                  const next = [...cvData.awards];
                                  next[i].title = v;
                                  setCvData({...cvData, awards: next});
                                }} placeholder="Global Merit Scholar" />
                                <div className="grid grid-cols-2 gap-4">
                                  <InputField label="Issuing Body" value={award.organization} onChange={v => {
                                    const next = [...cvData.awards];
                                    next[i].organization = v;
                                    setCvData({...cvData, awards: next});
                                  }} placeholder="UNESCO" />
                                  <InputField label="Year" value={award.year} onChange={v => {
                                    const next = [...cvData.awards];
                                    next[i].year = v;
                                    setCvData({...cvData, awards: next});
                                  }} placeholder="2023" />
                                </div>
                             </div>
                           ))}
                           <button onClick={() => setCvData({...cvData, awards: [...cvData.awards, { title: "", year: "", organization: "" }]})} className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-slate-600 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-3 font-bold text-xs uppercase">
                            <Plus size={16} /> Add Recognition Vector
                          </button>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <div className="pt-8 border-t border-white/5 flex gap-4">
                    {makerStep > 1 && (
                      <button onClick={prevStep} className="flex-1 py-4 bg-white/5 rounded-xl text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">
                        Previous Vector
                      </button>
                    )}
                    {makerStep < 5 && (
                      <button onClick={nextStep} className="flex-[2] py-4 bg-brand-gold text-brand-navy rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-brand-gold/10">
                        Next Command
                      </button>
                    )}
                    {makerStep === 5 && (
                      <button onClick={downloadCV} className="flex-[2] py-4 bg-brand-gold text-brand-navy rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-brand-gold/10 flex items-center justify-center gap-2">
                        <Download size={14} /> Finalize Architecture
                      </button>
                    )}
                 </div>
              </div>

              <div className="lg:col-span-7 bg-[#020617] border border-white/5 rounded-[2.5rem] p-8 md:p-14 min-h-[800px] shadow-3xl flex flex-col font-serif relative">
                <div className="absolute top-8 right-8 flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500/50" />
                   <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                   <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
                
                <div className="text-center mb-12">
                   <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-[0.9]">{cvData.name || "CANDIDATE NAME"}</h1>
                   <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-brand-gold text-[9px] font-black uppercase tracking-[0.3em] opacity-70">
                      <span>{cvData.email || "EMAIL_UNDEFINED"}</span>
                      {cvData.phone && <span>| {cvData.phone}</span>}
                      {cvData.location && <span>| {cvData.location}</span>}
                   </div>
                   <div className="flex justify-center gap-4 mt-2 text-slate-500 text-[8px] font-bold uppercase tracking-widest">
                      {cvData.linkedin && <span>LinkedIn: {cvData.linkedin}</span>}
                      {cvData.website && <span>Site: {cvData.website}</span>}
                   </div>
                </div>

                <div className="space-y-12">
                   {cvData.summary && (
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold whitespace-nowrap">Professional Objective</h4>
                           <div className="h-[1px] w-full bg-brand-gold/20" />
                        </div>
                        <p className="text-slate-400 italic leading-relaxed text-sm antialiased">{cvData.summary}</p>
                     </div>
                   )}

                   {cvData.education.length > 0 && (
                     <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold whitespace-nowrap">Academic Merit</h4>
                           <div className="h-[1px] w-full bg-brand-gold/20" />
                        </div>
                        <div className="space-y-6">
                          {cvData.education.map((edu, i) => (
                            <div key={i} className="group/edu">
                               <div className="flex justify-between items-baseline mb-1">
                                  <h5 className="text-white font-bold text-sm uppercase tracking-tight">{edu.degree || "Degree Title"}</h5>
                                  <span className="text-[9px] text-brand-gold font-black uppercase">{edu.year || "Year"}</span>
                               </div>
                               <div className="flex justify-between items-baseline">
                                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{edu.school || "Institution Name"}</p>
                                  <p className="text-slate-600 text-[8px] font-bold uppercase">{edu.location}</p>
                               </div>
                            </div>
                          ))}
                        </div>
                     </div>
                   )}

                   {cvData.experience.length > 0 && (
                     <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold whitespace-nowrap">Operational Vectors</h4>
                           <div className="h-[1px] w-full bg-brand-gold/20" />
                        </div>
                        <div className="space-y-8">
                          {cvData.experience.map((exp, i) => (
                            <div key={i} className="space-y-3">
                               <div className="flex justify-between items-baseline">
                                  <h5 className="text-white font-bold text-sm uppercase tracking-tight">{exp.role || "Operational Role"}</h5>
                                  <span className="text-[9px] text-slate-500 font-bold uppercase">{exp.duration}</span>
                               </div>
                               <div className="flex justify-between items-baseline">
                                  <p className="text-brand-gold font-bold text-[10px] uppercase tracking-widest">{exp.company || "Institution / Entity"}</p>
                                  <p className="text-slate-600 text-[8px] font-bold uppercase">{exp.location}</p>
                               </div>
                               <ul className="list-disc list-inside text-slate-500 text-[11px] leading-relaxed space-y-1.5 pl-2 marker:text-brand-gold/40">
                                  {exp.bullets.map((b, bi) => <li key={bi}>{b || "Strategic outcome vector defined here..."}</li>)}
                               </ul>
                            </div>
                          ))}
                        </div>
                     </div>
                   )}

                   {cvData.skills.length > 0 && (
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold whitespace-nowrap">Technical Clusters</h4>
                           <div className="h-[1px] w-full bg-brand-gold/20" />
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                           {cvData.skills.map((s, i) => (
                             <div key={i}>
                                <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">{s.category || "Domain"}</p>
                                <p className="text-slate-500 text-[10px] italic">{s.items || "Skill matrix..."}</p>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}
                </div>

                <div className="mt-auto pt-16 flex items-center justify-between opacity-20 filter grayscale">
                   <div className="flex items-center gap-2">
                      <Rocket size={16} />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em]">Institutional Grade</span>
                   </div>
                   <span className="text-[8px] font-black uppercase tracking-[0.3em]">Ref: CV-ARCH-2026-SKR</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 pl-4">{label}</label>
      <input 
        type="text" 
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white focus:border-brand-gold/30 outline-none transition-all placeholder:text-slate-800 italic text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}
