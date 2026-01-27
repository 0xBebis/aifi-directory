import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects } from '@/lib/data';
import UpdateForm from './UpdateForm';

// Generate static params for all projects
export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = projects.find(p => p.slug === params.slug);
  if (!project) {
    return { title: 'Update Company | AIFI' };
  }

  return {
    title: `Update ${project.name} | AIFI`,
    description: `Submit updates to ${project.name}'s listing in the AIFI directory. Help keep the AI + Finance directory accurate and up to date.`,
    robots: { index: false, follow: false },
  };
}

export default function UpdateProjectPage({ params }: { params: { slug: string } }) {
  const project = projects.find(p => p.slug === params.slug);

  if (!project) {
    notFound();
  }

  return <UpdateForm project={project} />;
}
