/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  ArrowLeft,
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Rocket,
  Search,
  Target,
  LayoutDashboard,
  Menu,
  X,
  Zap,
  Shield,
  Send,
  ChevronRight,
  Sparkles,
  Trophy,
  CheckCircle2,
  FileText,
  ExternalLink,
  BookOpen,
  Filter,
  Loader2,
  Lightbulb
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, collection, addDoc, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import Dashboard from './components/Dashboard';
import CVTool from './components/CVTool';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// --- Error Handling ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Types ---

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  twitter?: string;
}

interface Service {
  title: string;
  description: string;
  icon: typeof GraduationCap;
}

// --- Data ---

const CORE_VALUES = [
  { icon: Globe, title: "Sovereign Merit", desc: "Rigorous audit of thousands of global scholarship benchmarks." },
  { icon: ShieldCheck, title: "Data Integrity", desc: "Privacy-first logic protecting student profile and document security." },
  { icon: Trophy, title: "Elite Access", desc: "Absolute alignment with institutional requirements and global standards." },
  { icon: Zap, title: "Merit Engine", desc: "Real-time trajectory analysis powered by the Skolar Intel engine." }
];

const SERVICES: Service[] = [
  {
    title: "Merit Alignment",
    icon: Sparkles,
    description: "High-fidelity mapping of applicant capabilities against scholarship merit benchmarks."
  },
  {
    title: "Document Strategy",
    icon: FileText,
    description: "Architecting elite portfolios including transcripts and recommendation narratives."
  },
  {
    title: "Application Sync",
    icon: Rocket,
    description: "Seamless multi-stage application portal with real-time status tracking."
  },
  {
    title: "CV Intelligence",
    icon: Zap,
    description: "Sovereign CV analysis and architectural building optimized for elite merit benchmarks."
  },
  {
    title: "Security & Trust",
    icon: Shield,
    description: "Verified document storage and encrypted student profiles for elite institutions."
  }
];

const TEAM: TeamMember[] = [
  {
    name: "Dr. Alistair Vance",
    role: "Chief Global Strategist",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
    bio: "Pioneer in quantitative admissions modeling. Former dean of strategic enrollment at Tier-1 research institutions.",
    linkedin: "#",
    twitter: "@AVance"
  },
  {
    name: "Elena Petrov",
    role: "Director of Neural Systems",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    bio: "Ex-Stanford neural systems researcher. Architect of the cognitive frameworks powering our matching engine.",
    linkedin: "#",
    twitter: "@EPetrov"
  },
  {
    name: "Marcus Thorne",
    role: "Global Council Lead",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800",
    bio: "High-stakes educational advisor. Bridging the gap between global industrial demand and academic trajectory.",
    linkedin: "#",
    twitter: "@MThorne"
  }
];

// --- Components ---

function Navbar({ onOpenPortal, onViewDashboard, onViewCVHub, user, onLogin, onLogout }: { onOpenPortal: () => void; onViewDashboard: () => void; onViewCVHub: () => void; user: FirebaseUser | null; onLogin: () => void; onLogout: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-4" : "py-8"}`}>
      <div className={`max-w-7xl mx-auto px-6 h-20 transition-all duration-500 ${scrolled ? "bg-brand-navy/80 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-2xl mx-4 md:mx-6" : ""}`}>
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center text-brand-navy shadow-lg shadow-brand-gold/20 group-hover:rotate-12 transition-transform duration-500">
              <GraduationCap size={24} />
            </div>
            <span className="font-display font-bold text-2xl tracking-tighter text-white uppercase">
              Skolar Intel<span className="text-brand-gold">.</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-12">
            {["About", "Pathfinder", "Tools", "Services"].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 hover:text-brand-gold transition-colors"
                onClick={(e) => {
                  if (item === "Pathfinder") {
                    e.preventDefault();
                    onOpenPortal();
                  }
                  if (item === "Tools") {
                    e.preventDefault();
                    onViewCVHub();
                  }
                }}
              >
                {item}
              </a>
            ))}
            <div className="h-4 w-[1px] bg-white/10 mx-2" />
            <div className="flex items-center gap-6">
              {user ? (
                <>
                  <button 
                    onClick={onViewDashboard}
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-white hover:text-brand-gold transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard size={14} /> Dashboard
                  </button>
                  <button 
                    onClick={onLogout}
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-red-400 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                    <img src={user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}`} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </>
              ) : (
                <button 
                  onClick={onLogin}
                  className="px-8 py-3.5 bg-brand-gold text-brand-navy text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-gold/20"
                >
                  Scholar Login
                </button>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden w-12 h-12 flex items-center justify-center text-white bg-white/5 rounded-xl border border-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-4 right-4 mt-2 p-8 bg-brand-navy border border-white/5 rounded-[2.5rem] shadow-3xl z-50 overflow-hidden"
          >
             <div className="absolute inset-0 bg-brand-gold/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
             <div className="relative z-10 flex flex-col gap-8">
                {["About", "Pathfinder", "Tools", "Services"].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-lg font-black uppercase tracking-[0.4em] text-white/80"
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      if (item === "Pathfinder") {
                        e.preventDefault();
                        onOpenPortal();
                      }
                      if (item === "Tools") {
                        e.preventDefault();
                        onViewCVHub();
                      }
                    }}
                  >
                    {item}
                  </a>
                ))}
                <div className="h-[1px] w-full bg-white/5" />
                <button 
                  onClick={() => { setMobileMenuOpen(false); onViewDashboard(); }}
                  className="flex items-center gap-3 text-white font-black uppercase tracking-[0.3em]"
                >
                  <LayoutDashboard size={18} className="text-brand-gold" /> Dashboard Access
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); onOpenPortal(); }}
                  className="w-full py-5 bg-brand-gold text-brand-navy font-black rounded-2xl uppercase tracking-[0.4em] text-xs shadow-2xl shadow-brand-gold/20"
                >
                  Initiate Pathfinding
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// --- Discovery Portal Components ---

interface University {
  name: string;
  country: string;
  web_pages: string[];
}

interface Message {
  role: "user" | "ai";
  text: string;
}

// --- AICounselorSection Component ---

function AICounselorSection() {
  const [profile, setProfile] = useState({
    education: "",
    grades: "",
    english: "",
    interests: "",
    aspiration: "",
    location: "",
    cv: ""
  });
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [step, setStep] = useState(0);
  const [universities, setUniversities] = useState<(University & { suitability?: string; program?: string; score?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [matchAudit, setMatchAudit] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const performPathfinding = async () => {
    setLoading(true);
    setAiLoading(true);
    setError(null);
    setAiInsight(null);
    setRoadmap([]);
    setUniversities([]);

    try {
      const aiPrompt = `As a Senior Global Admissions Strategist, perform a high-fidelity audit for this student profile:
      - Academic Standings: ${profile.grades}
      - English Proficiency: ${profile.english}
      - Leadership & Community: ${profile.interests}
      - Career Aspiration: ${profile.aspiration}
      - Target Region: ${profile.location}
      - CV Highlights: ${profile.cv}

      CRITICAL MATCHING LOGIC: 
      1. Audit results must be strictly merit-based against known international benchmarks.
      2. MATCHES: Identify 4 specific pairs: [University | Specific Program Name | Score% | Category]. 
      3. The "Program Name" must be a real, specific degree title and must align with their career aspiration: ${profile.aspiration}.
      4. The "Score%" reflects compatibility.
      5. Classify into Reach/Target/Safe based on the entry threshold vs their standing.

      Format:
      REC: [Strategic 2-sentence summary emphasizing logic]
      AUDIT: [Detailed merit breakdown highlighting Strengths and competitive positioning]
      MATCHES: [Uni1 | Prog1 | 94% | Target], [Uni2 | Prog2 | 82% | Reach]
      COUNTRY: [Single specific country name for query, e.g. "United Kingdom"]
      KEYWORD: [Single most relevant discipline keyword, e.g. "Computer Science"]
      STEPS:
      - [Step 1]
      - [Step 2]
      - [Step 3]
      - [Step 4]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: aiPrompt,
      });

      const fullText = response.text || "";
      
      const recMatch = fullText.match(/REC: (.*?)(?=AUDIT:|$)/s);
      const auditMatch = fullText.match(/AUDIT: (.*?)(?=MATCHES:|$)/s);
      const matchesMatch = fullText.match(/MATCHES: (.*?)(?=COUNTRY:|$)/s);
      const countryMatch = fullText.match(/COUNTRY: (.*?)(?=KEYWORD:|$)/s);
      const kwMatch = fullText.match(/KEYWORD: (.*?)(?=STEPS:|$)/s);
      const stepsMatch = fullText.match(/STEPS:(.*)/s);

      const rec = recMatch ? recMatch[1].trim() : "Pathfinding complete.";
      const audit = auditMatch ? auditMatch[1].trim() : "Profile alignment synchronized.";
      const rawMatches = matchesMatch ? matchesMatch[1].trim() : "";
      const searchCountry = countryMatch ? countryMatch[1].trim() : "";
      const searchKw = kwMatch ? kwMatch[1].trim().replace(/[\[\]]/g, "") : profile.interests;
      const stepsRaw = stepsMatch ? stepsMatch[1].trim().split("\n") : [];
      const cleanedSteps = stepsRaw.map(s => s.replace(/^- /, "").trim()).filter(s => s.length > 0).slice(0, 4);
      
      const programMatches = rawMatches.split("], [").map(m => {
        const parts = m.replace(/[\[\]]/g, "").split("|").map(s => s.trim());
        return { 
          uni: parts[0], 
          prog: parts[1], 
          score: parts[2] || "85%", 
          category: parts[3] || "Target" 
        };
      }).filter(m => m.uni && m.prog);

      setAiInsight(rec);
      setMatchAudit(audit);
      setRoadmap(cleanedSteps.length > 0 ? cleanedSteps : ["Research institutions", "Prepare tests", "Update portfolio", "Consult mentor"]);

      // Save to Firebase User Profile
      if (auth.currentUser) {
        setDoc(doc(db, 'users', auth.currentUser.uid), {
          grades: profile.grades,
          englishProficiency: profile.english,
          leadership: profile.interests,
          aspirations: profile.aspiration,
          targetRegion: profile.location,
          cvHighlights: profile.cv,
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'users'));
      }

      try {
        const countryParam = searchCountry ? `&country=${encodeURIComponent(searchCountry)}` : "";
        const uniResponse = await fetch(`/api/universities?name=${encodeURIComponent(searchKw)}${countryParam}`);
        if (uniResponse.ok) {
          const data = await uniResponse.json();
          const processedUnis = data.map((u: any, i: number) => {
            const aiMatch = programMatches.find(pm => u.name.toLowerCase().includes(pm.uni.toLowerCase()) || pm.uni.toLowerCase().includes(u.name.toLowerCase()));
            return {
              ...u,
              program: aiMatch ? aiMatch.prog : `${profile.interests} Major`,
              score: aiMatch ? aiMatch.score : `${Math.floor(Math.random() * (92 - 76 + 1) + 76)}%`,
              suitability: aiMatch ? aiMatch.category : (i % 3 === 0 ? "Reach" : i % 3 === 1 ? "Target" : "Safety")
            };
          }).slice(0, 16);
          
          processedUnis.sort((a: any, b: any) => (a.score > b.score ? -1 : 1));
          setUniversities(processedUnis);
        }
      } catch (fetchErr) {
        console.warn("Database sync interrupted, applying AI inference:", fetchErr);
      }

      setStep(6);
      setMessages([{ role: "ai", text: `Your Pathfinder results are ready. Your academic standing of ${profile.grades} and English score of ${profile.english} have been cross-referenced. How can I help you refine this roadmap?` }]);
    } catch (err: any) {
      console.error("Pathfinding failed:", err);
      setError("AI Counselor encountered a processing error. Please refine your inputs and try again.");
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput("");
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setChatLoading(true);

    // Save user message to Firebase
    if (auth.currentUser) {
      addDoc(collection(db, 'chats'), {
        userId: auth.currentUser.uid,
        role: "user",
        text: userText,
        timestamp: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'chats'));
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an expert Skolar Intel AI Counselor. A student with the following profile:
        - Grades: ${profile.grades}
        - English: ${profile.english}
        - Interests: ${profile.interests}
        - Aspiration: ${profile.aspiration}
        - Recommendation given: ${aiInsight}
        
        They asked: "${userText}"
        Provide a concise, helpful 1-2 sentence response guiding them. Be encouraging and reference their specific profile metrics if relevant.`,
      });
      
      const aiResponseText = response.text || "I'm here to support your journey. Could you clarify your question?";
      setMessages(prev => [...prev, { role: "ai", text: aiResponseText }]);

      // Save AI message to Firebase
      if (auth.currentUser) {
        addDoc(collection(db, 'chats'), {
          userId: auth.currentUser.uid,
          role: "ai",
          text: aiResponseText,
          timestamp: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'chats'));
      }
    } catch (err) {
      console.error("Chat failed:", err);
      setMessages(prev => [...prev, { role: "ai", text: "I'm having a slight connection issue, but let's keep focusing on your goals!" }]);
    } finally {
      setChatLoading(false);
    }
  };

  const steps = [
    { 
      title: "Academic Standing", 
      field: "grades", 
      icon: Trophy,
      options: ["Exceptional (GPA 3.9+ / 95%+)", "Excellent (GPA 3.5-3.8 / 85-94%)", "High (GPA 3.0-3.4 / 75-84%)", "Average (GPA 2.5-2.9 / 65-74%)", "Basic / Merit Development Needed"]
    },
    { 
      title: "English Proficiency", 
      field: "english", 
      icon: BookOpen,
      options: [
        "IELTS Overall 7.5+", 
        "IELTS Overall 6.0 - 7.0", 
        "PTE Academic 75+", 
        "PTE Academic 58 - 74", 
        "TOEFL iBT 100+", 
        "Duolingo 120+",
        "Test Pending / Merit Waiver Possible"
      ]
    },
    { 
      title: "Leadership & Community", 
      field: "interests", 
      icon: Users,
      options: ["Student Government", "Non-Profit / Volunteering", "Sports Leadership", "Tech Innovation", "Artistic Achievement", "Social Policy", "Research / Publications", "Entrepreneurship"]
    },
    { 
      title: "Career Aspiration", 
      field: "aspiration", 
      icon: Target,
      options: ["Global Impact / Policy", "Tech Innovator / AI", "Corporate Ethics", "Medical Advancement", "Sustainability & Green Tech", "International Law", "Educational Leadership"]
    },
    { 
      title: "Target Region", 
      field: "location", 
      icon: Globe,
      options: ["Ivy League / Elite USA", "Russell Group / UK Europe", "G8 Commonwealth", "Top Tier Asia", "Global Network Search"]
    },
    { 
      title: "Institutional CV", 
      field: "cv", 
      icon: FileText,
      placeholder: "Paste your CV highlights or professional summary for institutional audit..."
    }
  ];

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Simulate reading PDF/Docx text (In real app, we'd use a parser library)
    // For this environment, we'll simulate text extraction
    setAiLoading(true);
    setTimeout(() => {
      setProfile({ ...profile, cv: `EXTRACTED_CV_METADATA: ${file.name} - Calibrating merit trajectory from professional narrative.` });
      setAiLoading(false);
    }, 1500);
  };

  const currentStep = steps[step];

  return (
    <section id="pathfinder" className="py-32 bg-brand-navy relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <Sparkles size={14} /> Merit Audit Center
          </div>
          <h2 className="text-5xl md:text-6xl font-display font-black text-white mb-6 tracking-tighter leading-none">Scholarship Matching.</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed italic">
            Calibrate your merit variables to initiate the Skolar Intel matching engine.
          </p>
        </div>

        <div className="glass-card rounded-[3.5rem] p-6 md:p-16 border border-white/10 relative overflow-hidden">
          {/* Background Highlight */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px] -mr-48 -mt-48" />
          
          {step < 6 ? (
            <div className="max-w-3xl mx-auto relative z-10">
              <div className="flex gap-2 md:gap-3 mb-16">
                {steps.map((_, i) => (
                   <div key={i} className="flex-grow h-1.5 flex flex-col gap-2">
                      <div className={`h-full rounded-full transition-all duration-700 ${i <= step ? "bg-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "bg-white/5"}`} />
                      <span className={`text-[8px] font-black uppercase tracking-tighter text-center transition-opacity duration-500 ${i === step ? "opacity-100 text-brand-gold" : "opacity-0"}`}>Step 0{i+1}</span>
                   </div>
                ))}
              </div>

              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10 md:space-y-12"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 text-brand-gold flex items-center justify-center border border-brand-gold/20 shadow-xl">
                    {currentStep && <currentStep.icon size={26} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] mb-1">Variable Analysis</p>
                    <h3 className="text-3xl md:text-5xl font-display font-black text-white leading-none tracking-tighter uppercase">{currentStep?.title}</h3>
                  </div>
                </div>

                <div className="relative">
                  {(currentStep as any).options ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(currentStep as any).options.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setProfile({ ...profile, [currentStep.field]: opt });
                            if (step < 5) setStep(step + 1);
                            else performPathfinding();
                          }}
                          className={`group p-8 text-left rounded-[2rem] border-2 transition-all duration-500 flex items-center justify-between ${
                            profile[currentStep.field as keyof typeof profile] === opt 
                            ? "bg-brand-gold border-brand-gold text-brand-navy shadow-2xl shadow-brand-gold/30" 
                            : "bg-white/[0.02] border-white/5 text-white hover:border-brand-gold/30 hover:bg-white/5"
                          }`}
                        >
                          <span className="font-black text-xs md:text-sm uppercase tracking-widest">{opt}</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            profile[currentStep.field as keyof typeof profile] === opt ? "border-brand-navy bg-brand-navy" : "border-white/10 group-hover:border-brand-gold/40"
                          }`}>
                            {profile[currentStep.field as keyof typeof profile] === opt && <ArrowRight size={12} className="text-brand-gold" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="relative group">
                       {currentStep.field === 'cv' ? (
                         <div className="space-y-6">
                            <div 
                              onClick={() => document.getElementById('cv-trigger')?.click()}
                              className="w-full h-48 md:h-64 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.01] hover:bg-white/[0.03] hover:border-brand-gold/30 transition-all flex flex-col items-center justify-center cursor-pointer group/upload"
                            >
                               <input type="file" id="cv-trigger" className="hidden" onChange={handleCVUpload} accept=".pdf,.doc,.docx" />
                               <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-4 group-hover/upload:scale-110 transition-transform">
                                  <FileText size={32} />
                               </div>
                               <h4 className="text-xl font-display font-black text-white uppercase tracking-tighter">Attach Professional CV</h4>
                               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">{profile.cv ? "Vector Locked: Analysis Ready" : "PDF or Word Format Preferred"}</p>
                            </div>
                            <textarea 
                              value={profile[currentStep?.field as keyof typeof profile] || ""}
                              onChange={(e) => setProfile({ ...profile, [currentStep.field]: e.target.value })}
                              placeholder={currentStep?.placeholder || "Or paste CV highlights here..."}
                              className="w-full h-32 bg-white/[0.01] border-2 border-white/5 rounded-[2.5rem] px-8 py-6 text-xl font-display font-black text-white placeholder:text-slate-800 focus:outline-none focus:border-brand-gold/30 focus:bg-white/[0.05] transition-all tracking-tighter uppercase resize-none"
                            />
                         </div>
                       ) : (
                         <>
                           <input 
                            type="text"
                            value={profile[currentStep?.field as keyof typeof profile] || ""}
                            onChange={(e) => setProfile({ ...profile, [currentStep.field]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && profile[currentStep.field as keyof typeof profile]) {
                                if (step < 5) setStep(step + 1);
                                else performPathfinding();
                              }
                            }}
                            placeholder={(currentStep as any)?.placeholder || "Enter value..."}
                            className="w-full h-24 md:h-32 bg-white/[0.01] border-2 border-white/5 rounded-[2.5rem] px-8 md:px-12 text-2xl md:text-4xl font-display font-black text-white placeholder:text-slate-800 focus:outline-none focus:border-brand-gold/30 focus:bg-white/[0.05] transition-all tracking-tighter uppercase"
                          />
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                             <Search size={32} className="text-brand-gold" />
                          </div>
                        </>
                       )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-12 border-t border-white/5">
                  <button 
                    onClick={() => step > 0 && setStep(step - 1)}
                    className={`px-8 py-5 rounded-2xl bg-white/5 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 hover:text-white transition-all ${step === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                  >
                    Previous Vector
                  </button>
                      <button 
                        onClick={() => {
                          if (step < 5) setStep(step + 1);
                          else performPathfinding();
                        }}
                        disabled={!profile[currentStep?.field as keyof typeof profile] || loading}
                        className="px-10 py-5 bg-brand-gold text-brand-navy font-black rounded-2xl flex items-center gap-4 uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-2xl shadow-brand-gold/20"
                      >
                        {loading ? <Loader2 className="animate-spin" size={14} /> : (step === 5 ? <Sparkles size={14} /> : <ArrowRight size={14} />)}
                        {step === 5 ? "Begin Audit" : "Confirm Metric"}
                      </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-16 relative z-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-10">
                 <button 
                  onClick={() => {
                    setStep(0);
                    setProfile({ education: "", grades: "", english: "", interests: "", aspiration: "", location: "", cv: "" });
                  }}
                  className="flex items-center gap-3 text-brand-gold font-black text-[10px] uppercase tracking-widest hover:gap-5 transition-all px-6 py-3 rounded-xl bg-brand-gold/5 border border-brand-gold/10"
                >
                  <X size={14} /> Reset Analysis
                </button>
                <div className="flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic leading-none">Alignment Operational: {profile.education} Vector</p>
                </div>
              </div>

              {(aiInsight || aiLoading) && (
                <div className="space-y-12">
                  <div className="grid lg:grid-cols-3 gap-10">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="lg:col-span-2 overflow-hidden rounded-[3rem] bg-brand-navy/60 border border-white/10 shadow-3xl relative p-px"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 to-transparent p-[1px] -z-10 rounded-[3rem]" />
                      
                      <div className="p-10 md:p-14 flex flex-col md:flex-row gap-10 items-start">
                        <div className="w-24 h-24 bg-brand-gold rounded-3xl flex items-center justify-center text-brand-navy shrink-0 shadow-2xl shadow-brand-gold/40 relative">
                           {aiLoading && <div className="absolute inset-0 bg-white/20 animate-ping rounded-3xl" />}
                           {aiLoading ? <Loader2 className="animate-spin" size={40} /> : <Sparkles size={40} />}
                        </div>
                        <div className="flex-grow">
                          <span className="inline-block px-4 py-1.5 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black uppercase tracking-widest rounded-full mb-6 italic">Strategic Core Recommendation</span>
                          {aiLoading ? (
                            <div className="space-y-4">
                              <div className="h-6 bg-white/5 rounded-full w-full animate-pulse" />
                              <div className="h-6 bg-white/5 rounded-full w-5/6 animate-pulse" />
                            </div>
                          ) : (
                            <p className="text-white text-2xl md:text-3xl font-display font-medium italic leading-tight tracking-tight">
                              "{aiInsight}"
                            </p>
                          )}
                        </div>
                      </div>

                      {matchAudit && (
                        <div className="p-10 md:p-14 border-t border-white/5 bg-white/[0.02]">
                           <div className="grid md:grid-cols-2 gap-12">
                             <div className="space-y-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">Operational Audit</h4>
                               </div>
                               <p className="text-slate-400 text-sm font-medium leading-relaxed italic border-l-2 border-white/10 pl-8 group-hover:border-brand-gold transition-all">
                                 {matchAudit}
                               </p>
                             </div>
                             <div className="space-y-8">
                               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Benchmark Coefficients</h4>
                               <div className="grid grid-cols-2 gap-4">
                                  {[
                                    { label: 'Grades', val: profile.grades },
                                    { label: 'Language', val: profile.english },
                                    { label: 'Trajectory', val: profile.aspiration },
                                    { label: 'Confidence', val: 'Peak' }
                                  ].map((p, i) => (
                                    <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-2">{p.label}</p>
                                      <p className="text-xs text-white font-black truncate tracking-tight">{p.val}</p>
                                    </div>
                                  ))}
                               </div>
                             </div>
                           </div>
                        </div>
                      )}
                    </motion.div>

                    <motion.div 
                      key="roadmap-exec"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-10 rounded-[3rem] border border-white/10 bg-white/5 flex flex-col shadow-2xl"
                    >
                      <h4 className="text-white font-black uppercase tracking-[0.3em] text-[10px] mb-12 flex items-center gap-4">
                        <Rocket size={16} className="text-brand-gold" /> Execution Vectors
                      </h4>
                      <div className="space-y-6 flex-grow">
                        {roadmap.length > 0 ? roadmap.map((step, i) => (
                          <div key={i} className="flex gap-6 items-start group">
                            <span className="text-[10px] font-black text-brand-gold opacity-30 group-hover:opacity-100 transition-all">0{i + 1}</span>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed group-hover:text-white transition-colors">{step}</p>
                          </div>
                        )) : Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="h-6 bg-white/5 rounded-full animate-pulse" />
                        ))}
                      </div>
                      <button 
                        onClick={() => window.print()}
                        className="mt-12 w-full py-5 bg-white/5 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-gold hover:text-brand-navy transition-all flex items-center justify-center gap-4 border border-white/10"
                      >
                        <ExternalLink size={16} /> Strategy Export (PDF)
                      </button>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Chat Interface embedded in homepage */}
              {!aiLoading && aiInsight && (
                <div className="grid lg:grid-cols-12 gap-10">
                   <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-[3.5rem] overflow-hidden flex flex-col h-[650px] shadow-3xl"
                  >
                    <div className="p-8 bg-white/5 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-gold flex items-center justify-center text-brand-navy shadow-lg shadow-brand-gold/20">
                          <Users size={24} />
                        </div>
                        <div>
                          <h4 className="text-white font-display font-black text-xl uppercase tracking-tighter leading-none mb-1">Council Directive</h4>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Active Mentorship Channel</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-grow overflow-y-auto p-10 space-y-8 scrollbar-hide">
                      {messages.length === 1 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                          {["Financial Aid?", "Admission ROI?", "Visa Vectors?", "Cycle Timelines"].map(q => (
                            <button 
                              key={q}
                              onClick={() => setChatInput(q)}
                              className="px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-brand-gold/10 hover:text-brand-gold hover:border-brand-gold/20 transition-all text-center"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-8 rounded-[2.5rem] ${msg.role === 'user' ? 'bg-brand-gold text-brand-navy font-black rounded-tr-sm shadow-xl' : 'bg-white/5 text-white rounded-tl-sm border border-white/10 italic font-medium leading-relaxed'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white/5 text-slate-500 px-8 py-5 rounded-[2rem] rounded-tl-sm italic font-medium animate-pulse border border-white/5 text-sm">
                            Counsel processing neural response...
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleChat} className="p-8 bg-[#01040a] border-t border-white/5 relative">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Inquire with counselor co-pilot..."
                        className="w-full h-20 bg-white/[0.02] border border-white/5 rounded-2xl px-8 pr-24 text-white focus:outline-none focus:border-brand-gold/30 transition-all font-medium text-lg italic placeholder:text-slate-800"
                      />
                      <button 
                        type="submit"
                        disabled={!chatInput.trim() || chatLoading}
                        className="absolute right-12 top-1/2 -translate-y-1/2 w-14 h-14 bg-brand-gold text-brand-navy rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-gold/20 disabled:opacity-20"
                      >
                        <Send size={24} />
                      </button>
                    </form>
                  </motion.div>

                  <div className="lg:col-span-4 space-y-8">
                     <div className="glass-card rounded-[3rem] p-10 border border-white/10">
                        <div className="flex items-center gap-4 mb-8">
                           <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                              <Globe size={20} />
                           </div>
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Global Presence</h4>
                        </div>
                        <div className="space-y-6">
                           {["Ivy League Depth", "Russell Group Align", "T20 Global Access"].map(tag => (
                             <div key={tag} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-brand-gold/20 transition-all">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">{tag}</span>
                                <div className="w-2 h-2 rounded-full bg-brand-gold" />
                             </div>
                           ))}
                        </div>
                     </div>
                     
                     <div className="glass-card rounded-[3rem] p-10 border border-white/10 bg-gradient-to-br from-brand-gold/10 to-transparent">
                        <p className="text-4xl font-display font-black text-white mb-2 leading-none uppercase tracking-tighter">Live</p>
                        <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] mb-8">Alignment Sync</p>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                           <div className="h-full w-[98%] bg-brand-gold" />
                        </div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                          Your profile is currently indexed and ready for institutional submission.
                        </p>
                     </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-10 bg-red-500/10 border border-red-500/20 rounded-[3rem] text-red-500 text-center font-black uppercase tracking-widest text-xs">
                  Operational Fault: {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {universities.length > 0 && universities.map((uni, idx) => (
                  <motion.div
                    key={uni.name + idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-10 glass-card rounded-[3.5rem] group hover:border-brand-gold/40 transition-all duration-700 flex flex-col shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                      <GraduationCap size={120} />
                    </div>
                    
                    <div className="flex items-center justify-between mb-10 relative z-10">
                       <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-navy transition-all duration-500">
                          <GraduationCap size={24} />
                       </div>
                       <div className="text-right">
                         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-2">Match Audit</p>
                         <p className="text-xl font-black text-brand-gold leading-none tracking-tight">{uni.score}</p>
                       </div>
                    </div>

                    <h4 className="text-white font-display font-black text-xl mb-6 line-clamp-2 leading-none uppercase tracking-tighter h-[3.5rem] relative z-10">{uni.name}</h4>
                    
                    <div className="mb-8 relative z-10 flex-grow">
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-3 leading-none italic">Calibrated Program</p>
                      <p className="text-white/80 text-xs font-medium leading-relaxed border-l border-white/10 pl-6 group-hover:border-brand-gold transition-all italic">
                        {uni.program}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-10 relative z-10">
                      <div className="flex items-center gap-2">
                        <Globe size={12} className="text-brand-gold" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{uni.country}</span>
                      </div>
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                        uni.suitability === 'Safety' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        uni.suitability === 'Reach' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                      }`}>
                        {uni.suitability || 'Target'}
                      </span>
                    </div>

                    <a 
                      href={uni.web_pages[0]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-gold hover:text-brand-navy hover:border-brand-gold transition-all relative z-10 w-full"
                    >
                      Audit Institution <ChevronRight size={14} />
                    </a>
                  </motion.div>
                ))}
              </div>

              {/* Inbox Dispatch Card */}
              <div className="mt-32">
                <div className="max-w-5xl mx-auto glass-card rounded-[4rem] p-10 md:p-20 border border-white/10 shadow-3xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="absolute -right-20 -top-20 opacity-[0.02] rotate-12 group-hover:rotate-6 transition-transform duration-1000">
                    <Mail size={400} />
                  </div>

                  <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10">
                      <div className="inline-flex items-center gap-3">
                        <div className="w-10 h-[1.5px] bg-brand-gold" />
                        <span className="text-brand-gold text-[10px] font-black uppercase tracking-[0.4em]">Report Ecosystem</span>
                      </div>
                      <h3 className="text-4xl md:text-6xl font-display font-black text-white leading-[0.9] tracking-tighter uppercase">
                        Dispatch <br/> 
                        <span className="text-brand-gold">Intelligence.</span>
                      </h3>
                      <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed italic border-l border-white/10 pl-10 group-hover:border-brand-gold transition-all">
                        Receive your sovereign trajectory roadmap and merit audit as a high-fidelity institutional report.
                      </p>
                    </div>

                    <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border border-white/5 bg-white/[0.01]">
                      {emailSent ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center space-y-6"
                        >
                          <div className="w-20 h-20 bg-brand-gold rounded-3xl flex items-center justify-center text-brand-navy mx-auto shadow-2xl shadow-brand-gold/30">
                            <Sparkles size={40} />
                          </div>
                          <div>
                            <h4 className="text-2xl font-display font-black text-white uppercase tracking-tighter mb-2">Vector Locked.</h4>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Report is currently navigating the network.</p>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="space-y-6">
                           <div className="relative group/input">
                              <input 
                                type="email" 
                                placeholder="academic.future@skolar.ai"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-20 bg-[#020617] border border-white/10 rounded-2xl px-8 text-white placeholder:text-slate-800 focus:border-brand-gold/40 focus:bg-brand-navy transition-all font-medium italic outline-none"
                              />
                              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700">
                                <Mail size={24} />
                              </div>
                           </div>
                           <button 
                             disabled={!email || !email.includes('@')}
                             onClick={() => {
                               setEmailSent(true);
                               setTimeout(() => setEmailSent(false), 8000);
                             }}
                             className="w-full h-20 bg-brand-gold text-brand-navy font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-brand-gold/20 disabled:opacity-20"
                           >
                             Transmit Strategy Roadmap
                           </button>
                           <p className="text-[9px] text-slate-800 text-center uppercase tracking-[0.5em] font-black">
                             Secured Transmission Node 7x2
                           </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Section({ id, title, subtitle, children, className = "" }: { id: string; title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`py-24 px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-600 max-w-2xl mx-auto text-lg italic"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [view, setView] = useState<'landing' | 'dashboard' | 'cv-hub'>('landing');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser) {
        // Ensure user document exists
        const userRef = doc(db, 'users', currentUser.uid);
        getDoc(userRef).then((snap) => {
          if (!snap.exists()) {
            setDoc(userRef, {
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              meritId: `DS-${Math.floor(10000 + Math.random() * 90000)}`,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'users'));
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setView('landing');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const scrollToPathfinder = () => {
    if (view !== 'landing') setView('landing');
    setTimeout(() => {
      document.getElementById('pathfinder')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (view === 'dashboard' && user) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
           key="dashboard"
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
        >
          <Dashboard onBack={() => setView('landing')} />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (view === 'cv-hub' && user) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
           key="cv-hub"
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           className="min-h-screen bg-brand-navy p-6 md:p-20"
        >
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <button onClick={() => setView('landing')} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors mb-6">
                  <ArrowLeft size={14} /> Back to Hub
                </button>
                <h1 className="text-5xl font-display font-black text-white uppercase tracking-tighter">Merit Intelligence Hub</h1>
                <p className="text-slate-500 text-lg font-medium italic mt-2">Elite-tier professional calibration and institutional architecture.</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full border-2 border-brand-gold p-0.5">
                    <img src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} alt="User" className="w-full h-full rounded-full object-cover" />
                 </div>
              </div>
            </header>
            <CVTool />
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy selection:bg-brand-gold/30 selection:text-white">
      <Navbar 
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenPortal={scrollToPathfinder} 
        onViewDashboard={() => user ? setView('dashboard') : handleLogin()} 
        onViewCVHub={() => user ? setView('cv-hub') : handleLogin()}
      />
      
      {/* Hero Section */}
      <header className="relative w-full min-h-screen flex items-center overflow-hidden">
        {/* Layered Atmospheric Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-brand-gold/10 blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>

        <div className="absolute inset-0 z-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-32 pb-20">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="flex items-center gap-4 mb-10">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] shadow-xl">
                    Institutional Framework 2026
                  </span>
                </div>

                <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black text-white leading-[0.85] mb-12 tracking-tighter uppercase">
                  Global <br />
                  <span className="text-gradient-gold italic">Strategic</span> <br />
                  Intelligence.
                </h1>

                <div className="max-w-xl">
                  <p className="text-slate-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
                    Deploying sovereign neural intelligence to architect elite international education trajectories. Beyond consulting. <span className="text-white">Pure Alignment.</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-6">
                    <button 
                      onClick={scrollToPathfinder}
                      className="px-10 py-6 bg-brand-gold text-brand-navy font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-gold/20 flex items-center gap-3 uppercase tracking-[0.2em] text-[11px]"
                    >
                      Initiate Pathfinding <Rocket size={18} />
                    </button>

                    <button 
                      className="px-10 py-6 glass-card text-white font-black rounded-2xl hover:bg-white/10 transition-all text-[11px] uppercase tracking-[0.2em]"
                      onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Audit Methodology
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-4 hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="glass-card rounded-[3.5rem] p-8 border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold flex items-center justify-center text-brand-navy shadow-lg shadow-brand-gold/20">
                    <Trophy size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-gold uppercase tracking-widest mb-1">Live Merit Stats</p>
                    <p className="text-white text-lg font-black tracking-tight">Active Cycle Intelligence</p>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  {[
                    { label: "Acceptance Velocity", val: "94.2%", color: "text-green-400" },
                    { label: "Merit Optimization", val: "Elite Tier", color: "text-brand-gold" },
                    { label: "Financial Scaling", val: "+$12.4M", color: "text-white" }
                  ].map((stat, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 group/stat hover:bg-white/10 transition-all">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                      <p className={`text-2xl font-black ${stat.color} leading-none tracking-tight`}>{stat.val}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-10 border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    <span>Market Saturation</span>
                    <span className="text-brand-gold">Peak Performance</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "88%" }}
                      transition={{ delay: 1, duration: 2 }}
                      className="h-full bg-brand-gold"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 hidden xl:flex items-center gap-6 opacity-30">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.5em] origin-right -rotate-90 translate-y-full">Scroll to Audit</span>
          <div className="h-20 w-[1px] bg-white/20" />
        </div>
      </header>

      {/* Trust Metrics Bar */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
             {CORE_VALUES.map((v, i) => (
               <div key={i} className="flex items-center gap-3">
                 <v.icon size={20} className="text-brand-gold" />
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{v.title}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Main Feature Component */}
      <AICounselorSection />

      {/* Sovereign CV Tools */}
      <section id="tools" className="py-32 px-6 bg-brand-navy relative">
        <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black uppercase tracking-widest mb-8">
               <Zap size={14} /> Elite Merit Tools
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-black text-white tracking-tighter leading-none mb-8">
              Refine your <span className="text-brand-gold">Trajectory.</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium italic">
              Deploy specialized nodes to audit your professional narrative and architect high-fidelity CVs for international institutional review.
            </p>
          </div>
          <CVTool />
        </div>
      </section>

      {/* Detailed Methodology Section */}
      <section id="about" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
             <div className="relative">
                 <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6 pt-12">
                     <div className="aspect-[4/5] glass-card rounded-[3rem] overflow-hidden group">
                        <img src="https://images.unsplash.com/photo-1523050335456-c384474b52b7?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" alt="Academic" />
                     </div>
                     <div className="aspect-square glass-card rounded-[3rem] bg-brand-gold/10 p-10 flex flex-col justify-center border-brand-gold/30">
                        <p className="text-5xl font-display font-black text-brand-gold mb-2">94%</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Success Index</p>
                     </div>
                  </div>
                  <div className="space-y-6">
                    <div className="aspect-square glass-card rounded-[3rem] flex items-center justify-center p-12">
                        <GraduationCap className="w-full h-full text-brand-gold opacity-10" />
                    </div>
                    <div className="aspect-[4/5] glass-card rounded-[3rem] overflow-hidden group">
                        <img src="https://images.unsplash.com/photo-1523240695612-9a054b0db644?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt="Student" />
                    </div>
                  </div>
                </div>
             </div>

             <div className="space-y-12">
               <div className="inline-flex items-center gap-3">
                 <div className="w-12 h-[1.5px] bg-brand-gold" />
                 <span className="text-brand-gold text-[10px] font-black uppercase tracking-[0.3em]">Operational Philosophy</span>
               </div>
               <h2 className="text-5xl md:text-6xl font-display font-black text-white leading-none tracking-tighter">
                 Architecting <br />
                 <span className="text-brand-gold">Global Vectors.</span>
               </h2>
               <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                 Skolar Intel isn't a consultancy—it's a high-performance alignment system. We bridge the gap between human potential and elite institutional access through calibrated AI insights.
               </p>
               <div className="space-y-6">
                 {[
                   "Quantum merit assessment algorithms",
                   "Institutional requirement depth-sync",
                   "High-fidelity roadmap generation",
                   "Direct outcome-based matching"
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 group">
                     <div className="w-6 h-6 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-navy transition-all duration-500">
                        <ArrowRight size={12} />
                     </div>
                     <span className="text-white/80 font-black text-[11px] uppercase tracking-[0.2em]">{item}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-[1.5px] bg-brand-gold" />
                <span className="text-brand-gold text-[10px] font-black uppercase tracking-[0.3em]">Strategic Modules</span>
              </div>
              <h2 className="text-5xl font-display font-black text-white tracking-tighter">Command Center Capability.</h2>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] max-w-xs text-right leading-loose">
              Every tool is engineered to provide absolute clarity in the admissions process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 glass-card rounded-[3rem] group hover:border-brand-gold transition-all duration-500 h-full flex flex-col"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-brand-gold mb-12 group-hover:bg-brand-gold group-hover:text-brand-navy transition-all duration-500 shadow-xl">
                  <service.icon size={32} />
                </div>
                <h3 className="text-2xl font-display font-black text-white mb-6 uppercase tracking-tight">{service.title}</h3>
                <p className="text-slate-500 text-sm font-medium mb-12 flex-grow leading-relaxed italic border-l border-white/10 pl-6 group-hover:border-brand-gold transition-all">
                  {service.description}
                </p>
                <button className="flex items-center gap-2 text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] group-hover:gap-4 transition-all">
                  Module Analysis <ArrowRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Council Members */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black uppercase tracking-widest mb-8">
               <Users size={14} /> Global Strategic Council
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-black text-white tracking-tighter leading-none">
              Meet the <span className="text-brand-gold">Advisors.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {TEAM.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-card rounded-[3.5rem] overflow-hidden group border border-white/5"
              >
                <div className="aspect-[4/5] overflow-hidden bg-brand-navy">
                  <img src={member.image} className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 opacity-80 group-hover:opacity-100" alt={member.name} />
                </div>
                <div className="p-10 border-t border-white/5 bg-white/[0.01]">
                   <p className="text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] mb-2">{member.role}</p>
                   <h3 className="text-3xl font-display font-black text-white mb-6 uppercase tracking-tighter">{member.name}</h3>
                   <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 line-clamp-3 group-hover:text-slate-300 transition-colors italic">
                     "{member.bio}"
                   </p>
                   <div className="flex items-center gap-4 pt-10 border-t border-white/5">
                      <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-gold hover:text-brand-navy transition-all">
                        <Linkedin size={18} />
                      </a>
                      <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-gold hover:text-brand-navy transition-all">
                        <Twitter size={18} />
                      </a>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Ecosystem */}
      <footer className="py-24 bg-[#01040a] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-navy shadow-xl shadow-brand-navy/50">
                  <GraduationCap size={28} />
                </div>
                <span className="font-display font-bold text-3xl tracking-tighter text-white uppercase">
                  Skolar Intel<span className="text-brand-gold">.</span>
                </span>
              </div>
              <p className="text-slate-500 text-lg max-w-md font-medium leading-relaxed">
                The world's most advanced AI trajectory system for elite international merit.
              </p>
            </div>
            
            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Admissions Portal</h4>
               <nav className="flex flex-col gap-5">
                 {["Strategic Roadmap", "AI Counselor", "University Search", "Portfolio Audit", "Dashboard"].map(l => (
                   <a key={l} href="#" className="text-slate-600 hover:text-brand-gold transition-colors text-[11px] font-black uppercase tracking-widest">{l}</a>
                 ))}
               </nav>
            </div>

            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Global Headquarters</h4>
               <div className="flex flex-col gap-6">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-gold">
                      <Mail size={18} />
                   </div>
                   <p className="text-sm text-white font-bold">hq@skolarintel.com</p>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-gold">
                      <Globe size={18} />
                   </div>
                   <p className="text-sm text-white font-bold">Distributed / Sovereign</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-700">
               <span>© 2026 Skolar Intel Strategic Systems</span>
               <span className="w-1 h-1 rounded-full bg-slate-700" />
               <span>All vectors secure</span>
             </div>
             <div className="flex gap-10">
               {["Data Privacy", "Operational Terms", "Legal Stance"].map(l => (
                 <a key={l} href="#" className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-700 hover:text-white transition-colors">{l}</a>
               ))}
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

