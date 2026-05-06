import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from '../App';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, deleteDoc, doc, setDoc } from 'firebase/firestore';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'Uploading' | 'Verified' | 'Error';
  size: string;
  createdAt?: any;
}

export default function DocumentUpload() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'documents'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      setDocuments(docsData);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'documents'));

    return () => unsubscribe();
  }, []);

  const handleFiles = async (files: FileList) => {
    if (!auth.currentUser) return;

    for (const file of Array.from(files)) {
      const docData = {
        userId: auth.currentUser.uid,
        name: file.name,
        type: file.type,
        status: 'Uploading',
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        createdAt: serverTimestamp(),
      };

      try {
        const docRef = await addDoc(collection(db, 'documents'), docData);
        
        // Simulate real upload verification
        setTimeout(async () => {
          await setDoc(doc(db, 'documents', docRef.id), { status: 'Verified' }, { merge: true });
        }, 2000);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'documents');
      }
    }
  };

  const removeDoc = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `documents/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${
          isDragging ? 'border-brand-gold bg-brand-gold/5' : 'border-white/10 hover:border-brand-gold/30 hover:bg-white/5'
        }`}
      >
        <input 
          type="file" 
          multiple 
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-2">
            <Upload size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Upload Merit Documents</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Drag and drop your transcripts, recommendation letters, or achievement certificates.
            </p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-8 py-3 bg-white text-brand-navy rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
          >
            Select Files
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading && <div className="text-center py-8 text-slate-500 italic">Syncing with Merit Vault...</div>}
        <AnimatePresence>
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-brand-gold shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="text-sm font-bold truncate">{doc.name}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{doc.size} • {doc.type}</p>
              </div>
              <div className="flex items-center gap-4">
                {doc.status === 'Uploading' && <Loader2 size={16} className="text-brand-gold animate-spin" />}
                {doc.status === 'Verified' && <CheckCircle2 size={16} className="text-green-500" />}
                {doc.status === 'Error' && <AlertCircle size={16} className="text-red-500" />}
                <button 
                  onClick={() => removeDoc(doc.id)}
                  className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {!loading && documents.length === 0 && (
          <div className="text-center py-12 text-slate-600 italic border border-white/5 rounded-[2rem] bg-white/[0.02]">
            No merit documents uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
