import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { practicals, postlabs } from '../../data/experiments';

interface SidebarProps {
  collapsed: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed, onToggle: _onToggle }: SidebarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex flex-col gap-1 bg-white border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-sm border border-border-subtle bg-white">
              <svg viewBox="0 0 100 100" className="w-6 h-6">
                <circle cx="50" cy="50" r="30" fill="none" stroke="#EF4444" strokeWidth="8" strokeDasharray="160" strokeDashoffset="30"/>
                <circle cx="50" cy="50" r="8" fill="#EF4444"/>
                <line x1="50" y1="20" x2="50" y2="35" stroke="#EF4444" strokeWidth="6" strokeLinecap="round"/>
                <line x1="50" y1="65" x2="50" y2="80" stroke="#EF4444" strokeWidth="6" strokeLinecap="round"/>
                <line x1="20" y1="50" x2="35" y2="50" stroke="#EF4444" strokeWidth="6" strokeLinecap="round"/>
                <line x1="65" y1="50" x2="80" y2="50" stroke="#EF4444" strokeWidth="6" strokeLinecap="round"/>
                <circle cx="72" cy="72" r="10" fill="#F97316"/>
              </svg>
            </div>
            {!collapsed && (
              <span className="font-geist text-headline-sm text-text-primary font-semibold tracking-tight">
                VisionLab
              </span>
            )}
          </div>
          {!collapsed && (
            <span className="font-mono text-badge-label bg-neutral-100 px-1.5 py-0.5 rounded text-primary border border-border-subtle">
              v2.4.0-cv
            </span>
          )}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-1.5 pl-1 pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-stat-label text-text-muted uppercase tracking-wider">
              Kernel Ready
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-1 flex flex-col gap-3">
        {/* Dashboard */}
        <nav className="flex flex-col gap-0.5">
          <Link
            to="/"
            className={`flex items-center justify-between px-2 py-1.5 transition-colors rounded-lg ${
              isActive('/')
                ? 'bg-primary text-white font-semibold shadow-sm shadow-red-500/20'
                : 'text-text-secondary hover:bg-neutral-100:bg-dark-surface-raised hover:text-text-primary:text-neutral-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
              {!collapsed && <span>Dashboard</span>}
            </div>
          </Link>
        </nav>

        {/* Practicals */}
        <div>
          <div className="px-2 py-1 flex items-center justify-between">
            <span className="font-mono text-stat-label text-text-muted uppercase tracking-wider">
              {collapsed ? 'P' : 'Practicals'}
            </span>
            {!collapsed && (
              <span className="font-mono text-badge-label px-1.5 py-0.5 rounded bg-red-50 text-primary font-bold border border-red-200">
                8 UNITS
              </span>
            )}
          </div>
          <nav className="flex flex-col gap-0.5">
            {practicals.map((p) => {
              const path = `/practical/${p.number}`;
              const active = isActive(path);
              return (
                <Link
                  key={p.id}
                  to={path}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-body-sm ${
                    active
                      ? 'bg-red-50 text-red-600 font-semibold border border-primary/30'
                      : 'text-text-secondary hover:bg-neutral-100:bg-dark-surface-raised hover:text-text-primary:text-neutral-100'
                  }`}
                >
                  <span className="truncate">
                    {collapsed ? p.number : `${p.number}. ${p.shortTitle}`}
                  </span>
                  {!collapsed && (
                    <span
                      className={`font-mono text-badge-label ml-1 ${
                        active
                          ? 'text-white bg-primary px-1.5 py-0.5 rounded shadow-xs'
                          : 'text-primary'
                      }`}
                    >
                      P-{String(p.number).padStart(2, '0')}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Post-Lab */}
        <div>
          <div className="px-2 py-1 flex items-center justify-between">
            <span className="font-mono text-stat-label text-text-muted uppercase tracking-wider">
              {collapsed ? 'PL' : 'Post-Lab Experiments'}
            </span>
            {!collapsed && (
              <span className="font-mono text-badge-label px-1.5 py-0.5 rounded bg-orange-50 text-secondary-hover font-bold border border-secondary/30">
                POST-LAB
              </span>
            )}
          </div>
          <nav className="flex flex-col gap-0.5">
            {postlabs.map((p) => {
              const path = `/postlab/${p.number}`;
              const active = isActive(path);
              return (
                <Link
                  key={p.id}
                  to={path}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-body-sm ${
                    active
                      ? 'bg-orange-50 text-secondary-hover font-semibold border border-secondary/30'
                      : 'text-text-secondary hover:bg-neutral-100:bg-dark-surface-raised hover:text-secondary-hover:text-orange-400'
                  }`}
                >
                  <span className="truncate">
                    {collapsed ? p.number : `${p.number}. ${p.shortTitle}`}
                  </span>
                  {!collapsed && (
                    <span className="font-mono text-badge-label text-secondary-hover ml-1">
                      EXP-{String(p.number).padStart(2, '0')}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer — WASM Status */}
      <div className="p-4 bg-canvas-base border-t border-border-subtle mt-auto flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-stat-label text-text-muted uppercase">
            {collapsed ? 'CV' : 'OpenCV.js WASM'}
          </span>
          <span className="font-mono text-badge-label text-emerald-600 uppercase font-semibold">
            Active
          </span>
        </div>
        {!collapsed && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-mono text-stat-label text-text-muted uppercase">Heap Memory</span>
              <span className="font-mono text-stat-label text-text-primary font-semibold">42.4 MB</span>
            </div>
            <div className="w-full bg-border-subtle h-1 rounded-full overflow-hidden mt-0.5">
              <div className="bg-gradient-to-r from-primary to-secondary h-full w-1/4 rounded-full" />
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-border-subtle flex-col z-50 shadow-sm transition-all motion-base ${
          collapsed ? 'w-16' : 'w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-white border border-border-subtle shadow-sm"
      >
        <span className="material-symbols-outlined text-[20px]">menu</span>
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="w-72 h-full bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
