import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReportsProvider } from './context/ReportsContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Dashboard } from './components/Dashboard';
import { ManagementLists } from './components/ManagementLists';
import { ReportDetailModal } from './components/ReportDetailModal';
import { AuditLogs } from './components/AuditLogs';
import { AdminPanel } from './components/AdminPanel';
import { AccountSettings } from './components/AccountSettings';
import { SystemSettings } from './components/SystemSettings';
import { Notifications } from './components/Notifications';
import { OfficialMonthlyReport } from './components/OfficialMonthlyReport';
import { OldReportTemplate } from './components/OldReportTemplate';
import { MedicalDocuments } from './components/MedicalDocuments';
import { UnderDevelopment } from './components/UnderDevelopment';
import { LoginForm } from './components/LoginForm';

import { getReportById, initLocalStorage } from './services/storage';
import { getTabByHash, getHashByTab } from './utils/navigation';

const SOON_PROGRAM_NAMES: Record<string, string> = {
  report_copd_asthma: 'COPD và Hen',
  report_buou_co: 'Bướu cổ',
  report_ruou_bia: 'Rượu bia',
  report_thuoc_la: 'Thuốc lá',
  screening_tha_dtd: 'Khám sàng lọc THA & ĐTĐ',
  screening_copd_asthma: 'Khám sàng lọc COPD & Hen',
  screening_cancer: 'Khám sàng lọc Ung thư',
  '2.1_hypertension': 'Quản lý bệnh Tăng huyết áp',
  '2.2_diabetes': 'Quản lý bệnh Đái tháo đường',
  '2.3_cancer': 'Danh sách bệnh nhân Ung thư',
  '2.4_copd': 'Danh sách bệnh nhân COPD',
  '2.5_asthma': 'Danh sách bệnh nhân Hen',
  '2.6_iod': 'Danh sách đối tượng Rối loạn do thiếu Iốt',
  list_ruou_bia: 'Quản lý Cơ sở sản xuất Rượu bia',
  list_thuoc_la: 'Quản lý Cơ sở Thuốc lá'
};

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTabState] = useState<string>(() => {
    return getTabByHash(window.location.hash);
  });

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);

  // Initialize DB and Top Loading effect
  useEffect(() => {
    initLocalStorage();
    const timer = setTimeout(() => {
      setIsLoadingPage(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Sync state with URL hashtag
  useEffect(() => {
    const handleHashChange = () => {
      const resolvedTab = getTabByHash(window.location.hash);
      setActiveTabState(resolvedTab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changeTab = (newTab: string) => {
    setIsLoadingPage(true);
    setActiveTabState(newTab);
    window.location.hash = getHashByTab(newTab);
    setTimeout(() => {
      setIsLoadingPage(false);
    }, 200);
  };

  if (!user) {
    return <LoginForm />;
  }

  const selectedReport = selectedReportId ? getReportById(selectedReportId) : null;
  const isSoonTab = SOON_PROGRAM_NAMES[activeTab] !== undefined;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-rose-500 selection:text-white relative">
      {/* Top Loading Progress Bar */}
      {isLoadingPage && (
        <div className="fixed top-0 left-0 right-0 z-[10000] h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 animate-pulse"></div>
      )}

      {/* Top Navbar */}
      <Navbar onOpenMobileMenu={() => setIsMobileOpen(true)} />

      {/* Body Area */}
      <div className="flex-1 w-full flex flex-col lg:flex-row gap-0">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab as any}
          setActiveTab={(tab) => changeTab(tab)}
          isOpenMobile={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Main Workspace View */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="w-full">
            {/* Soon Tabs Placeholder */}
            {isSoonTab && (
              <UnderDevelopment
                programName={SOON_PROGRAM_NAMES[activeTab]}
                onGoBack={() => changeTab('official_monthly_report')}
              />
            )}

            {/* Official Report Views */}
            {activeTab === 'official_monthly_report' && <OfficialMonthlyReport defaultTab="all" defaultViewMode="MONTHLY" />}
            {activeTab === 'report_quarter' && <OfficialMonthlyReport defaultTab="all" defaultViewMode="QUARTERLY" />}
            {activeTab === 'report_cancer' && <OfficialMonthlyReport defaultTab="cancer" />}
            {activeTab === 'report_iod' && <OfficialMonthlyReport defaultTab="iod" />}
            {activeTab === 'report_tt23' && <OfficialMonthlyReport defaultTab="tt23" />}

            {activeTab === 'old_report_template' && (
              <OldReportTemplate onGoToCurrentReport={() => changeTab('official_monthly_report')} />
            )}

            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <Dashboard
                setActiveTab={(tab) => changeTab(tab)}
                onSelectReportDetail={repId => setSelectedReportId(repId)}
              />
            )}

            {/* Account & System Settings */}
            {activeTab === 'account_settings' && <AccountSettings />}
            {activeTab === 'system_settings' && <SystemSettings />}

            {/* Medical Documents */}
            {activeTab === 'documents' && <MedicalDocuments />}

            {/* Realtime Notifications */}
            {activeTab === 'notifications' && <Notifications />}

            {/* Audit Logs */}
            {activeTab === 'audit_logs' && <AuditLogs />}

            {/* Admin Panel */}
            {(activeTab === 'admin_panel' || activeTab === 'users' || activeTab === 'admin_notifications' || activeTab === 'admin_github' || activeTab === 'backup' || activeTab === 'program_config' || activeTab === 'preview_passcode') && (
              <AdminPanel activeTab={activeTab} />
            )}
          </div>
        </main>

      </div>

      {/* Modal for viewing detailed official report */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReportId(null)}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ReportsProvider>
            <MainLayout />
          </ReportsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
