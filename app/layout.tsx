import '../styles/globals.css';
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';

export async function generateMetadata(): Promise<Metadata> {
  const isTherapist = process.env.NEXT_PUBLIC_APP_MODE === 'therapist';

  return {
    title: {
      default: isTherapist ? 'AI Therapist by BP75' : 'AI Interviewer by BP75',
      template: '%s',
    },
    description: isTherapist ? 'Real-time AI Therapy Application.' : 'Real-time AI Interview Application.',
    twitter: {
      creator: '@livekitted',
      site: '@livekitted',
      card: 'summary_large_image',
    },
    openGraph: {
      url: 'https://meet.livekit.io',
      images: [
        {
          url: 'https://meet.livekit.io/images/livekit-meet-open-graph.png',
          width: 2000,
          height: 1000,
          type: 'image/png',
        },
      ],
      siteName: isTherapist ? 'AI Therapist by BP75' : 'AI Interviewer by BP75',
    },
    icons: {
      icon: '/bp75.png',
      apple: '/bp75.png',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#070707',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body data-lk-theme="default">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
