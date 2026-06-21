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


        </div>
    );
}
