import { NavLink } from 'react-router-dom';

const links = [
  { to: '/profile', label: 'Profile' },
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/experience', label: 'Experience' },
  { to: '/blog', label: 'Blog' },
];

export default function Nav() {
  return (
    <aside className="w-52 shrink-0 border-r border-[#E6E2DD] bg-white/60 px-4 py-6">
      <h1 className="px-2 pb-6 font-serif text-lg font-bold text-[#5B7553]">
        Blog Admin
      </h1>
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `rounded px-3 py-2 text-sm no-underline transition-colors ${
                isActive
                  ? 'bg-[#5B7553] text-white'
                  : 'text-[#6B6B6B] hover:bg-[#5B7553]/10 hover:text-[#5B7553]'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 border-t border-[#E6E2DD] pt-4">
        <p className="px-2 text-xs text-[#6B6B6B]">
          Edits are written to <code>src/data/*.json</code> and{' '}
          <code>src/content/blog/*.md</code>, then committed and pushed.
        </p>
      </div>
    </aside>
  );
}
