import { notFound } from 'next/navigation';
import { projects } from '@/lib/data';
import UpdateForm from './UpdateForm';

// Generate static params for all projects
export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default function UpdateProjectPage({ params }: { params: { slug: string } }) {
  const project = projects.find(p => p.slug === params.slug);

  if (!project) {
    notFound();
  }

  return <UpdateForm project={project} />;
}
