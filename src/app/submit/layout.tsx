import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit a Company | AIFI',
  description: 'Submit an AI + Finance company to the AIFI directory. Help grow the most comprehensive index of companies building at the intersection of artificial intelligence and financial services.',
  openGraph: {
    title: 'Submit a Company | AIFI',
    description: 'Submit an AI + Finance company to the AIFI directory. Help grow the most comprehensive index of companies at the intersection of AI and finance.',
    type: 'website',
    siteName: 'AIFI',
  },
  twitter: {
    card: 'summary',
    title: 'Submit a Company | AIFI',
    description: 'Submit an AI + Finance company to the AIFI directory.',
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
