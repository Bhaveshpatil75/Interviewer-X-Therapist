'use client';

import { useRouter } from 'next/navigation';
import React, { Suspense } from 'react';
import { generateRoomId } from '@/lib/client-utils';
import styles from '../styles/Home.module.css';

function JoinMeeting() {
  const router = useRouter();

  const startMeeting = () => {
    router.push(`/rooms/${generateRoomId()}`);
  };

  return (
    <div className={styles.tabContent} style={{ alignItems: 'center', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--theme-teal-accent)', marginTop: 0 }}>Welcome</h2>
      <p style={{ margin: 0, opacity: 0.9 }}>
        Click below to join your interview session.
      </p>
      <button
        style={{ marginTop: '1.5rem', width: '100%', maxWidth: '300px' }}
        className="custom-button"
        onClick={startMeeting}
      >
        Join Interview
      </button>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <main className={styles.main} data-lk-theme="default">
        <div className="header">
          <h2>Interview Portal</h2>
        </div>
        <Suspense fallback="Loading">
          <JoinMeeting />
        </Suspense>
      </main>
      <footer data-lk-theme="default">
        Developed by <a href="https://github.com/Bhaveshpatil75" target="_blank" rel="noopener noreferrer">Bhavesh Patil</a>
      </footer>
    </>
  );
}
