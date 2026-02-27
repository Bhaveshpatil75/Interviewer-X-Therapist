'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState, useEffect } from 'react';
import { generateRoomId } from '@/lib/client-utils';
import styles from '../styles/Home.module.css';

function CandidateForm({ isTherapist }: { isTherapist: boolean }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Construct URL Params with DEFAULTS
    const params = new URLSearchParams();
    params.set('participantName', name);
    params.set('jobTitle', jobTitle.trim() || 'N/A');
    params.set('company', company.trim() || 'N/A');

    console.log('Starting session with params:', params.toString());

    const roomId = generateRoomId();
    router.push(`/rooms/${roomId}?${params.toString()}`);
  };

  return (
    <div className={styles.tabContent} style={{ maxWidth: '500px', width: '100%', textAlign: 'left' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', background: 'linear-gradient(to right, #00d2ff, #3a7bd5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          {isTherapist ? 'Dr. Hannibal Lecter (Therapist)' : 'Anika (Interviewer)'}
        </h2>
        <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.25rem' }}>by Bhavesh Patil</div>
      </div>
      <p style={{ opacity: 0.9, textAlign: 'center', marginBottom: '1.5rem', fontWeight: 'bold', color: 'white' }}>
        {isTherapist ? 'Please enter your details to start the session.' : 'Please enter your details to start the interview.'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name <span style={{ color: '#ff4444' }}>*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. John"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--lk-border-color)', background: 'var(--theme-grey-darker)', color: 'white' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            {isTherapist ? "What's on your mind? (Optional)" : "Job Role (Optional)"}
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder={isTherapist ? "e.g. Feeling anxious lately" : "e.g. HOD Crime Analytics"}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--lk-border-color)', background: 'var(--theme-grey-darker)', color: 'white' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            {isTherapist ? "Any specific goals? (Optional)" : "Company (Optional)"}
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder={isTherapist ? "e.g. Manage stress better" : "e.g. Vought International"}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--lk-border-color)', background: 'var(--theme-grey-darker)', color: 'white' }}
          />
        </div>

        <button type="submit" className="custom-button" style={{ marginTop: '1rem' }}>
          {isTherapist ? 'Start Session' : 'Start Interview'}
        </button>
      </form>
    </div>
  );
}

function JoinMeeting({ isTherapist }: { isTherapist: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const startMeeting = () => {
    // Forward existing params to the room
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    router.push(`/rooms/${generateRoomId()}?${params.toString()}`);
  };

  return (
    <div className={styles.tabContent} style={{ alignItems: 'center', textAlign: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', background: 'linear-gradient(to right, #00d2ff, #3a7bd5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          {isTherapist ? 'Dr. Hannibal Lecter (AI Therapist)' : 'Anika (AI Interviewer)'}
        </h2>
        <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.25rem' }}>by Bhavesh Patil</div>
      </div>
      <p style={{ margin: 0, opacity: 0.9 }}>
        Click below to join your {isTherapist ? 'session' : 'interview'}.
      </p>
      <button
        style={{ marginTop: '1.5rem', width: '100%', maxWidth: '300px' }}
        className="custom-button"
        onClick={startMeeting}
      >
        {isTherapist ? 'Join Session' : 'Join Interview'}
      </button>
    </div>
  );
}

function PageContent({ isTherapist }: { isTherapist: boolean }) {
  const searchParams = useSearchParams();
  const hasParticipantName = searchParams?.has('participantName');

  return hasParticipantName ? <JoinMeeting isTherapist={isTherapist} /> : <CandidateForm isTherapist={isTherapist} />;
}

const interviewerFeatures = [
  { title: '🤖 AI-Based Interview', desc: 'Intelligent interaction with context-aware AI agents.' },
  { title: '🎙️ Real-Time Voice', desc: 'Seamless, low-latency voice communication.' },
  { title: '📹 Video Enabled', desc: 'Full HD video support for immersive meetings.' },
  { title: '💻 Screen Sharing', desc: 'Easily share your work and presentations.' },
  { title: '💬 Interactive Chat', desc: 'Integrated chat for text-based collaboration.' },
  { title: '🎯 Customized to Role', desc: 'Interviews tailored to your specific Job Role & Company.' },
];

const therapistFeatures = [
  { title: '🧠 AI-Based Therapy', desc: 'Compassionate interaction with a context-aware AI therapist.' },
  { title: '🎙️ Real-Time Voice', desc: 'Seamless, low-latency voice communication.' },
  { title: '📹 Video Enabled', desc: 'Full HD video support for immersive sessions.' },
  { title: '🔒 Private & Secure', desc: 'Your sessions are completely private and confidential.' },
  { title: '💬 Interactive Chat', desc: 'Integrated chat for text-based expression.' },
  { title: '🎯 Personalized Care', desc: 'Therapy tailored to your specific needs and challenges.' },
];

function FeatureColumn({ items }: { items: typeof interviewerFeatures }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, minWidth: '280px' }}>
      {items.map((f, i) => (
        <div key={i} style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--lk-border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'left',
          transition: 'transform 0.2s',
          cursor: 'default'
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{f.title.split(' ')[0]}</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--theme-teal-accent)', fontSize: '1.1rem' }}>{f.title.substring(2)}</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7, lineHeight: '1.4' }}>{f.desc}</p>
        </div>
      ))}
    </div>
  );
}

function ContactInfo() {
  return (
    <div style={{ marginTop: '2rem', textAlign: 'center', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '500px', fontSize: '0.9rem' }}>

      <p style={{ margin: '0.5rem 0' }}>
        Email: <a href="mailto:bhaveshpatil7504@gmail.com" style={{ color: 'var(--theme-teal-light)', textDecoration: 'none' }}>bhaveshpatil7504@gmail.com</a>
      </p>
      <p style={{ margin: '0.5rem 0' }}>
        Mob: +91 7498503673
      </p>
      <p style={{ margin: '0.5rem 0' }}>
        <a href="https://github.com/Bhaveshpatil75" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--theme-teal-accent)', textDecoration: 'none' }}>
          Visit my GitHub
        </a>
      </p>
    </div>
  )
}

export default function Page() {
  const [isTherapist, setIsTherapist] = useState(false);

  useEffect(() => {
    setIsTherapist(process.env.NEXT_PUBLIC_APP_MODE === 'therapist');
  }, []);

  const features = isTherapist ? therapistFeatures : interviewerFeatures;
  const leftFeatures = features.slice(0, 3);
  const rightFeatures = features.slice(3, 6);

  return (
    <main className={styles.main} data-lk-theme="default" style={{ overflowX: 'hidden' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        maxWidth: '1400px',
        gap: '2rem',
        justifyContent: 'center',
        alignItems: 'start',
        paddingTop: '2rem'
      }}>
        {/* Left Column */}
        <div style={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', flexDirection: 'column' }}>
          <FeatureColumn items={leftFeatures} />
        </div>

        {/* Center Column */}
        <div style={{ flex: '0 1 500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <Suspense fallback={<div className={styles.tabContent}>Loading...</div>}>
            <PageContent isTherapist={isTherapist} />
          </Suspense>

          <ContactInfo />
        </div>

        {/* Right Column */}
        <div style={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', flexDirection: 'column' }}>
          <FeatureColumn items={rightFeatures} />
        </div>
      </div>
    </main>
  );
}

