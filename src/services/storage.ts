import { ReportWithDetails, DiseaseMaster, AuditLog, UserProfile } from '../types';
import { INITIAL_DISEASES } from '../data/initialDiseases';
import { generateSampleReports } from '../data/sampleReports';
import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

const KEYS = {
  REPORTS: 'yt_cancer_reports_v1',
  DISEASES: 'yt_cancer_diseases_v1',
  LOGS: 'yt_cancer_audit_logs_v1',
  USERS: 'yt_cancer_users_v1',
  UNIT_CONFIG: 'yt_cancer_unit_config_v1',
  PREVIEW_MODE: 'yt_cancer_preview_mode_v1',
};

export interface UnitConfig {
  unitName: string;
  districtName: string;
  provinceName: string;
  headTitle: string;
  reporterTitle: string;
  headName?: string;
}

export const DEFAULT_UNIT_CONFIG: UnitConfig = {
  unitName: 'Trạm Y tế phường Hiệp Thành',
  districtName: 'Trực thuộc Uỷ ban nhân dân phường Hiệp Thành',
  provinceName: 'Địa chỉ: Phường Hiệp Thành, Cà Mau',
  headTitle: 'TRƯỞNG TRẠM Y TẾ',
  reporterTitle: 'NGƯỜI LẬP BÁO CÁO',
  headName: 'ThS.BS. Sơn Lý Hồng Đức',
};

// DEFAULT INITIAL USERS (Chỉ người dùng thực sự có trên hệ thống)
export const DEFAULT_USERS_LIST: UserProfile[] = [
  {
    uid: 'u_admin_sonlyhongduc',
    email: 'sonlyhongduc@gmail.com',
    displayName: 'ThS.BS. Sơn Lý Hồng Đức',
    role: 'ADMIN',
    position: 'Trưởng trạm Y tế',
    unitName: 'Trạm Y tế phường Hiệp Thành',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

// FIRESTORE SYNC HELPERS
export async function syncReportToFirestore(report: ReportWithDetails): Promise<void> {
  try {
    await setDoc(doc(db, 'reports', report.id), report, { merge: true });
  } catch (err) {
    console.warn('Firestore report sync notice:', err);
  }
}

export async function deleteReportFromFirestore(reportId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'reports', reportId));
  } catch (err) {
    console.warn('Firestore delete report notice:', err);
  }
}

export async function syncUsersToFirestore(users: UserProfile[]): Promise<void> {
  try {
    for (const u of users) {
      await setDoc(doc(db, 'users', u.uid || u.email.replace(/[@.]/g, '_')), u, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore user sync notice:', err);
  }
}

export async function deleteUserFromFirestore(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (err) {
    console.warn('Firestore delete user notice:', err);
  }
}

export async function syncUnitConfigToFirestore(cfg: UnitConfig): Promise<void> {
  try {
    await setDoc(doc(db, 'unitConfig', 'main'), cfg, { merge: true });
  } catch (err) {
    console.warn('Firestore config sync notice:', err);
  }
}

export async function syncAuditLogToFirestore(log: AuditLog): Promise<void> {
  try {
    await setDoc(doc(db, 'auditLogs', log.id), log, { merge: true });
  } catch (err) {
    console.warn('Firestore log sync notice:', err);
  }
}

// FETCH & MERGE FROM FIRESTORE ON LAUNCH
export async function fetchAndSyncWithFirestore(): Promise<void> {
  try {
    // 1. Reports
    const repSnap = await getDocs(collection(db, 'reports'));
    if (!repSnap.empty) {
      const remoteReports: ReportWithDetails[] = [];
      repSnap.forEach(d => remoteReports.push(d.data() as ReportWithDetails));
      if (remoteReports.length > 0) {
        localStorage.setItem(KEYS.REPORTS, JSON.stringify(remoteReports));
      }
    } else {
      // Seed initial sample reports to Firestore
      const localReps = getReports();
      for (const r of localReps) {
        await syncReportToFirestore(r);
      }
    }

    // 2. Users
    const userSnap = await getDocs(collection(db, 'users'));
    if (!userSnap.empty) {
      const remoteUsers: UserProfile[] = [];
      userSnap.forEach(d => remoteUsers.push(d.data() as UserProfile));
      if (remoteUsers.length > 0) {
        localStorage.setItem(KEYS.USERS, JSON.stringify(remoteUsers));
      }
    } else {
      // Seed initial users list to Firestore
      const localUsers = getUsersList();
      await syncUsersToFirestore(localUsers);
    }

    // 3. Unit Config
    const cfgSnap = await getDocs(collection(db, 'unitConfig'));
    if (!cfgSnap.empty) {
      cfgSnap.forEach(d => {
        if (d.id === 'main') {
          localStorage.setItem(KEYS.UNIT_CONFIG, JSON.stringify(d.data()));
        }
      });
    } else {
      await syncUnitConfigToFirestore(getUnitConfig());
    }
  } catch (e) {
    console.warn('Firestore fetch & sync notice:', e);
  }
}

// INITIALIZATION
export function initLocalStorage(): void {
  try {
    const existingUnitRaw = localStorage.getItem(KEYS.UNIT_CONFIG);
    if (!existingUnitRaw || existingUnitRaw.includes('TÂN HỘI')) {
      localStorage.setItem(KEYS.UNIT_CONFIG, JSON.stringify(DEFAULT_UNIT_CONFIG));
    }
    const existingDiseasesRaw = localStorage.getItem(KEYS.DISEASES);
    if (!existingDiseasesRaw) {
      localStorage.setItem(KEYS.DISEASES, JSON.stringify(INITIAL_DISEASES));
    } else {
      try {
        const parsed = JSON.parse(existingDiseasesRaw);
        if (Array.isArray(parsed) && parsed.length < 50) {
          localStorage.setItem(KEYS.DISEASES, JSON.stringify(INITIAL_DISEASES));
        }
      } catch (e) {
        localStorage.setItem(KEYS.DISEASES, JSON.stringify(INITIAL_DISEASES));
      }
    }
    if (!localStorage.getItem(KEYS.REPORTS)) {
      const sample = generateSampleReports();
      localStorage.setItem(KEYS.REPORTS, JSON.stringify(sample));
    }
    if (!localStorage.getItem(KEYS.USERS)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS_LIST));
    }
    if (!localStorage.getItem(KEYS.LOGS)) {
      const initialLogs: AuditLog[] = [
        {
          id: 'log_init',
          timestamp: new Date().toISOString(),
          userEmail: 'sonlyhongduc@gmail.com',
          userName: 'ThS.BS. Sơn Lý Hồng Đức',
          action: 'CREATE',
          targetType: 'SETTINGS',
          targetId: 'system',
          description: 'Khởi tạo hệ thống Báo cáo NCD & Ung thư Trạm Y tế Phường Hiệp Thành'
        }
      ];
      localStorage.setItem(KEYS.LOGS, JSON.stringify(initialLogs));
    }

    // Async sync background with Firestore
    fetchAndSyncWithFirestore().catch(console.error);
  } catch (err) {
    console.error('LocalStorage init error:', err);
  }
}

// DISEASES CRUD
export function getDiseases(): DiseaseMaster[] {
  try {
    const raw = localStorage.getItem(KEYS.DISEASES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_DISEASES;
}

export function saveDiseases(diseases: DiseaseMaster[], logUser?: { email: string; name: string }): void {
  localStorage.setItem(KEYS.DISEASES, JSON.stringify(diseases));
  if (logUser) {
    addAuditLog({
      action: 'UPDATE',
      targetType: 'DISEASE',
      targetId: 'catalog',
      description: `Cập nhật danh mục bệnh (Tổng ${diseases.length} bệnh)`,
      userEmail: logUser.email,
      userName: logUser.name
    });
  }
}

// REPORTS CRUD
export function getReports(): ReportWithDetails[] {
  try {
    const raw = localStorage.getItem(KEYS.REPORTS);
    if (raw) {
      const parsed = JSON.parse(raw) as ReportWithDetails[];
      return parsed.sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month));
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function getReportByPeriod(month: number, year: number): ReportWithDetails | undefined {
  const reports = getReports();
  return reports.find(r => r.month === month && r.year === year);
}

export function getReportById(id: string): ReportWithDetails | undefined {
  const reports = getReports();
  return reports.find(r => r.id === id);
}

export function saveReport(
  report: ReportWithDetails,
  mode: 'CREATE' | 'UPDATE' | 'OVERWRITE',
  user: { email: string; name: string }
): void {
  const reports = getReports();
  const existingIdx = reports.findIndex(r => r.month === report.month && r.year === report.year);

  let updatedReport: ReportWithDetails;

  if (existingIdx >= 0) {
    if (mode === 'UPDATE') {
      updatedReport = {
        ...reports[existingIdx],
        ...report,
        updatedAt: new Date().toISOString(),
        updatedBy: user.name,
      };
    } else {
      updatedReport = {
        ...report,
        updatedAt: new Date().toISOString(),
        updatedBy: user.name,
      };
    }
    reports[existingIdx] = updatedReport;
  } else {
    updatedReport = {
      ...report,
      updatedAt: new Date().toISOString(),
      updatedBy: user.name,
    };
    reports.push(updatedReport);
  }

  localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));

  // Sync to Firestore
  syncReportToFirestore(updatedReport);

  addAuditLog({
    action: existingIdx >= 0 ? 'UPDATE' : 'CREATE',
    targetType: 'REPORT',
    targetId: report.id,
    description: `${existingIdx >= 0 ? 'Chỉnh sửa/Ghi đè' : 'Thêm mới'} báo cáo Tháng ${report.month}/${report.year}`,
    userEmail: user.email,
    userName: user.name
  });
}

export function toggleReportLock(reportId: string, user: { email: string; name: string }): boolean {
  const reports = getReports();
  const r = reports.find(item => item.id === reportId);
  if (!r) return false;

  r.isLocked = !r.isLocked;
  r.updatedAt = new Date().toISOString();
  r.updatedBy = user.name;

  localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));

  // Sync to Firestore
  syncReportToFirestore(r);

  addAuditLog({
    action: r.isLocked ? 'LOCK' : 'UNLOCK',
    targetType: 'REPORT',
    targetId: r.id,
    description: `${r.isLocked ? 'Khóa' : 'Mở khóa'} chỉnh sửa báo cáo Tháng ${r.month}/${r.year}`,
    userEmail: user.email,
    userName: user.name
  });

  return r.isLocked;
}

export function deleteReport(reportId: string, user: { email: string; name: string }): void {
  const reports = getReports();
  const target = reports.find(r => r.id === reportId);
  if (!target) return;

  const filtered = reports.filter(r => r.id !== reportId);
  localStorage.setItem(KEYS.REPORTS, JSON.stringify(filtered));

  // Delete from Firestore
  deleteReportFromFirestore(reportId);

  addAuditLog({
    action: 'DELETE',
    targetType: 'REPORT',
    targetId: reportId,
    description: `Xóa báo cáo Tháng ${target.month}/${target.year}`,
    userEmail: user.email,
    userName: user.name
  });
}

// AUDIT LOGS
export function getAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(KEYS.LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs.slice(0, 500)));
  syncAuditLogToFirestore(newLog);
}

// USER MANAGEMENT
export function getUsersList(): UserProfile[] {
  try {
    const raw = localStorage.getItem(KEYS.USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS_LIST));
  return DEFAULT_USERS_LIST;
}

export function saveUsersList(users: UserProfile[], logUser?: { email: string; name: string }): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  syncUsersToFirestore(users);

  if (logUser) {
    addAuditLog({
      action: 'UPDATE',
      targetType: 'USER',
      targetId: 'users_list',
      description: `Cập nhật danh sách người dùng & phân quyền (${users.length} tài khoản)`,
      userEmail: logUser.email,
      userName: logUser.name
    });
  }
}

// UNIT CONFIG
export function getUnitConfig(): UnitConfig {
  try {
    const raw = localStorage.getItem(KEYS.UNIT_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_UNIT_CONFIG;
}

export function saveUnitConfig(cfg: UnitConfig): void {
  localStorage.setItem(KEYS.UNIT_CONFIG, JSON.stringify(cfg));
  syncUnitConfigToFirestore(cfg);
}

// PREVIEW MODE SETTINGS
export function getPreviewMode(): boolean {
  try {
    const raw = localStorage.getItem(KEYS.PREVIEW_MODE);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return false;
}

export function setPreviewMode(enabled: boolean, user?: { email: string; name: string }): void {
  localStorage.setItem(KEYS.PREVIEW_MODE, JSON.stringify(enabled));
  setDoc(doc(db, 'unitConfig', 'previewMode'), { enabled, updatedAt: new Date().toISOString() }, { merge: true }).catch(console.warn);

  if (user) {
    addAuditLog({
      action: 'UPDATE',
      targetType: 'SETTINGS',
      targetId: 'preview_mode',
      description: `${enabled ? 'Bật' : 'Tắt'} tính năng Chế độ Xem Báo cáo Công khai (Preview Mode)`,
      userEmail: user.email,
      userName: user.name
    });
  }
}

// BACKUP & RESTORE
export function exportDatabaseJson(): string {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    reports: getReports(),
    diseases: getDiseases(),
    unitConfig: getUnitConfig(),
    logs: getAuditLogs()
  };
  return JSON.stringify(data, null, 2);
}

export function restoreDatabaseJson(jsonString: string, user: { email: string; name: string }): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.reports && Array.isArray(parsed.reports)) {
      localStorage.setItem(KEYS.REPORTS, JSON.stringify(parsed.reports));
      for (const r of parsed.reports) {
        syncReportToFirestore(r);
      }
    }
    if (parsed.diseases && Array.isArray(parsed.diseases)) {
      localStorage.setItem(KEYS.DISEASES, JSON.stringify(parsed.diseases));
    }
    if (parsed.unitConfig) {
      localStorage.setItem(KEYS.UNIT_CONFIG, JSON.stringify(parsed.unitConfig));
      syncUnitConfigToFirestore(parsed.unitConfig);
    }
    addAuditLog({
      action: 'RESTORE',
      targetType: 'SETTINGS',
      targetId: 'backup',
      description: 'Phục hồi toàn bộ cơ sở dữ liệu từ file sao lưu JSON',
      userEmail: user.email,
      userName: user.name
    });
    return true;
  } catch (err) {
    console.error('Failed to restore JSON database:', err);
    return false;
  }
}
