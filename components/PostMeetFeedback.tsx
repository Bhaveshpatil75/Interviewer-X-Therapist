'use client';

import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function PostMeetFeedback() {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, message }),
            });
            if (res.ok) {
                setSubmitted(true);
            } else {
                alert('Failed to submit feedback. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className={styles.tabContent} style={{ textAlign: 'center', maxWidth: '500px' }}>
                <h2 style={{ color: 'var(--theme-teal-accent)' }}>Thank you!</h2>
                <p>Bhavesh will appreciate your kind words.</p>
                <p>We will contact you for further updates.</p>
                <p>You can close this window now.</p>
            </div>
        );
    }

    return (
        <div className={styles.tabContent} style={{ maxWidth: '600px', width: '100%' }}>
            <h2 style={{ color: 'var(--theme-teal-accent)', marginTop: 0 }}>Your interview is over.</h2>
            <p>We will contact you for further updates. You can close this window now.</p>

            <div style={{ marginBlock: '1rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Feedback</h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Bhavesh would appreciate a word from you.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid var(--lk-border-color)',
                            background: 'var(--theme-grey-darker)',
                            color: 'white'
                        }}
                    />
                    <textarea
                        placeholder="Your Feedback"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={4}
                        style={{
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid var(--lk-border-color)',
                            background: 'var(--theme-grey-darker)',
                            color: 'white',
                            fontFamily: 'inherit'
                        }}
                    />
                    <button type="submit" className="custom-button" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--lk-border-color)', paddingTop: '1rem', fontSize: '0.9rem' }}>
                <p style={{ margin: '0.5rem 0' }}>
                    Developed by <strong>Bhavesh Patil</strong>
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                    <a href="https://github.com/Bhaveshpatil75" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--theme-teal-accent)' }}>
                        Visit my GitHub
                    </a>
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                    Email: <a href="mailto:bhaveshpatil7504@gmail.com" style={{ color: 'var(--theme-teal-light)' }}>bhaveshpatil7504@gmail.com</a>
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                    Mob: +91 7498503673
                </p>
            </div>
        </div>
    );
}
