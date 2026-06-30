import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ChevronLeft } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground font-nunito p-5 md:p-10">
      <div className="max-w-3xl mx-auto mt-8">
        <Link to="/landing" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors text-sm font-semibold">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold">About HustleInFlow</h1>
        </div>
        <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
          <p>
            Welcome to HustleInFlow, the ultimate all-in-one modular SaaS platform designed to streamline your daily routines, enhance your productivity, and bring balance to your personal and professional life. We understand that modern life is incredibly fast-paced, which is why we created a single, unified ecosystem that replaces the fragmented array of apps you currently use. 
          </p>
          <p>
            <strong>What we do:</strong> HustleInFlow combines an intelligent expense tracker, a comprehensive smart planner, an intuitive trip organizer, and a seamless family hub into one accessible dashboard. Whether you are managing your monthly budget, scanning receipts, planning your next family vacation, organizing daily tasks, or simply looking to track your pets' schedules, our platform has you covered. With integrated AI assistance, the platform anticipates your needs, providing context-aware suggestions and automating repetitive tasks so you can focus on what truly matters.
          </p>
          <p>
            <strong>Who it is for:</strong> HustleInFlow is built for entrepreneurs, busy professionals, freelancers, and active families who need a centralized hub to manage the chaos of daily life. If you feel overwhelmed by juggling a dozen different applications to track your finances, coordinate schedules, and store important documents, this platform is specifically tailored for you. It empowers individuals who want to take control of their time and resources without dealing with steep learning curves or complicated interfaces.
          </p>
          <p>
            <strong>Who builds it:</strong> HustleInFlow is developed by a dedicated team of passionate engineers, designers, and productivity enthusiasts who believe that software should work for you, not the other way around. We are committed to continuous improvement, regularly rolling out new modules like our upcoming Hustlers Casino and Jobs Board, driven by direct feedback from our incredible user community. Join us as we build the future of personal management.
          </p>
        </div>
      </div>
    </div>
  );
}