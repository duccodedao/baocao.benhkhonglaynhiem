import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  createdAt: string; // ISO string
  updatedAt?: string;
  isDeleted?: boolean; // Soft delete flag
  deletedAt?: string;
  authorEmail?: string;
  authorName?: string;
  pinned?: boolean;
}

const STORAGE_KEY = 'yt_system_notifications_v1';
const READ_IDS_KEY = 'yt_read_notification_ids_v1';
const EVENT_NAME = 'yt_notifications_updated';

const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('yt_notifications_realtime') : null;

if (broadcastChannel) {
  broadcastChannel.onmessage = () => {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  };
}

const DEFAULT_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'n-1',
    title: 'Hệ thống báo cáo sẵn sàng cho kỳ mới 2026',
    content: 'Dữ liệu các chương trình NCD và Báo cáo Bộ Y tế (Thông tư 27/2019/TT-BYT) đã sẵn sàng nhập liệu. Vui lòng các Trạm Y tế rà soát danh sách đối tượng và chốt số liệu báo cáo định kỳ đúng hạn.',
    type: 'info',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    authorEmail: 'admin@soyte.gov.vn',
    authorName: 'Ban Chỉ Đạo NCD'
  },
  {
    id: 'n-2',
    title: 'Nhắc nhở hạn nộp Báo cáo định kỳ tháng',
    content: 'Báo cáo định kỳ tháng hiện tại sẽ khóa chỉnh sửa tự động vào ngày 25 hàng tháng. Các Trạm Y tế chưa hoàn thành báo cáo vui lòng kiểm tra và gửi báo cáo chính thức.',
    type: 'warning',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    authorEmail: 'admin@soyte.gov.vn',
    authorName: 'Phòng Kế hoạch Nghiệp vụ'
  },
  {
    id: 'n-3',
    title: 'Cập nhật Chế độ xem báo cáo công khai (Preview Mode)',
    content: 'Tính năng Preview Mode đã được tích hợp với tùy chọn bảo vệ bằng Passcode. Ban Chỉ đạo có thể chia sẻ link công khai cho các đơn vị cấp trên xem báo cáo trực tiếp.',
    type: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    authorEmail: 'admin@soyte.gov.vn',
    authorName: 'Tổ Quản trị Hệ thống'
  }
];

function triggerUpdateEvent() {
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'UPDATE' });
    } catch {}
  }
}

// REALTIME FIRESTORE LISTENERS FOR CROSS-DEVICE SYNC
let isFirestoreInitialized = false;

export function initNotificationFirestoreRealtime() {
  if (isFirestoreInitialized) return;
  isFirestoreInitialized = true;

  try {
    // 1. Sync notifications collection from Firestore
    const notifCol = collection(db, 'systemNotifications');
    onSnapshot(notifCol, (snapshot) => {
      if (!snapshot.empty) {
        const remoteNotifs: SystemNotification[] = [];
        snapshot.forEach((docSnap) => {
          remoteNotifs.push(docSnap.data() as SystemNotification);
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteNotifs));
        triggerUpdateEvent();
      } else {
        // Seed default if empty on first setup
        DEFAULT_NOTIFICATIONS.forEach(n => {
          setDoc(doc(db, 'systemNotifications', n.id), n, { merge: true }).catch(() => {});
        });
      }
    }, (err) => {
      console.warn('Realtime notifications Firestore listener notice:', err);
    });

    // 2. Sync read status from Firestore
    const readCol = collection(db, 'readNotifications');
    onSnapshot(readCol, (snapshot) => {
      const readIdsSet = new Set<string>();
      snapshot.forEach(docSnap => {
        readIdsSet.add(docSnap.id);
      });
      if (snapshot.size > 0) {
        localStorage.setItem(READ_IDS_KEY, JSON.stringify(Array.from(readIdsSet)));
        triggerUpdateEvent();
      }
    }, (err) => {
      console.warn('Realtime notification reads Firestore listener notice:', err);
    });
  } catch (err) {
    console.warn('Firestore notification sync init notice:', err);
  }
}

// Initialize on module load
initNotificationFirestoreRealtime();

// Get all non-deleted notifications
export function getActiveNotifications(): SystemNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    const parsed: SystemNotification[] = JSON.parse(raw);
    return parsed.filter(n => !n.isDeleted).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error reading notifications', err);
    return DEFAULT_NOTIFICATIONS;
  }
}

// Get all notifications (including deleted) for Admin History / Trash
export function getAllNotificationsForAdmin(): SystemNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    const parsed: SystemNotification[] = JSON.parse(raw);
    return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    return DEFAULT_NOTIFICATIONS;
  }
}

// Get Trash notifications
export function getTrashNotifications(): SystemNotification[] {
  const all = getAllNotificationsForAdmin();
  return all.filter(n => n.isDeleted);
}

// Save all notifications list and sync to Firestore
function saveAllNotifications(list: SystemNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  triggerUpdateEvent();
}

// Sync single notification to Firestore
async function syncNotifDocToFirestore(notif: SystemNotification) {
  try {
    await setDoc(doc(db, 'systemNotifications', notif.id), notif, { merge: true });
  } catch (e) {
    console.warn('Firestore sync notification notice:', e);
  }
}

// Delete notification doc from Firestore
async function deleteNotifDocFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'systemNotifications', id));
  } catch (e) {
    console.warn('Firestore delete notification notice:', e);
  }
}

// Create new notification
export function createNotification(
  title: string,
  content: string,
  type: SystemNotification['type'] = 'info',
  authorEmail?: string,
  authorName?: string
): SystemNotification {
  const all = getAllNotificationsForAdmin();
  const newNotif: SystemNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: title.trim(),
    content: content.trim(),
    type,
    createdAt: new Date().toISOString(),
    authorEmail: authorEmail || 'admin@soyte.gov.vn',
    authorName: authorName || 'Quản trị viên',
    isDeleted: false
  };
  const updated = [newNotif, ...all];
  saveAllNotifications(updated);
  syncNotifDocToFirestore(newNotif);
  return newNotif;
}

// Update existing notification
export function updateNotification(
  id: string,
  data: Partial<Pick<SystemNotification, 'title' | 'content' | 'type'>>
) {
  const all = getAllNotificationsForAdmin();
  let updatedObj: SystemNotification | null = null;
  const updated = all.map(n => {
    if (n.id === id) {
      updatedObj = {
        ...n,
        ...data,
        updatedAt: new Date().toISOString()
      };
      return updatedObj;
    }
    return n;
  });
  saveAllNotifications(updated);
  if (updatedObj) {
    syncNotifDocToFirestore(updatedObj);
  }
}

// Soft Delete (move to Trash)
export function deleteNotification(id: string) {
  const all = getAllNotificationsForAdmin();
  let updatedObj: SystemNotification | null = null;
  const updated = all.map(n => {
    if (n.id === id) {
      updatedObj = {
        ...n,
        isDeleted: true,
        deletedAt: new Date().toISOString()
      };
      return updatedObj;
    }
    return n;
  });
  saveAllNotifications(updated);
  if (updatedObj) {
    syncNotifDocToFirestore(updatedObj);
  }
}

// Restore from Trash
export function restoreNotification(id: string) {
  const all = getAllNotificationsForAdmin();
  let updatedObj: SystemNotification | null = null;
  const updated = all.map(n => {
    if (n.id === id) {
      updatedObj = {
        ...n,
        isDeleted: false,
        deletedAt: undefined
      };
      return updatedObj;
    }
    return n;
  });
  saveAllNotifications(updated);
  if (updatedObj) {
    syncNotifDocToFirestore(updatedObj);
  }
}

// Permanent Delete
export function permanentlyDeleteNotification(id: string) {
  const all = getAllNotificationsForAdmin();
  const updated = all.filter(n => n.id !== id);
  saveAllNotifications(updated);
  deleteNotifDocFromFirestore(id);
}

// READ IDs STORAGE
export function getReadNotificationIds(): string[] {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markNotificationAsRead(id: string) {
  const readIds = getReadNotificationIds();
  if (!readIds.includes(id)) {
    const updated = [...readIds, id];
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(updated));
    triggerUpdateEvent();
    setDoc(doc(db, 'readNotifications', id), { readAt: new Date().toISOString() }, { merge: true }).catch(() => {});
  }
}

export function markAllNotificationsAsRead() {
  const active = getActiveNotifications();
  const allIds = active.map(n => n.id);
  localStorage.setItem(READ_IDS_KEY, JSON.stringify(allIds));
  triggerUpdateEvent();
  allIds.forEach(id => {
    setDoc(doc(db, 'readNotifications', id), { readAt: new Date().toISOString() }, { merge: true }).catch(() => {});
  });
}

// Custom hook helper listener
export function subscribeNotifications(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}
