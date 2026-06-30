import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ChevronLeft, Send } from 'lucide-react';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-nunito p-5 md:p-10">
      <div className="max-w-2xl mx-auto mt-8">
        <Link to="/landing" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors text-sm font-semibold">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold">Contact Us</h1>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <p className="text-muted-foreground mb-8">
            Have questions, feedback, or need support? We'd love to hear from you. Fill out the form below or reach us directly at <a href="mailto:support@hustleinflow.com" className="text-primary hover:underline">support@hustleinflow.com</a>.
          </p>

          {sent ? (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Message Sent!</h3>
              <p className="text-muted-foreground">Thanks for reaching out. We'll get back to you as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-primary-foreground font-bold px-6 py-3.5 rounded-xl hover:bg-primary/90 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}