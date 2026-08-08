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
    <aside className="w-52 shrink-0 border-r border-border bg-white/60 px-4 py-6">
      <h1 className="px-2 pb-6 font-serif text-lg font-bold text-accent">
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
                  ? 'bg-accent text-white'
                  : 'text-ink-soft hover:bg-accent/10 hover:text-accent'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 border-t border-border pt-4">
        <p className="px-2 text-xs text-ink-soft">
          Changes are saved directly to <code>src/data</code> and{' '}
          <code>src/content/blog</code>. Use Git separately when you are ready to version or deploy them.
        </p>
      </div>
    </aside>
  );
}
