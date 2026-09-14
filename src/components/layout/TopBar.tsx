import { useLocation, Link } from 'react-router-dom';

interface TopBarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function TopBar({ sidebarCollapsed }: TopBarProps) {
  const location = useLocation();

  // Build breadcrumbs from pathname
  const buildBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return [{ label: 'Runtime Environment', path: '/' }];

    const crumbs: { label: string; path: string }[] = [];
    if (parts[0] === 'practical') {
      crumbs.push({ label: 'Practicals', path: '/' });
      crumbs.push({ label: `Practical ${parts[1]}`, path: location.pathname });
    } else if (parts[0] === 'postlab') {
      crumbs.push({ label: 'Post-Lab', path: '/' });
      crumbs.push({ label: `Experiment ${parts[1]}`, path: location.pathname });
    }
    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <header
      className={`fixed top-0 right-0 h-14 bg-white/95 backdrop-blur-xl border-b border-border-subtle z-40 px-5 flex items-center justify-between shadow-sm transition-all motion-base ${
        sidebarCollapsed ? 'left-16' : 'left-0 lg:left-72'
      }`}
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-body-sm text-text-secondary">
        <span className="material-symbols-outlined text-[18px] text-text-muted">
          account_tree
        </span>
        <Link to="/" className="text-text-muted hover:text-text-primary transition-colors">
          Laboratory
        </Link>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-border-prominent">/</span>
            {i === breadcrumbs.length - 1 ? (
              <span className="text-text-primary font-medium capitalize">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center bg-neutral-100 px-2 py-1 rounded-lg gap-2 border border-border-subtle">
          <span className="material-symbols-outlined text-text-muted text-[16px]">search</span>
          <span className="font-geist text-body-sm text-text-muted">Quick Inspect...</span>
          <kbd className="font-mono text-control-label bg-white border border-border-subtle px-1.5 py-0.5 rounded text-text-secondary shadow-xs">
            ⌘K
          </kbd>
        </div>

        {/* WASM/Python Toggle */}
        <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-border-subtle">
          <button className="px-2 py-1 rounded bg-white shadow-xs border border-border-subtle font-mono text-control-label text-text-primary font-medium">
            WASM
          </button>
          <button className="px-2 py-1 rounded font-mono text-control-label text-text-muted hover:text-text-primary transition-colors font-medium">
            Python
          </button>
        </div>

        {/* Code Link */}
        <a
          href="#"
          className="p-1.5 rounded-lg text-text-secondary hover:bg-neutral-100 hover:text-text-primary transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">code</span>
        </a>

        {/* Profile */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-xs">
          <span className="material-symbols-outlined text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
}
