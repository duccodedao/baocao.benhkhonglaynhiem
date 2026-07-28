export interface DiseaseMaster {
  id: string;
  code: string;
  name: string;
  category?: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface ReportDetail {
  id: string;
  reportId: string;
  diseaseId: string;
  diseaseName: string;
  newCase: number;           // Số mắc
  totalCase: number;         // Mắc tích lũy
  death: number;             // Số chết
  totalDeath: number;        // Chết tích lũy
  stopTreatment: number;     // Không tiếp tục điều trị
  currentManagement: number; // Quản lý hiện tại
  note: string;              // Ghi chú
}

export interface ReportHeader {
  id: string;
  unitName: string;          // Đơn vị (e.g., Trạm Y tế Xã/Phường)
  provinceName?: string;      // Tỉnh/Thành phố
  districtName?: string;      // Quận/Huyện
  month: number;             // Tháng (1 - 12)
  year: number;              // Năm (e.g., 2026)
  createdDate: string;       // Ngày nhập
  createdBy: string;         // Người nhập
  updatedAt: string;
  updatedBy?: string;
  isLocked: boolean;         // Trạng thái khóa báo cáo
  note?: string;
  programCode: string;       // E.g. 'UNG_THU'
}

export interface ReportWithDetails extends ReportHeader {
  details: ReportDetail[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOCK' | 'UNLOCK' | 'IMPORT' | 'RESTORE';
  targetType: 'REPORT' | 'DISEASE' | 'USER' | 'SETTINGS';
  targetId: string;
  description: string;
  changes?: Record<string, { old?: any; new?: any }>;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;         // Ảnh đại diện từ Google / Profile
  password?: string;         // Mật khẩu cho tài khoản thủ công
  role: 'ADMIN' | 'STAFF' | 'VIEWER';
  position?: string;         // Chức vụ công tác: Trưởng trạm, Phó trạm, Y sĩ, Cán bộ chuyên trách...
  unitName: string;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface FilterOptions {
  month?: number | 'ALL';
  quarter?: number | 'ALL';
  year?: number | 'ALL';
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface ProgramTemplate {
  code: string;
  name: string;
  description: string;
  excelSheetName: string;
  columns: {
    key: keyof ReportDetail;
    label: string;
    type: 'string' | 'number';
    width?: number;
  }[];
}

export interface PatientRecord {
  id: string;
  patientCode: string;
  insuranceCode?: string;
  citizenId?: string;
  fullName: string;
  birthYear: number;
  gender: 'NAM' | 'NỮ';
  address: string;
  phone: string;
  programType: 'TANG_HUYET_AP' | 'DAI_THAO_DUONG' | 'UNG_THU' | 'COPD' | 'HEN' | 'IOD';
  diseaseName: string;
  diagnosisDate: string;
  diagnosisFacility: string;
  status: 'DANG_QUAN_LY' | 'DIEU_TRI_ON_DINH' | 'CHUYEN_TUYEN' | 'TU_VONG' | 'BO_DIEU_TRI';
  lastMetric?: string;
  treatmentProtocol?: string;
  notes?: string;
  updatedAt: string;
}
