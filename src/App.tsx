import { Routes, Route } from "react-router-dom";
import { Toaster } from 'sonner';
import Home from "@/pages/Home";
import Resources from "@/pages/Resources";
import Schedule from "@/pages/Schedule";
import Share from "@/pages/Share";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScheduleProvider } from "@/contexts/ScheduleContext";
import { ResourceProvider } from "@/contexts/ResourceContext";
import { ShareProvider } from '@/contexts/ShareContext';
import { useTheme } from "@/hooks/useTheme";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
import { SyncStatusBar } from "@/components/SyncStatusBar";
import { DebugPanel } from "@/components/DebugPanel";

function AppContent() {
  const { isDark } = useTheme();
  const { syncStatus } = useSupabaseSync();
  
  return (
    <>
      {/* 同步状态栏 */}
      <SyncStatusBar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/share" element={<Share />} />
      </Routes>
      
      <Toaster 
        theme={isDark ? 'dark' : 'light'}
        position="top-right"
        richColors
      />
      
      {/* 调试面板 - 仅在开发环境显示 */}
      <DebugPanel />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <ResourceProvider>
          <ShareProvider>
            <AppContent />
          </ShareProvider>
        </ResourceProvider>
      </ScheduleProvider>
    </AuthProvider>
  );
}



