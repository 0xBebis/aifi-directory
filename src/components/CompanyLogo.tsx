import { Project, AIType, AI_TYPE_COLORS } from '@/types';

interface CompanyLogoProps {
  project: Pick<Project, 'name' | 'logo' | 'ai_types'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: { container: 'w-9 h-9 rounded-lg', text: 'text-sm', padding: 'p-1' },
  md: { container: 'w-12 h-12 rounded-lg', text: 'text-lg', padding: 'p-1.5' },
  lg: { container: 'w-16 h-16 sm:w-18 sm:h-18 rounded-xl', text: 'text-2xl', padding: 'p-2' },
};

export default function CompanyLogo({ project, size = 'md', className = '' }: CompanyLogoProps) {
  const aiTypeColor = project.ai_types?.[0] ? AI_TYPE_COLORS[project.ai_types[0]] : null;
  const accentColor = aiTypeColor || '#0d9488';
  const s = sizeClasses[size];

  if (project.logo) {
    return (
      <div className={`${s.container} ${s.padding} bg-white flex items-center justify-center shrink-0 border border-border/20 overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.logo}
          alt={project.name}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${s.container} ${s.text} flex items-center justify-center font-bold shrink-0 border border-white/5 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)`,
        color: accentColor,
      }}
    >
      {project.name.charAt(0)}
    </div>
  );
}
