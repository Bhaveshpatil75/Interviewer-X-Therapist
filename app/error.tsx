'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: '2rem',
                backgroundColor: '#121212',
                color: '#ffffff',
                textAlign: 'center',
                fontFamily: 'system-ui, sans-serif',
            }}
        >
            <h2 style={{ color: '#ff4444', marginBottom: '1rem' }}>Something went wrong!</h2>
            <p style={{ marginBottom: '2rem', maxWidth: '600px', opacity: 0.8 }}>
                We encountered an unexpected error. Please try again later or contact support if the issue persists.
            </p>

            <button
                onClick={() => reset()}
                style={{
                    backgroundColor: '#00897b',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    marginBottom: '3rem',
                }}
            >
                Try again
            </button>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', width: '100%', maxWidth: '400px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Report this issue to:</p>
                <p style={{ margin: '0.5rem 0' }}>Bhavesh Patil</p>
                <p style={{ margin: '0.5rem 0' }}>
                    <a href="mailto:bhaveshpatil7504@gmail.com" style={{ color: '#4db6ac', textDecoration: 'none' }}>
                        bhaveshpatil7504@gmail.com
                    </a>
                </p>
                <p style={{ margin: '0.5rem 0' }}>+91 7498503673</p>
                <p style={{ marginTop: '1rem' }}>
                    <a href="https://github.com/Bhaveshpatil75" target="_blank" rel="noopener noreferrer" style={{ color: '#1de9b6' }}>
                        Visit GitHub profile
                    </a>
                </p>
            </div>
        </div>
    );
}
