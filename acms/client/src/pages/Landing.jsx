import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FolderOpen, Search, GraduationCap, ArrowRight, Star, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Storage',
    desc: 'Military-grade encryption and signed URLs ensure only you can access your documents. No unauthorized access, ever.',
    color: 'text-primary-400',
    bg: 'bg-primary-500/10',
    border: 'border-primary-500/20',
  },
  {
    icon: FolderOpen,
    title: 'Stay Organized',
    desc: 'Automatically categorize Certificates, Transcripts, ID Cards and more. Find any credential in seconds.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Search,
    title: 'Find Anything Fast',
    desc: 'Powerful full-text search and filters by category, date, and institution. Your vault, always at your fingertips.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
];

const stats = [
  { label: 'Documents Secured', value: '50,000+' },
  { label: 'Students Trust Us', value: '12,000+' },
  { label: 'Institutions', value: '200+' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-900 text-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold text-white">ACMS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">Log In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Glow background */}
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center animate-in">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 text-primary-400 text-sm font-medium mb-8">
            <Star size={14} className="fill-current" />
            <span>Trusted by students at Gauhati University</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6">
            Your academic credentials,{' '}
            <span className="text-gradient">secured in one place</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload, organize, and instantly retrieve your certificates, transcripts, and academic records.
            Protected by enterprise-grade cloud security.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base py-3 px-8 glow-primary">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base py-3 px-8">
              I already have an account
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-8 text-sm text-gray-500">
            <CheckCircle size={16} className="text-primary-500" />
            <span>No credit card required</span>
            <span className="mx-2">·</span>
            <CheckCircle size={16} className="text-primary-500" />
            <span>Secure & encrypted</span>
            <span className="mx-2">·</span>
            <CheckCircle size={16} className="text-primary-500" />
            <span>Free for students</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative max-w-3xl mx-auto mt-20 grid grid-cols-3 gap-px bg-surface-border rounded-2xl overflow-hidden border border-surface-border">
          {stats.map(({ label, value }) => (
            <div key={label} className="bg-dark-800 px-8 py-6 text-center">
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need for your credentials</h2>
            <p className="text-gray-400 text-lg">Built for students, by people who understand academic life.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg, border }) => (
              <div key={title} className={`card-hover border ${border}`}>
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon size={24} className={color} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 bg-dark-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">About ACMS</h2>
          <p className="text-gray-400 leading-relaxed text-lg">
            The Academic Credential Management System was developed by students at{' '}
            <span className="text-primary-400 font-medium">Gauhati University, Dept. of IT/CSE</span>.
            Our mission is to give every student a secure, organized digital vault for their academic journey.
          </p>
          <p className="text-gray-500 text-sm mt-6">
            Built by: Arnabmoy Sankriti · Kaushik Darji · Harish Gohain · Hemanta Konwar
          </p>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary-900/40 to-emerald-900/20 border border-primary-500/20 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to secure your credentials?</h2>
            <p className="text-gray-400 mb-8">Join thousands of students who trust ACMS with their academic records.</p>
            <Link to="/register" className="btn-primary text-base py-3 px-8 glow-primary">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-500 rounded-md flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span>ACMS © 2026 · Gauhati University</span>
          </div>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-white transition-colors">Log In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
