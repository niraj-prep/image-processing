import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-canvas-base text-text-primary font-geist text-body-md antialiased">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`transition-all motion-base ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-72'}`}>
        <TopBar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="w-full pt-14 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
