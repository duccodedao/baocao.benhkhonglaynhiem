import { DiseaseMaster } from '../types';

export interface RawDiseaseItem {
  name: string;
  category: string;
  code: string;
}

export const INITIAL_DISEASES_LIST: RawDiseaseItem[] = [
  // --- TĂNG HUYẾT ÁP ---
  { name: 'Tăng huyết áp độ 1', category: 'Tăng huyết áp', code: 'THA01' },
  { name: 'Tăng huyết áp độ 2', category: 'Tăng huyết áp', code: 'THA02' },
  { name: 'Tăng huyết áp độ 3', category: 'Tăng huyết áp', code: 'THA03' },
  { name: 'Tăng huyết áp có biến chứng tim mạch/thận', category: 'Tăng huyết áp', code: 'THA04' },
  { name: 'Tăng huyết áp chưa phân loại', category: 'Tăng huyết áp', code: 'THA05' },

  // --- ĐÁI THÁO ĐƯỜNG ---
  { name: 'Đái tháo đường Tuýp 2', category: 'Đái tháo đường', code: 'DTD01' },
  { name: 'Đái tháo đường Tuýp 1', category: 'Đái tháo đường', code: 'DTD02' },
  { name: 'Tiền đái tháo đường / Rối loạn dung nạp Glucose', category: 'Đái tháo đường', code: 'DTD03' },
  { name: 'Đái tháo đường thai kỳ', category: 'Đái tháo đường', code: 'DTD04' },
  { name: 'Đái tháo đường có biến chứng', category: 'Đái tháo đường', code: 'DTD05' },

  // --- DANH MỤC 49 BỆNH UNG THƯ chuẩn ---
  { name: 'K Bàng Quang', category: 'Ung thư', code: 'C01' },
  { name: 'K Bóng vater', category: 'Ung thư', code: 'C02' },
  { name: 'K Buồng trứng', category: 'Ung thư', code: 'C03' },
  { name: 'K Cổ tử cung', category: 'Ung thư', code: 'C04' },
  { name: 'K Da', category: 'Ung thư', code: 'C05' },
  { name: 'K Dạ Dày', category: 'Ung thư', code: 'C06' },
  { name: 'K Đại tràng', category: 'Ung thư', code: 'C07' },
  { name: 'K Đầu tụy', category: 'Ung thư', code: 'C08' },
  { name: 'K Dương vật', category: 'Ung thư', code: 'C09' },
  { name: 'K Gan', category: 'Ung thư', code: 'C10' },
  { name: 'K Hạch', category: 'Ung thư', code: 'C11' },
  { name: 'K Hầu họng', category: 'Ung thư', code: 'C12' },
  { name: 'K Hầu mũi', category: 'Ung thư', code: 'C13' },
  { name: 'K Hồi tràng', category: 'Ung thư', code: 'C14' },
  { name: 'K Lưỡi', category: 'Ung thư', code: 'C15' },
  { name: 'K Manh tràng', category: 'Ung thư', code: 'C16' },
  { name: 'K Máu', category: 'Ung thư', code: 'C17' },
  { name: 'K Mũi', category: 'Ung thư', code: 'C18' },
  { name: 'K Não', category: 'Ung thư', code: 'C19' },
  { name: 'K Phổi', category: 'Ung thư', code: 'C20' },
  { name: 'K Ruột', category: 'Ung thư', code: 'C21' },
  { name: 'K Tá tràng', category: 'Ung thư', code: 'C22' },
  { name: 'K Thận', category: 'Ung thư', code: 'C23' },
  { name: 'K Thanh quản', category: 'Ung thư', code: 'C24' },
  { name: 'K Thực quản', category: 'Ung thư', code: 'C25' },
  { name: 'K Tinh hoàn', category: 'Ung thư', code: 'C26' },
  { name: 'K Trực tràng', category: 'Ung thư', code: 'C27' },
  { name: 'K Tuyến giáp', category: 'Ung thư', code: 'C28' },
  { name: 'K Tuyến mang tai', category: 'Ung thư', code: 'C29' },
  { name: 'K Tuyến tiền liệt', category: 'Ung thư', code: 'C30' },
  { name: 'K Vòm họng', category: 'Ung thư', code: 'C31' },
  { name: 'K Võng mạc', category: 'Ung thư', code: 'C32' },
  { name: 'K Vú', category: 'Ung thư', code: 'C33' },
  { name: 'K Xoang hàm', category: 'Ung thư', code: 'C34' },
  { name: 'K Xương', category: 'Ung thư', code: 'C35' },
  { name: 'K Túi mật', category: 'Ung thư', code: 'C36' },
  { name: 'K Âm hộ', category: 'Ung thư', code: 'C37' },
  { name: 'K Hậu môn', category: 'Ung thư', code: 'C38' },
  { name: 'K Tuyến ức', category: 'Ung thư', code: 'C39' },
  { name: 'K Khẩu cái', category: 'Ung thư', code: 'C40' },
  { name: 'K Phúc mạc', category: 'Ung thư', code: 'C41' },
  { name: 'K Nướu hàm dưới', category: 'Ung thư', code: 'C42' },
  { name: 'K Hỗng tràng', category: 'Ung thư', code: 'C43' },
  { name: 'K Đường mật', category: 'Ung thư', code: 'C44' },
  { name: 'K Mô liên kết Đầu-mặt-cổ', category: 'Ung thư', code: 'C45' },
  { name: 'K Màng phổi', category: 'Ung thư', code: 'C46' },
  { name: 'K Thanh môn', category: 'Ung thư', code: 'C47' },
  { name: 'K Niệu quản', category: 'Ung thư', code: 'C48' },
  { name: 'K Khác', category: 'Ung thư', code: 'C49' },

  // --- COPD ---
  { name: 'COPD Nhóm A/B (Nhẹ - Trung bình)', category: 'COPD', code: 'COPD01' },
  { name: 'COPD Nhóm C/D (Nặng / Biến chứng)', category: 'COPD', code: 'COPD02' },

  // --- HEN PHẾ QUẢN ---
  { name: 'Hen phế quản trẻ em', category: 'Hen phế quản', code: 'HEN01' },
  { name: 'Hen phế quản người lớn', category: 'Hen phế quản', code: 'HEN02' },

  // --- IOD ---
  { name: 'Bướu cổ đơn thuần do thiếu Iốt', category: 'IOD', code: 'IOD01' },
  { name: 'Suy giáp do thiếu Iốt', category: 'IOD', code: 'IOD02' }
];

export const INITIAL_DISEASES: DiseaseMaster[] = INITIAL_DISEASES_LIST.map((item, idx) => ({
  id: `dis_${idx + 1}`,
  code: item.code,
  name: item.name,
  category: item.category,
  order: idx + 1,
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z'
}));
