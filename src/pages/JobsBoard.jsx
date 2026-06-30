import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, Search, Building2, DollarSign, ExternalLink, Upload, FileText, X, CheckCircle } from 'lucide-react';
import Tier2Lock from '@/components/shared/Tier2Lock';
import Tier2Footer from '@/components/shared/Tier2Footer';
import Tier2Banner from '@/components/shared/Tier2Banner';
import PromoBanner from '@/components/shared/PromoBanner';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import FloatingParticles from '@/components/shared/FloatingParticles';
import GlassCard from '@/components/shared/GlassCard';

const JOBS = [
  {
    id: 1, title: 'Senior React Developer', company: 'TechFlow Inc.', location: 'Remote', salary: '$110k–$140k',
    type: 'Full-time', posted: '2h ago', logo: '⚡', tags: ['React', 'TypeScript', 'Node.js'],
    desc: 'Join our world-class engineering team building next-gen SaaS tools for businesses globally.',
  },
  {
    id: 2, title: 'UX/UI Designer', company: 'Nova Studio', location: 'Austin, TX', salary: '$85k–$105k',
    type: 'Full-time', posted: '5h ago', logo: '🎨', tags: ['Figma', 'Design Systems', 'Prototyping'],
    desc: 'Craft beautiful, user-first experiences for a fast-growing B2B platform.',
  },
  {
    id: 3, title: 'Data Scientist', company: 'Analytiq AI', location: 'New York, NY', salary: '$120k–$160k',
    type: 'Full-time', posted: '1d ago', logo: '🧠', tags: ['Python', 'ML', 'SQL'],
    desc: 'Drive data-informed decisions at scale in a high-growth AI startup.',
  },
  {
    id: 4, title: 'Content Creator', company: 'BrandWave', location: 'Remote', salary: '$45k–$65k',
    type: 'Part-time', posted: '1d ago', logo: '✍️', tags: ['Copywriting', 'Social Media', 'Video'],
    desc: 'Create compelling content that grows our brand presence across social channels.',
  },
  {
    id: 5, title: 'Project Manager', company: 'BuildRight Co.', location: 'Chicago, IL', salary: '$90k–$115k',
    type: 'Full-time', posted: '2d ago', logo: '📋', tags: ['Agile', 'Jira', 'Stakeholder Mgmt'],
    desc: 'Lead cross-functional teams to deliver software projects on time and on budget.',
  },
  {
    id: 6, title: 'DevOps Engineer', company: 'CloudNine Systems', location: 'Remote', salary: '$115k–$150k',
    type: 'Contract', posted: '3d ago', logo: '☁️', tags: ['AWS', 'Docker', 'CI/CD'],
    desc: 'Build and maintain our cloud infrastructure supporting millions of users.',
  },
];

const TYPE_FILTERS = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote'];

// Generate job search URLs for external sites
function getJobSearchUrls(title, location, country) {
  const encodedTitle = encodeURIComponent(title);
  const encodedLocation = encodeURIComponent(location || 'Remote');
  
  // Use Canadian Indeed if country is Canada
  const isCanada = country?.toLowerCase().includes('canada') || location?.toLowerCase().includes('canada');
  const indeedBase = isCanada ? 'https://ca.indeed.com/jobs' : 'https://www.indeed.com/jobs';
  
  return {
    indeed: `${indeedBase}?q=${encodedTitle}&l=${encodedLocation}`,
    linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}&location=${encodedLocation}`,
  };
}

export default function JobsBoard() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [tab, setTab] = useState('browse'); // 'browse', 'applications', or 'documents'
  const fileInputRef = useRef(null);
  const coverLetterInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Load stored resume/cover letter on mount
  const { data: storedDocs = [] } = useQuery({
    queryKey: ['storedDocuments'],
    queryFn: () => base44.entities.Document.filter({ category: 'resume_or_coverletter' }, '-uploaded_date'),
  });

  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const list = await base44.entities.UserSettings.list('-created_date', 1);
      return list[0] || {};
    },
  });

  // Calculate local area
  const userLocation = [settings?.city, settings?.province_state, settings?.country]
    .filter(Boolean)
    .join(', ') || null;

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append('resume', data.resume);
      if (data.coverLetter) formData.append('coverLetter', data.coverLetter);
      formData.append('jobTitle', data.jobTitle);
      formData.append('company', data.company);
      formData.append('notes', data.notes || '');

      const response = await fetch('/functions/submitJobApplication', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit application');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Application submitted! Check your email for confirmation.');
      setShowApplyForm(null);
      setResumeFile(null);
      setCoverLetterFile(null);
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit application');
    },
  });

  const handleFileSelect = (e, isCoverLetter = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isCoverLetter) {
        setCoverLetterFile(file);
      } else {
        setResumeFile(file);
      }
    }
  };

  const handleSubmitApplication = (job) => {
    if (!resumeFile) {
      toast.error('Please upload your resume');
      return;
    }
    submitMutation.mutate({
      resume: resumeFile,
      coverLetter: coverLetterFile,
      jobTitle: job.title,
      company: job.company,
      notes,
    });
  };

  // Dynamically inject user's location into job listings if they aren't explicitly remote
  const dynamicJobs = JOBS.map(job => ({
    ...job,
    location: job.location === 'Remote' ? 'Remote' : (userLocation || job.location)
  }));

  const filtered = dynamicJobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === 'All' || j.type === filter || (filter === 'Remote' && j.location === 'Remote');
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles count={20} color="bg-primary/15" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <Tier2Banner feature="Jobs Board" />
      <div className="px-6 pt-6 pb-12 max-w-3xl mx-auto relative z-10">
        {/* Promo Banner */}
        <PromoBanner variant="teal" />
        
        {/* Header with Glass Effect */}
        <GlassCard className="mb-6 p-5" gradient="from-primary/15 via-secondary/10 to-accent/15">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                💼 Jobs Board
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Discover your next career opportunity
              </p>
            </div>
            <Tier2Lock />
          </div>
        </GlassCard>

        {/* Tabs */}
        <div className="flex gap-2 bg-card border border-border rounded-xl p-1.5 mb-6">
          {['browse', 'documents'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
                ${tab === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t === 'browse' ? 'Browse Jobs' : 'My Documents'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, company, or skills..."
            className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2">
          {TYPE_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                ${filter === f 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Global Search Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <a
            href={getJobSearchUrls(search || 'jobs', userLocation, settings?.country).indeed}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#005A9E] hover:bg-[#004a80] text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm"
          >
            <Search className="w-5 h-5" /> Search Indeed {userLocation ? `in ${userLocation}` : ''}
          </a>
          <a
            href={getJobSearchUrls(search || 'jobs', userLocation, settings?.country).linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#0955a8] text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm"
          >
            <Search className="w-5 h-5" /> Search LinkedIn {userLocation ? `in ${userLocation}` : ''}
          </a>
        </div>

        {/* Stats Row with 3D Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { value: '247', label: 'Open Roles', color: 'text-primary', bg: 'from-primary/20 to-primary/5' },
            { value: '84', label: 'Companies', color: 'text-foreground', bg: 'from-secondary/20 to-secondary/5' },
            { value: '🌎', label: 'Remote First', color: 'text-accent', bg: 'from-accent/20 to-accent/5' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="relative bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-4 text-center overflow-hidden group hover:border-primary/40 transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                <p className={`text-3xl font-display ${stat.color} mb-1`}>{stat.value}</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {tab === 'browse' && filtered.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all duration-200"
              onClick={() => setExpanded(expanded === job.id ? null : job.id)}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <a
                    href={getJobSearchUrls(job.title, job.location, settings?.country).indeed}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0 hover:scale-105 transition-transform border border-border"
                    onClick={(e) => e.stopPropagation()}
                    title="Search on Indeed"
                  >
                    {job.logo}
                  </a>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <a
                          href={getJobSearchUrls(job.title, job.location).linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-base text-primary hover:underline truncate block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {job.title}
                        </a>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{job.company}</span>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{job.posted}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />{job.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <DollarSign className="w-3.5 h-3.5" />{job.salary}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />{job.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.tags.map(t => (
                    <span key={t} className="bg-muted text-xs font-semibold px-3 py-1 rounded-md text-foreground">{t}</span>
                  ))}
                </div>
              </div>
              {expanded === job.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border px-5 pb-5"
                >
                  <p className="text-sm text-muted-foreground mt-4 mb-4 leading-relaxed">{job.desc}</p>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <a
                        href={getJobSearchUrls(job.title, job.location, settings?.country).indeed}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-[#005A9E] hover:bg-[#004a80] text-white text-sm font-semibold py-3 rounded-lg transition-all shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4" /> Find on Indeed
                      </a>
                      <a
                        href={getJobSearchUrls(job.title, job.location, settings?.country).linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#0955a8] text-white text-sm font-semibold py-3 rounded-lg transition-all shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4" /> Find on LinkedIn
                      </a>
                    </div>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-lg transition-all"
                      onClick={() => setShowApplyForm(job.id)}
                    >
                      <Upload className="w-4 h-4 mr-2" /> Submit Application
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Documents Tab */}
        {tab === 'documents' && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="text-sm font-bold text-foreground mb-2">📄 Stored Documents</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Upload your resume and cover letter once, then use them for quick applications
              </p>
              
              <div className="space-y-3">
                {/* Resume Section */}
                <div className="border border-border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">Resume</span>
                    </div>
                    {resumeFile && (
                      <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Uploaded
                      </span>
                    )}
                  </div>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${resumeFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {resumeFile ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs font-bold">{resumeFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Upload className="w-4 h-4" />
                        <span className="text-xs">Click to upload resume</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cover Letter Section */}
                <div className="border border-border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold text-foreground">Cover Letter</span>
                    </div>
                    {coverLetterFile && (
                      <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Uploaded
                      </span>
                    )}
                  </div>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${coverLetterFile ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
                    onClick={() => coverLetterInputRef.current?.click()}
                  >
                    {coverLetterFile ? (
                      <div className="flex items-center justify-center gap-2 text-accent">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs font-bold">{coverLetterFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Upload className="w-4 h-4" />
                        <span className="text-xs">Click to upload cover letter (optional)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground mt-4 text-center">
                Your documents are stored securely and ready for quick applications
              </p>
            </div>
          </div>
        )}

        {/* Application Form Modal */}
        {showApplyForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card rounded-t-2xl">
                <h3 className="font-bold text-foreground">Submit Application</h3>
                <button onClick={() => setShowApplyForm(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {(() => {
                  const job = JOBS.find(j => j.id === showApplyForm);
                  return job ? (
                    <>
                      <div className="bg-muted rounded-xl p-3">
                        <p className="text-sm font-bold text-foreground">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.company} • {job.location}</p>
                      </div>

                      {/* Resume Upload */}
                      <div>
                        <label className="text-xs font-bold text-foreground mb-2 block">
                          Resume <span className="text-destructive">*</span>
                        </label>
                        <div 
                          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${resumeFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, false)}
                          />
                          {resumeFile ? (
                            <div className="flex items-center justify-center gap-2 text-primary">
                              <FileText className="w-5 h-5" />
                              <span className="text-xs font-bold">{resumeFile.name}</span>
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                              <p className="text-xs text-muted-foreground">Click to upload PDF or DOC</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Cover Letter Upload */}
                      <div>
                        <label className="text-xs font-bold text-foreground mb-2 block">
                          Cover Letter <span className="text-muted-foreground">(optional)</span>
                        </label>
                        <div 
                          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${coverLetterFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                          onClick={() => coverLetterInputRef.current?.click()}
                        >
                          <input
                            ref={coverLetterInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, true)}
                          />
                          {coverLetterFile ? (
                            <div className="flex items-center justify-center gap-2 text-primary">
                              <FileText className="w-5 h-5" />
                              <span className="text-xs font-bold">{coverLetterFile.name}</span>
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                              <p className="text-xs text-muted-foreground">Click to upload (optional)</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="text-xs font-bold text-foreground mb-2 block">
                          Additional Notes
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any additional info you'd like to include..."
                          rows={3}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl"
                        onClick={() => handleSubmitApplication(job)}
                        disabled={submitMutation.isPending || !resumeFile}
                      >
                        {submitMutation.isPending ? (
                          <>Submitting...</>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" /> Submit Application
                          </>
                        )}
                      </Button>

                      <p className="text-[10px] text-muted-foreground text-center">
                        You'll receive a confirmation email once submitted
                      </p>
                    </>
                  ) : null;
                })()}
              </div>
            </motion.div>
          </div>
        )}

        <Tier2Footer moduleName="Jobs Board" />
      </div>
    </div>
  );
}