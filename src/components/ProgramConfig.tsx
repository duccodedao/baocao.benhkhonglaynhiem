import React from 'react';
import { Sliders, Plus, CheckCircle2, Sparkles, FileSpreadsheet, ShieldAlert } from 'lucide-react';

export const ProgramConfig: React.FC = () => {
  const programs = [
    {
      code: 'TANG_HUYET_AP',
      name: 'Chương trình Quản lý Tăng huyết áp',
      sheet: 'Tăng Huyết Áp',
      columnsCount: 8,
      diseaseCount: 5,
      status: 'Kích hoạt triển khai',
      active: true,
      iconColor: 'bg-blue-600'
    },
    {
      code: 'DAI_THAO_DUONG',
      name: 'Chương trình Quản lý Đái tháo đường',
      sheet: 'Đái Tháo Đường',
      columnsCount: 8,
      diseaseCount: 5,
      status: 'Kích hoạt triển khai',
      active: true,
      iconColor: 'bg-amber-600'
    },
    {
      code: 'UNG_THU',
      name: 'Chương trình Phòng chống Ung thư',
      sheet: 'Ung Thư',
      columnsCount: 8,
      diseaseCount: 14,
      status: 'Kích hoạt triển khai',
      active: true,
      iconColor: 'bg-rose-600'
    },
    {
      code: 'COPD',
      name: 'Chương trình Quản lý COPD',
      sheet: 'COPD',
      columnsCount: 8,
      diseaseCount: 2,
      status: 'Sẵn sàng mở rộng',
      active: false,
      iconColor: 'bg-emerald-600'
    },
    {
      code: 'HEN_PHE_QUAN',
      name: 'Chương trình Quản lý Hen phế quản',
      sheet: 'Hen Phế Quản',
      columnsCount: 8,
      diseaseCount: 2,
      status: 'Sẵn sàng mở rộng',
      active: false,
      iconColor: 'bg-teal-600'
    },
    {
      code: 'IOD',
      name: 'Chương trình Bướu cổ & Thiếu Iốt (IOD)',
      sheet: 'IOD - Bướu Cổ',
      columnsCount: 8,
      diseaseCount: 2,
      status: 'Sẵn sàng mở rộng',
      active: false,
      iconColor: 'bg-indigo-600'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Cấu hình & Mở rộng Chương trình Y tế
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kiến trúc mô-đun linh hoạt cho phép thêm chương trình Tăng huyết áp, Đái tháo đường, COPD... chỉ bằng cấu hình mẫu Sheet Excel
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-rose-950 p-6 rounded-2xl text-white space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Kiến trúc Mô-đun Chuẩn hóa</span>
        </div>
        <h3 className="text-lg font-bold">Dễ dàng bổ sung Chương trình Mãn tính mới</h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Hệ thống được thiết kế theo mô hình ProgramTemplate. Bằng cách định nghĩa mẫu danh mục bệnh và ánh xạ tên Sheet Excel, các chương trình sức khỏe cộng đồng khác có thể kích hoạt tức thì mà không cần thay đổi source code core.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map(prog => (
          <div
            key={prog.code}
            className={`p-5 rounded-2xl border transition-all ${
              prog.active
                ? 'bg-white dark:bg-slate-900 border-rose-500/40 shadow-md ring-1 ring-rose-500/20'
                : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${prog.iconColor} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{prog.name}</h4>
                  <p className="text-xs text-slate-500">Mã Sheet Excel: "{prog.sheet}"</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                prog.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {prog.status}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <p className="text-slate-400 text-[11px]">Danh mục theo dõi</p>
                <p className="font-bold">{prog.diseaseCount} nhóm/bệnh</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Số cột dữ liệu</p>
                <p className="font-bold">{prog.columnsCount} cột chỉ số</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
