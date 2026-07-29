import { GitHubConfig, MedicalDocument } from '../types';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const GITHUB_CONFIG_KEY = 'yt_github_config';
const DOCUMENTS_LIST_KEY = 'yt_documents_list';
const DOCUMENTS_EVENT_NAME = 'yt_documents_updated';

const docsBroadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('yt_documents_realtime') : null;

if (docsBroadcastChannel) {
  docsBroadcastChannel.onmessage = () => {
    window.dispatchEvent(new CustomEvent(DOCUMENTS_EVENT_NAME));
  };
}

function triggerDocsUpdateEvent() {
  window.dispatchEvent(new CustomEvent(DOCUMENTS_EVENT_NAME));
  if (docsBroadcastChannel) {
    try {
      docsBroadcastChannel.postMessage({ type: 'UPDATE' });
    } catch {}
  }
}

// FIRESTORE REALTIME SYNC FOR MEDICAL DOCUMENTS
let isDocsFirestoreInitialized = false;

export function initDocumentsFirestoreRealtime() {
  if (isDocsFirestoreInitialized) return;
  isDocsFirestoreInitialized = true;

  try {
    const docsCol = collection(db, 'medicalDocuments');
    onSnapshot(docsCol, (snapshot) => {
      if (!snapshot.empty) {
        const remoteDocs: MedicalDocument[] = [];
        snapshot.forEach((dSnap) => {
          remoteDocs.push(dSnap.data() as MedicalDocument);
        });
        localStorage.setItem(DOCUMENTS_LIST_KEY, JSON.stringify(remoteDocs));
        triggerDocsUpdateEvent();
      } else {
        INITIAL_DOCUMENTS.forEach(d => {
          setDoc(doc(db, 'medicalDocuments', d.id), d, { merge: true }).catch(() => {});
        });
      }
    }, (err) => {
      console.warn('Realtime medical documents Firestore listener notice:', err);
    });
  } catch (err) {
    console.warn('Firestore docs sync init notice:', err);
  }
}

initDocumentsFirestoreRealtime();

export const DEFAULT_GITHUB_CONFIG: GitHubConfig = {
  username: '',
  token: '',
  repository: '',
  branch: 'main',
  folderPath: 'documents',
  isConfigured: false
};

export const INITIAL_DOCUMENTS: MedicalDocument[] = [
  {
    id: 'doc_001',
    documentNumber: '158/QĐ-SYT',
    issuingAuthority: 'Sở Y tế',
    title: 'Quyết định phê duyệt Kế hoạch Phòng chống Bệnh không lây nhiễm giai đoạn 2026-2030',
    excerpt: 'Phê duyệt chỉ tiêu tầm soát Tăng huyết áp, Đái tháo đường, COPD và Hen phế quản tại các Trạm Y tế Xã/Phường.',
    issueDate: '2026-01-15',
    status: 'HIEU_LUC',
    fileName: '158_QD_SYT_KeHoach_PC_BKLN.pdf',
    fileSize: 1048576, // 1MB
    fileType: 'application/pdf',
    downloadUrl: 'https://raw.githubusercontent.com/octocat/Hello-World/master/README',
    uploadedAt: '2026-01-16T08:30:00Z',
    uploadedBy: 'BS. Nguyễn Văn A (Quản trị viên)'
  },
  {
    id: 'doc_002',
    documentNumber: '42/KH-UBND',
    issuingAuthority: 'Ủy ban nhân dân Tỉnh',
    title: 'Kế hoạch Triển khai Chuyển đổi số và Quản lý sức khỏe nhân dân năm 2026',
    excerpt: 'Quy định lộ trình đồng bộ dữ liệu y tế cơ sở, ứng dụng công nghệ trong báo cáo hàng tháng.',
    issueDate: '2026-02-02',
    status: 'HIEU_LUC',
    fileName: '42_KH_UBND_ChuyenDoiSo_YTe2026.docx',
    fileSize: 524288,
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    downloadUrl: 'https://raw.githubusercontent.com/octocat/Hello-World/master/README',
    uploadedAt: '2026-02-03T10:15:00Z',
    uploadedBy: 'Y sĩ Trần Thị B'
  },
  {
    id: 'doc_003',
    documentNumber: '89/HD-BYT',
    issuingAuthority: 'Bộ Y tế',
    title: 'Hướng dẫn Kỹ thuật Khám sàng lọc và Lập hồ sơ quản lý bệnh COPD & Hen phế quản',
    excerpt: 'Quy trình đo chức năng hô hấp, phân độ nặng và phác đồ điều trị ban đầu tại tuyến xã/phường.',
    issueDate: '2026-03-10',
    status: 'HIEU_LUC',
    fileName: '89_HD_BYT_KhamSangLoc_COPD_Hen.pdf',
    fileSize: 2097152,
    fileType: 'application/pdf',
    downloadUrl: 'https://raw.githubusercontent.com/octocat/Hello-World/master/README',
    uploadedAt: '2026-03-12T14:20:00Z',
    uploadedBy: 'BS. Nguyễn Văn A (Quản trị viên)'
  }
];

// --- GITHUB CONFIG HELPERS ---
export function getGitHubConfig(): GitHubConfig {
  try {
    const data = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (!data) return DEFAULT_GITHUB_CONFIG;
    return { ...DEFAULT_GITHUB_CONFIG, ...JSON.parse(data) };
  } catch {
    return DEFAULT_GITHUB_CONFIG;
  }
}

export function saveGitHubConfig(config: GitHubConfig): void {
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
}

export async function testGitHubConnection(config: GitHubConfig): Promise<{ success: boolean; message: string; repoInfo?: any }> {
  if (!config.token || !config.repository) {
    return { success: false, message: 'Vui lòng nhập đầy đủ Personal Access Token (PAT) và Tên Repository!' };
  }

  const repo = config.repository.trim();
  const token = config.token.trim();

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: `Kết nối thành công đến Repository ${data.full_name} (${data.private ? 'Riêng tư' : 'Công khai'})!`,
        repoInfo: data
      };
    } else {
      const err = await res.json();
      return {
        success: false,
        message: `Lỗi kết nối GitHub (${res.status}): ${err.message || 'Token hoặc Repo không hợp lệ'}`
      };
    }
  } catch (error: any) {
    return { success: false, message: `Lỗi kết nối mạng: ${error.message || 'Không thể gọi GitHub API'}` };
  }
}

export async function uploadFileToGitHubRepo(
  config: GitHubConfig,
  fileName: string,
  base64Content: string,
  commitMessage: string
): Promise<{ success: boolean; downloadUrl?: string; githubPath?: string; sha?: string; error?: string }> {
  if (!config.token || !config.repository) {
    return { success: false, error: 'Chưa cấu hình GitHub Personal Access Token hoặc Repository!' };
  }

  const cleanRepo = config.repository.trim();
  const branch = config.branch || 'main';
  const folder = config.folderPath ? config.folderPath.replace(/^\/|\/$/g, '') : 'documents';
  const filePath = `${folder}/${Date.now()}_${fileName.replace(/\s+/g, '_')}`;

  // Strip prefix "data:xxx;base64," if present
  const rawBase64 = base64Content.includes(',') ? base64Content.split(',')[1] : base64Content;

  try {
    const url = `https://api.github.com/repos/${cleanRepo}/contents/${filePath}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: commitMessage || `Tải lên văn bản y tế: ${fileName}`,
        content: rawBase64,
        branch
      })
    });

    if (res.ok) {
      const result = await res.json();
      const downloadUrl = result.content?.download_url || `https://raw.githubusercontent.com/${cleanRepo}/${branch}/${filePath}`;
      return {
        success: true,
        downloadUrl,
        githubPath: filePath,
        sha: result.content?.sha
      };
    } else {
      const err = await res.json();
      return { success: false, error: err.message || 'Lỗi từ GitHub API khi tải file lên' };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể kết nối với GitHub API' };
  }
}

export async function deleteFileFromGitHubRepo(
  config: GitHubConfig,
  filePath: string,
  sha: string,
  commitMessage: string
): Promise<{ success: boolean; error?: string }> {
  if (!config.token || !config.repository || !filePath || !sha) {
    return { success: true }; // Local removal fallback
  }

  const cleanRepo = config.repository.trim();
  const branch = config.branch || 'main';

  try {
    const url = `https://api.github.com/repos/${cleanRepo}/contents/${filePath}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${config.token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: commitMessage || `Xóa văn bản: ${filePath}`,
        sha,
        branch
      })
    });

    if (res.ok) {
      return { success: true };
    } else {
      const err = await res.json();
      return { success: false, error: err.message || 'Lỗi khi xóa file trên GitHub' };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi mạng khi xóa file trên GitHub' };
  }
}

// --- DOCUMENTS LIST HELPERS ---
export function getDocumentsList(): MedicalDocument[] {
  try {
    const data = localStorage.getItem(DOCUMENTS_LIST_KEY);
    if (!data) {
      localStorage.setItem(DOCUMENTS_LIST_KEY, JSON.stringify(INITIAL_DOCUMENTS));
      return INITIAL_DOCUMENTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_DOCUMENTS;
  }
}

export function saveDocumentsList(docs: MedicalDocument[]): void {
  localStorage.setItem(DOCUMENTS_LIST_KEY, JSON.stringify(docs));
  triggerDocsUpdateEvent();
  docs.forEach(docItem => {
    setDoc(doc(db, 'medicalDocuments', docItem.id), docItem, { merge: true }).catch(() => {});
  });
}

export function saveSingleDocument(docItem: MedicalDocument): void {
  const current = getDocumentsList();
  const index = current.findIndex(d => d.id === docItem.id);
  let updated: MedicalDocument[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = docItem;
  } else {
    updated = [docItem, ...current];
  }
  saveDocumentsList(updated);
}

export function deleteDocumentItem(docId: string): void {
  const current = getDocumentsList();
  const updated = current.filter(d => d.id !== docId);
  saveDocumentsList(updated);
  deleteDoc(doc(db, 'medicalDocuments', docId)).catch(() => {});
}

export function subscribeDocuments(callback: () => void) {
  window.addEventListener(DOCUMENTS_EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(DOCUMENTS_EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}
