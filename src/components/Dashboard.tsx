import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  FileText, 
  GraduationCap, 
  LayoutDashboard, 
  MessageSquare, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Settings, 
  Star, 
  Trophy, 
  Users,
  X,
  User,
  Upload
} from 'lucide-react';
import { motion } from 'motion/react';
import DocumentUpload from './DocumentUpload';
import CVTool from './CVTool';
import { db, auth, handleFirestoreError, OperationType } from '../App';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

interface Application {
  id: string;
  university: string;
  program: string;
  status: 'Draft'|'Submitted'|'Under Review'|'Accepted'|'Waitlisted'|'Rejected';
  deadline: string;
  progress: number;
}

interface Scholarship {
  id: string;
  name: string;
  amount: string;
  deadline: string;
  match: number;
}

interface Resource {
  id: string;
  title: string;
  type: string;
  size: string;
  category: string;
}

const SCHOLARSHIPS: Scholarship[] = [
  { id: '1', name: 'Global Excellence Award', amount: '$25,000', deadline: 'March 2026', match: 98 },
  { id: '2', name: 'STEM Innovation Grant', amount: 'Full Tuition', deadline: 'April 2026', match: 92 },
  { id: '3', name: 'Tech Future Leaders Scholarship', amount: '$10,000', deadline: 'June 2026', match: 85 },
];

const INITIAL_RESOURCES: Resource[] = [
  { id: '1', title: "Ivy League Essay Guide 2026", type: "PDF Guide", size: "2.4 MB", category: "Guides" },
  { id: '2', title: "Financial Aid Mastery Course", type: "Video Class", size: "12 mins", category: "Finance" },
  { id: '3', title: "Visa Interview Checklist", type: "Interactive", size: "15 items", category: "Visa" },
  { id: '4', title: "Top 50 Research Unis", type: "Data Sheet", size: "Sheet", category: "Research" },
];

export default function Dashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'scholarships' | 'mentors' | 'documents' | 'profile' | 'cv'>('overview');
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [categories, setCategories] = useState<string[]>(["All", "Guides", "Finance", "Visa", "Research"]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch Profile
    const pUnsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snap) => {
      setUserProfile(snap.data());
    });

    // Fetch Applications
    const q = query(collection(db, 'applications'), where('userId', '==', auth.currentUser.uid));
    const aUnsub = onSnapshot(q, (snap) => {
      const apps = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Application[];
      setApplications(apps);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'applications'));

    return () => { pUnsub(); aUnsub(); };
  }, []);

  const handleAddApplication = async () => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'applications'), {
        userId: auth.currentUser.uid,
        university: 'New Institution',
        program: 'Select Program',
        status: 'Draft',
        deadline: 'TBD',
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'applications');
    }
  };

  const filteredResources = activeCategory === "All" 
    ? resources 
    : resources.filter(r => r.category === activeCategory);

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories([...categories, newCategoryName.trim()]);
      setNewCategoryName("");
      setShowAddCategory(false);
    }
  };

  const displayName = userProfile?.displayName || auth.currentUser?.displayName?.split(' ')[0] || 'Scholar';
  const meritStanding = userProfile?.grades || 'Not yet audited';

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-white/5 bg-brand-navy flex flex-col p-4 z-20">
        <div className="flex items-center gap-3 mb-12 lg:px-4">
          <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center text-brand-navy shrink-0">
            <GraduationCap size={24} />
          </div>
          <span className="hidden lg:block font-black text-xl tracking-tighter">SKOLAR INTEL <span className="text-brand-gold italic">PRO</span></span>
        </div>

        <nav className="space-y-2 flex-grow">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'applications', icon: FileText, label: 'Applications' },
            { id: 'scholarships', icon: Trophy, label: 'Scholarships' },
            { id: 'documents', icon: Upload, label: 'Documents' },
            { id: 'cv', icon: FileText, label: 'CV Intelligence' },
            { id: 'mentors', icon: Users, label: 'Mentorship' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                activeTab === item.id 
                ? 'bg-brand-gold text-brand-navy font-bold' 
                : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={22} />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="space-y-2 pt-4 border-t border-white/5">
          <button onClick={onBack} className="w-full flex items-center gap-4 p-4 text-slate-500 hover:text-white transition-colors">
            <LayoutDashboard size={22} />
            <span className="hidden lg:block">Return Home</span>
          </button>
          <button className="w-full flex items-center gap-4 p-4 text-slate-500 hover:text-white transition-colors">
            <Settings size={22} />
            <span className="hidden lg:block">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto h-screen bg-slate-950 p-6 lg:p-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2">Student Portal</h1>
            <p className="text-slate-400">Welcome back, {displayName}. Your merit profile is {meritStanding} complete for target awards.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-brand-gold/30 w-64"
              />
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-brand-gold p-0.5">
              <img src={auth.currentUser?.photoURL || `https://i.pravatar.cc/150?u=${auth.currentUser?.uid}`} alt="User" className="w-full h-full rounded-full object-cover" />
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Applications */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <FileText className="text-brand-gold" size={20} />
                    My Applications
                  </h2>
                  <button className="text-xs font-bold uppercase tracking-widest text-brand-gold hover:underline">View All</button>
                </div>

                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="p-6 bg-brand-navy/50 border border-white/5 rounded-3xl group hover:border-brand-gold/30 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-grow">
                          <h3 className="font-bold text-lg mb-1">{app.university}</h3>
                          <p className="text-slate-500 text-sm">{app.program}</p>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full ${
                              app.status === 'Accepted' ? 'bg-green-500/10 text-green-500' :
                              app.status === 'Draft' ? 'bg-slate-500/10 text-slate-500' :
                              'bg-brand-gold/10 text-brand-gold'
                            }`}>
                              {app.status}
                            </span>
                            <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase tracking-tighter">Deadline: {app.deadline}</p>
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer">
                            <MoreHorizontal size={20} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center gap-4">
                        <div className="flex-grow h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${app.progress}%` }}
                            className="h-full bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-brand-gold tabular-nums">{app.progress}%</span>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={handleAddApplication}
                    className="w-full py-6 border-2 border-dashed border-white/5 rounded-3xl text-slate-600 hover:text-brand-gold hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all flex items-center justify-center gap-3 font-bold group"
                  >
                    <Plus size={20} className="group-hover:scale-125 transition-transform" />
                    New Application
                  </button>
                </div>
              </section>

              {/* Application Stages Visualization */}
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { label: 'Completed', count: 12, icon: CheckCircle2, color: 'text-green-500' },
                  { label: 'In Progress', count: 4, icon: Clock, color: 'text-brand-gold' },
                  { label: 'Pending Docs', count: 2, icon: BookOpen, color: 'text-slate-500' },
                ].map((stat, i) => (
                  <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between">
                     <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <h4 className="text-3xl font-black">{stat.count}</h4>
                     </div>
                     <stat.icon className={stat.color} size={32} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Scholarship Matches & Mentors */}
            <div className="space-y-8">
              <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <Trophy className="text-brand-gold" size={20} />
                  Target Awards
                </h2>
                <div className="space-y-4">
                  {SCHOLARSHIPS.map((scholarship) => (
                    <div key={scholarship.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/[0.08] transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold font-black text-xs">
                          {scholarship.match}%
                        </div>
                        <button className="text-slate-500 hover:text-brand-gold transition-colors">
                          <Star size={18} />
                        </button>
                      </div>
                      <h4 className="font-bold text-sm mb-1">{scholarship.name}</h4>
                      <div className="flex items-center justify-between">
                        <p className="text-brand-gold font-bold text-lg">{scholarship.amount}</p>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">{scholarship.deadline}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-4 bg-brand-navy text-white rounded-2xl font-bold text-xs uppercase tracking-widest border border-white/10 hover:border-brand-gold transition-all">
                  Search Database
                </button>
              </section>

              <section className="bg-gradient-to-br from-brand-gold/20 to-brand-navy/50 border border-brand-gold/20 rounded-[2.5rem] p-8">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <Users className="text-brand-gold" size={20} />
                  Counselor Sync
                </h2>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl mb-6">
                  <img src="https://i.pravatar.cc/100?u=mentor" alt="Mentor" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-grow">
                    <h4 className="font-bold text-sm">Dr. Sarah Jenkins</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Merit Strategy Lead</p>
                  </div>
                  <div className="relative">
                    <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-brand-navy rounded-full" />
                    <MessageSquare size={20} className="text-brand-gold" />
                  </div>
                </div>
                <button className="w-full py-4 bg-brand-gold text-brand-navy rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-gold/20 hover:brightness-110 transition-all">
                  Sync Now
                </button>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="max-w-4xl">
            <h2 className="text-3xl font-black mb-8">Document Vault</h2>
            <DocumentUpload />
          </div>
        )}

        {activeTab === 'cv' && (
          <div className="max-w-6xl">
            <h2 className="text-3xl font-black mb-8">CV Intelligence Node</h2>
            <CVTool />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-4xl space-y-8">
            <h2 className="text-3xl font-black">Student Profile</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">Full Name</label>
                  <p className="text-xl font-bold">{userProfile?.displayName || auth.currentUser?.displayName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">Email Address</label>
                  <p className="text-xl font-bold">{userProfile?.email || auth.currentUser?.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">Merit Standing</label>
                  <p className="text-xl font-bold text-brand-gold uppercase tracking-tighter">{meritStanding}</p>
                </div>
              </div>
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                 <div className="w-24 h-24 rounded-full border-4 border-brand-gold mb-4 p-1">
                    <img src={auth.currentUser?.photoURL || `https://i.pravatar.cc/150?u=${auth.currentUser?.uid}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
                 </div>
                 <h3 className="text-xl font-bold">{userProfile?.displayName || auth.currentUser?.displayName}</h3>
                 <p className="text-slate-500 text-sm mb-6 uppercase tracking-widest font-bold">Verified Merit ID: #{userProfile?.meritId}</p>
                 <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Edit Avatar</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-8">
             <h2 className="text-3xl font-black">All Applications</h2>
             <div className="grid gap-4">
                {applications.map(app => (
                   <div key={app.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:border-brand-gold/30 transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-brand-gold">
                               <GraduationCap size={32} />
                            </div>
                            <div>
                               <h3 className="text-2xl font-black mb-1">{app.university}</h3>
                               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{app.program}</p>
                            </div>
                         </div>
                         <div className="text-right">
                             <div className={`inline-block px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                app.status === 'Accepted' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                             }`}>
                                {app.status}
                             </div>
                             <p className="text-xs text-slate-600 mt-2 font-bold uppercase tracking-tighter">ID: #APP-{app.id.substring(0, 5)}</p>
                         </div>
                      </div>
                   </div>
                ))}
                {applications.length === 0 && (
                  <div className="text-center py-12 text-slate-600 italic border border-white/5 rounded-[2.5rem] bg-white/[0.02]">
                    No applications initiated yet.
                  </div>
                )}
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
