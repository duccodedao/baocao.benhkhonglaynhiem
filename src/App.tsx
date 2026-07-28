import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReportsProvider } from './context/ReportsContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Dashboard } from './components/Dashboard';
import { ManagementLists, DiseaseCategoryKey } from './components/ManagementLists';
import { ReportDetailModal } from './components/ReportDetailModal';
import { Statistics } from './components/Statistics';
import { Comparison } from './components/Comparison';
import { DiseaseCatalog } from './components/DiseaseCatalog';
import { AuditLogs } from './components/AuditLogs';
import { AdminUsers } from './components/AdminUsers';
import { BackupRestore } from './components/BackupRestore';
import { ProgramConfig } from './components/ProgramConfig';
import { OfficialMonthlyReport } from './components/OfficialMonthlyReport';
import { OldReportTemplate } from './components/OldReportTemplate';
import { LoginForm } from './components/LoginForm';

import { getReportById, initLocalStorage } from './services/storage';

const VALID_TABS = [
  'official_monthly_report',
  'old_report_template',
  'dashboard',
  '2.1_hypertension',
  '2.2_diabetes',
  '2.3_cancer',
  '2.4_copd',
  '2.5_asthma',
  '2.6_iod',
  'statistics',
  'comparison',
  'disease_catalog',
  'audit_logs',
  'users',
  'backup',
  'program_config',
  'report_cancer',
  'report_copd_asthma',
  'report_iod',
  'report_tt23'
];

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTabState] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return VALID_TABS.includes(hash) ? hash : 'official_monthly_report';
  });

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);

  // Initialize DB and Top Loading effect
  useEffect(() => {
    initLocalStorage();
    const timer = setTimeout(() => {
      setIsLoadingPage(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Sync state with URL hashtag #tab_name
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (VALID_TABS.includes(hash)) {
        setActiveTabState(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changeTab = (newTab: string) => {
    setIsLoadingPage(true);
    setActiveTabState(newTab);
    window.location.hash = newTab;
    setTimeout(() => {
      setIsLoadingPage(false);
    }, 250);
  };

  if (!user) {
    return <LoginForm />;
  }

  const selectedReport = selectedReportId ? getReportById(selectedReportId) : null;

  const isManagementListTab = [
    '2.1_hypertension',
    '2.2_diabetes',
    '2.3_cancer',
    '2.4_copd',
    '2.5_asthma',
    '2.6_iod'
  ].includes(activeTab);

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
            {activeTab === 'official_monthly_report' && <OfficialMonthlyReport defaultTab="all" />}
            {activeTab === 'report_cancer' && <OfficialMonthlyReport defaultTab="cancer" />}
            {activeTab === 'report_copd_asthma' && <OfficialMonthlyReport defaultTab="copd" />}
            {activeTab === 'report_iod' && <OfficialMonthlyReport defaultTab="iod" />}
            {activeTab === 'report_tt23' && <OfficialMonthlyReport defaultTab="tt23" />}

            {activeTab === 'old_report_template' && (
              <OldReportTemplate onGoToCurrentReport={() => changeTab('official_monthly_report')} />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                setActiveTab={(tab) => changeTab(tab)}
                onSelectReportDetail={repId => setSelectedReportId(repId)}
              />
            )}

            {isManagementListTab && (
              <ManagementLists initialSubTab={activeTab as DiseaseCategoryKey} />
            )}

            {activeTab === 'statistics' && <Statistics />}

            {activeTab === 'comparison' && <Comparison />}

            {activeTab === 'disease_catalog' && <DiseaseCatalog />}

            {activeTab === 'audit_logs' && <AuditLogs />}

            {activeTab === 'users' && <AdminUsers />}

            {activeTab === 'backup' && <BackupRestore />}

            {activeTab === 'program_config' && <ProgramConfig />}
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
