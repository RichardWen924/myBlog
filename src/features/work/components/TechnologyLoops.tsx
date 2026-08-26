import type { ReactNode } from 'react';
import LogoLoop, { type LogoItem } from './LogoLoop';

const technologyGroups = [
  {
    label: 'Frontend',
    direction: 'left' as const,
    speed: 34,
    items: ['React', 'Astro', 'TypeScript', 'Tailwind'],
  },
  {
    label: 'Backend',
    direction: 'right' as const,
    speed: 28,
    items: ['Node.js', 'Python', 'PostgreSQL', 'Java'],
  },
  {
    label: 'Agent',
    direction: 'left' as const,
    speed: 30,
    items: ['OpenAI', 'MCP', 'LangGraph', 'RAG'],
  },
] as const;

function TechnologyIcon({ name }: { name: string }): ReactNode {
  const props = {
    className: 'work-technology-mark__icon',
    viewBox: '0 0 32 32',
    width: 32,
    height: 32,
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
    focusable: false,
  } as const;

  switch (name) {
    case 'React':
      return (
        <svg {...props}>
          <ellipse cx="16" cy="16" rx="13" ry="5.2" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="16" cy="16" rx="13" ry="5.2" transform="rotate(60 16 16)" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="16" cy="16" rx="13" ry="5.2" transform="rotate(120 16 16)" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="2.25" fill="currentColor" />
        </svg>
      );
    case 'Astro':
      return (
        <svg {...props}>
          <path d="m16 3.5 3.5 9 9 3.5-9 3.5-3.5 9-3.5-9-9-3.5 9-3.5 3.5-9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="2" fill="currentColor" />
        </svg>
      );
    case 'TypeScript':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="26" height="26" rx="2" fill="currentColor" />
          <path d="M7 11h11M12.5 11v11M18.5 16.5h3a2.5 2.5 0 1 1-1.2 4.5c-.8 0-1.6-.3-2.1-.8" stroke="var(--color-paper)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'Tailwind':
      return (
        <svg {...props}>
          <path d="M4 12c2.8-4.7 6-5.7 9.5-3 1.8 1.4 3 2.2 4.8 2.2 3.1 0 5.2-1.1 6.2-3.2-1 5-4.2 7.6-9.5 7.6-1.9 0-3.4-.7-4.8-2.1C8.7 12 6.6 11.4 4 12Z" fill="currentColor" />
          <path d="M4 23c2.8-4.7 6-5.7 9.5-3 1.8 1.4 3 2.2 4.8 2.2 3.1 0 5.2-1.1 6.2-3.2-1 5-4.2 7.6-9.5 7.6-1.9 0-3.4-.7-4.8-2.1C8.7 23 6.6 22.4 4 23Z" fill="currentColor" opacity=".55" />
        </svg>
      );
    case 'Node.js':
      return (
        <svg {...props}>
          <path d="m16 3.5 11 6.25v12.5L16 28.5 5 22.25V9.75L16 3.5Z" fill="currentColor" />
          <path d="M12 21v-7.2l4 2.3 4-2.3V21" stroke="var(--color-paper)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Python':
      return (
        <svg {...props}>
          <path d="M16 4.5h-4.2a4.3 4.3 0 0 0-4.3 4.3v2.8h8.6v3.1H9.8A4.3 4.3 0 0 0 5.5 19v2.8a4.3 4.3 0 0 0 4.3 4.3H14v-5.4h-2.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 27.5h4.2a4.3 4.3 0 0 0 4.3-4.3v-2.8h-8.6v-3.1h6.3a4.3 4.3 0 0 0 4.3-4.3v-2.8A4.3 4.3 0 0 0 22.2 6H18v5.4h2.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
          <circle cx="11.2" cy="8.8" r="1" fill="currentColor" />
          <circle cx="20.8" cy="23.2" r="1" fill="currentColor" opacity=".55" />
        </svg>
      );
    case 'PostgreSQL':
      return (
        <svg {...props}>
          <path d="M8.2 23.5c-1.1-3.1-.8-8.2.5-12.2C10 7.5 12.6 5 16 5s6 2.5 7.3 6.3c1.3 4 .8 9.1-.5 12.2-.7 1.7-2 2.9-3.5 2.9-1.8 0-2.7-1.4-2.7-3.3V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M9 12.2c1.6 1.1 3.4 1.5 5.2 1.2M23 12.2c-1.6 1.1-3.4 1.5-5.2 1.2M18 21.2c2 .7 4 .4 5.8-.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="13" cy="10.4" r="1" fill="currentColor" />
          <circle cx="19" cy="10.4" r="1" fill="currentColor" />
        </svg>
      );
    case 'Java':
      return (
        <svg {...props}>
          <path d="M10 13h11v5.5a5.5 5.5 0 0 1-5.5 5.5h0a5.5 5.5 0 0 1-5.5-5.5V13Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M21 15h2.2a2.8 2.8 0 0 1 0 5.6H21M8 27h16M12 8.5c2-1.6 1.3-3.2.1-4.5M16 9c2.1-1.7 1.2-3.5.2-4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'OpenAI':
      return (
        <svg {...props}>
          <path d="m16 4.2 4.2 2.4v4.8l4.2 2.4v4.8l-4.2 2.4v4.8L16 28.2l-4.2-2.4V21l-4.2-2.4v-4.8l4.2-2.4V6.6L16 4.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="m11.8 6.6 4.2 2.4 4.2-2.4M7.6 13.8l4.2 2.4v4.8M24.4 13.8l-4.2 2.4v4.8M11.8 25.8l4.2-2.4 4.2 2.4M16 9v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".75" />
        </svg>
      );
    case 'MCP':
      return (
        <svg {...props}>
          <path d="M6 8h8a3 3 0 0 1 3 3v2M26 24h-8a3 3 0 0 1-3-3v-2M8 6v8a3 3 0 0 0 3 3h2M24 26v-8a3 3 0 0 0-3-3h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="6" cy="8" r="2.5" fill="currentColor" />
          <circle cx="26" cy="24" r="2.5" fill="currentColor" />
        </svg>
      );
    case 'LangGraph':
      return (
        <svg {...props}>
          <path d="M7 8.5 16 16l9-7.5M16 16v9M7 8.5v15M25 8.5v15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7" cy="8.5" r="3" fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="3" fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="25" cy="8.5" r="3" fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="7" cy="23.5" r="3" fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="25" cy="23.5" r="3" fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'RAG':
      return (
        <svg {...props}>
          <path d="M10 6H6v20h4M22 6h4v20h-4M12 14h6M12 19h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
  }
}

function technologyMark(name: string): ReactNode {
  return (
    <span className="work-technology-mark">
      <TechnologyIcon name={name} />
      <span className="work-technology-mark__name">{name}</span>
    </span>
  );
}

function toLogoItem(name: string): LogoItem {
  return { node: technologyMark(name), title: name };
}

export default function TechnologyLoops() {
  return (
    <div className="work-technology-loops" aria-label="Technology groups">
      {technologyGroups.map((group) => (
        <div className="work-technology-loop" data-work-loop key={group.label}>
          <div className="work-technology-loop__head">
            <h3>{group.label}</h3>
            <span aria-hidden="true">↗</span>
          </div>
          <LogoLoop
            logos={group.items.map(toLogoItem)}
            speed={group.speed}
            direction={group.direction}
            logoHeight={30}
            gap={34}
            hoverSpeed={0}
            fadeOut
            fadeOutColor="var(--color-paper)"
            scaleOnHover
            ariaLabel={`${group.label} technologies`}
            className="work-technology-loop__marquee"
          />
        </div>
      ))}
    </div>
  );
}
