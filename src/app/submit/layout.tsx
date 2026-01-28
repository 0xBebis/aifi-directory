import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit a Company | AIFI Map',
  description: 'Submit an AI + Finance company to the AIFI Map directory. Help grow the most comprehensive index of companies building at the intersection of artificial intelligence and financial services.',
  openGraph: {
    title: 'Submit a Company | AIFI Map',
    description: 'Submit an AI + Finance company to the AIFI Map directory. Help grow the most comprehensive index of companies at the intersection of AI and finance.',
    type: 'website',
    siteName: 'AIFI Map',
  },
  twitter: {
    card: 'summary',
    title: 'Submit a Company | AIFI Map',
    description: 'Submit an AI + Finance company to the AIFI Map directory.',
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
