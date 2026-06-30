import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle2, Clock, Mail, Trash2, ExternalLink, Plus, Download, Copy, Sparkles, Briefcase, GraduationCap, Code } from 'lucide-react';
import Tier2Banner from '@/components/shared/Tier2Banner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JobApplications() {
  const [activeView, setActiveView] = useState('applications'); // applications, resume_builder
  const [copied, setCopied] = useState(false);

  // Resume Form Local State
  const [fullName, setFullName] = useState('Alex Steinhauer');
  const [profileTitle, setProfileTitle] = useState('Full-Stack Developer & Operations Specialist');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('• Designed & deployed full-stack mobile systems featuring customized real-time AI capabilities.\n• Automated GitHub Actions workflows, migrating repository clusters to secure cloud environments.\n• Managed regional road infrastructure operations, balancing asset allocation and logistics protocols.');
  const [skills, setSkills] = useState('React, JavaScript, Next.js, AI Integration, Node.js, Git, Cloud Infrastructure, Operations Management');

  // Load applications data safely using your core configuration query
  const { data: applications = [], isLoading, refetch } = useQuery({
    queryKey: ['jobApplications'],
    queryFn: async () => {
      const res = await base44.entities.JobApplications?.list({});
      return res || [];
    }
  });

  const handleCopyForLinkedIn = () => {
    const profileBlock = `
💥 ${fullName} 💥
${profileTitle}

📍 Contact: ${email} | ${phone}
🚀 Core Expertise: ${skills}

Professional Breakdown:
${experience}
    `.trim();
    
    navigator.clipboard.writeText(profileBlock);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadATSResume = () => {
    const resumeText = `
${fullName.toUpperCase()}
${profileTitle}
${email} | ${phone}

[CORE SKILLS]
${skills}

[PROFESSIONAL RECONNAISSANCE & EXPERIENCE]
${experience}
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([resumeText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${fullName.replace(/\s+/g, '_')}_ATS_Resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-xs font-black tracking-widest">
        LOADING CORE ENGINE STREAMS...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-neutral-950 p-4 pb-24">
      {/* Premium Hub Layout Header */}
      <div className="mb-6">
        <p className="text-xs font-black tracking-widest text-purple-500 uppercase">CAREER RESOURCE</p>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase mt-0.5">APPLICATION SUITE</h1>
      </div>

      <Tier2Banner />

      {/* Segment Workspace Toggles */}
      <div className="grid grid-cols-2 gap-2 bg-neutral-900/40 p-1 border border-neutral-800/80 rounded-xl mb-6">
        <button 
          onClick={() => setActiveView('applications')}
          className={`h-10 text-xs font-black tracking-wider uppercase rounded-lg transition-all ${
            activeView === 'applications' ? 'bg-neutral-800 text-white shadow-md' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Trackers
        </button>
        <button 
          onClick={() => setActiveView('resume_builder')}
          className={`h-10 text-xs font-black tracking-wider uppercase rounded-lg transition-all ${
            activeView === 'resume_builder' ? 'bg-neutral-800 text-white shadow-md' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Resume & Profiles
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'applications' ? (
          <motion.div key="apps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Stats Summary Panel */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-xl p-3 text-center">
                <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">Total</span>
                <p className="text-lg font-black text-white mt-1">{applications.length}</p>
              </div>
              <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-xl p-3 text-center">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Applied</span>
                <p className="text-lg font-black text-blue-400 mt-1">
                  {applications.filter(a => a.status === 'Applied' || !a.status).length}
                </p>
              </div>
              <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-xl p-3 text-center">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Interviews</span>
                <p className="text-lg font-black text-amber-400 mt-1">
                  {applications.filter(a => a.status === 'Interviewing').length}
                </p>
              </div>
            </div>

            {/* List Pipeline view */}
            <div className="space-y-2">
              {applications.length === 0 ? (
                <div className="p-8 text-center bg-neutral-900/10 border border-neutral-900 rounded-xl text-xs text-neutral-500 font-medium">
                  No active tracking targets loaded. Initialize records in Jobs Board.
                </div>
              ) : (
                [...applications].reverse().map((app) => (
                  <div key={app.id} className="bg-neutral-900/40 border border-neutral-800/40 backdrop-blur-xl rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-black text-white tracking-tight">{app.role}</h4>
                      <p className="text-xs text-neutral-400 font-bold mt-0.5">{app.company} <span className="text-neutral-600 px-1">•</span> {app.applied_date}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                      app.status === 'Interviewing' ? 'bg-amber-500/10 text-amber-400 border-amber-900/40' : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                    }`}>
                      {app.status || 'Applied'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Professional Streamlined Input Cards */}
            <div className="bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl rounded-2xl p-4 space-y-4 shadow-xl">
              <h3 className="text-xs font-black tracking-widest text-neutral-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Core Profile Metadata
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Full Identity</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-neutral-950 border-neutral-800 text-xs h-10 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Target Professional Headline</label>
                  <Input value={profileTitle} onChange={(e) => setProfileTitle(e.target.value)} className="bg-neutral-950 border-neutral-800 text-xs h-10 mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Secure Email</label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" className="bg-neutral-950 border-neutral-800 text-xs h-10 mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Comms Line</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (780) 000-0000" className="bg-neutral-950 border-neutral-800 text-xs h-10 mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Skills Array (Comma Separated)</label>
                  <Input value={skills} onChange={(e) => setSkills(e.target.value)} className="bg-neutral-950 border-neutral-800 text-xs h-10 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Target Experience Protocols</label>
                  <textarea 
                    value={experience} 
                    onChange={(e) => setExperience(e.target.value)}
                    rows={5}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 mt-1 focus:outline-none focus:border-purple-500/50 leading-relaxed font-semibold font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Premium Pipeline Export Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleCopyForLinkedIn} 
                variant="outline" 
                className="h-12 border-neutral-800/80 bg-neutral-900/20 rounded-xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4 text-purple-400" /> {copied ? "COPIED HUB!" : "COPY LINKEDIN"}
              </Button>
              <Button 
                onClick={handleDownloadATSResume}
                className="h-12 bg-purple-600 hover:bg-purple-700 rounded-xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> DOWNLOAD ATS PDF/TXT
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
