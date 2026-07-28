import React, { useState } from 'react';
import { parseExcelFile, ExcelImportResult, ParsedExcelRow } from '../services/excelImporter';
import { getDiseases, saveDiseases, getReportByPeriod, saveReport, getUnitConfig } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { ReportWithDetails, ReportDetail, DiseaseMaster } from '../types';
import {
  FileUp,
  Upload,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  FileSpreadsheet,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';

interface ExcelImportModalProps {
  onSuccess: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const unitConfig = getUnitConfig();

  // Step 1: Select Month / Year
  const [month, setMonth] = useState<number>(5); // Default May
  const [year, setYear] = useState<number>(2026);

  // Step 2: Selected File
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Step 3: Available Sheets & Selected Sheet
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('Ung Thư');

  // Step 4: Import state
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelImportResult | null>(null);

  // Unknown Disease resolution state
  const [newDiseaseNameInput, setNewDiseaseNameInput] = useState('');
  const [unknownModalDisease, setUnknownModalDisease] = useState<string | null>(null);

  // Duplicate report resolution modal
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // File selection handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);

    try {
      const currentDiseases = getDiseases();
      const res = await parseExcelFile(file, undefined, currentDiseases);
      setAvailableSheets(res.availableSheets);
      setSelectedSheet(res.sheetName);
      setParseResult(res);
    } catch (err: any) {
      alert(`Lỗi đọc file Excel: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  // Re-parse when sheet selection changes
  const handleSheetChange = async (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (!selectedFile) return;

    setIsParsing(true);
    try {
      const currentDiseases = getDiseases();
      const res = await parseExcelFile(selectedFile, sheetName, currentDiseases);
      setParseResult(res);
    } catch (err: any) {
      alert(`Lỗi đọc Sheet ${sheetName}: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  // Add missing disease dynamically
  const handleAddNewDisease = (diseaseName: string) => {
    const currentDiseases = getDiseases();
    const newDisease: DiseaseMaster = {
      id: `dis_custom_${Date.now()}`,
      code: `C_NEW_${currentDiseases.length + 1}`,
      name: diseaseName,
      category: 'Ung thư',
      order: currentDiseases.length + 1,
      active: true,
      createdAt: new Date().toISOString()
    };

    const updatedCatalog = [...currentDiseases, newDisease];
    saveDiseases(updatedCatalog, {
      email: user?.email || 'user@tramyte.gov.vn',
      name: user?.displayName || 'Cán bộ Y tế'
    });

    // Refresh parse result with new catalog
    if (selectedFile) {
      parseExcelFile(selectedFile, selectedSheet, updatedCatalog).then(res => {
        setParseResult(res);
      });
    }

    setUnknownModalDisease(null);
    setNewDiseaseNameInput('');
  };

  // Step 4: Click Import Button
  const handleStartImportClick = () => {
    if (!parseResult || parseResult.parsedRows.length === 0) {
      alert('Không có dữ liệu hợp lệ để import!');
      return;
    }

    // Check if month report exists
    const existing = getReportByPeriod(month, year);
    if (existing) {
      setShowDuplicateModal(true);
    } else {
      executeImport('CREATE');
    }
  };

  const executeImport = (mode: 'CREATE' | 'UPDATE' | 'OVERWRITE') => {
    if (!parseResult) return;

    const reportId = `rep_${year}_${month.toString().padStart(2, '0')}`;
    const allDiseases = getDiseases();

    // Map parsed rows to ReportDetail items
    const detailsMap = new Map<string, ParsedExcelRow>();
    parseResult.parsedRows.forEach(row => {
      if (row.matchedDiseaseId) {
        detailsMap.set(row.matchedDiseaseId, row);
      }
    });

    const formattedDetails: ReportDetail[] = allDiseases.map((dis, idx) => {
      const row = detailsMap.get(dis.id);
      return {
        id: `det_${reportId}_${dis.id}`,
        reportId: reportId,
        diseaseId: dis.id,
        diseaseName: dis.name,
        newCase: row?.newCase || 0,
        totalCase: row?.totalCase || 0,
        death: row?.death || 0,
        totalDeath: row?.totalDeath || 0,
        stopTreatment: row?.stopTreatment || 0,
        currentManagement: row?.currentManagement || 0,
        note: row?.note || ''
      };
    });

    const reportObj: ReportWithDetails = {
      id: reportId,
      unitName: unitConfig.unitName,
      month,
      year,
      createdDate: new Date().toISOString(),
      createdBy: user?.displayName || 'Import từ Excel',
      updatedAt: new Date().toISOString(),
      updatedBy: user?.displayName || 'Import từ Excel',
      isLocked: false,
      programCode: 'UNG_THU',
      note: `Import tự động từ file ${selectedFile?.name || ''} (Sheet: ${selectedSheet})`,
      details: formattedDetails
    };

    saveReport(reportObj, mode, {
      email: user?.email || 'user@tramyte.gov.vn',
      name: user?.displayName || 'Import từ Excel'
    });

    setShowDuplicateModal(false);
    alert(`Đã import thành công Báo cáo Tháng ${month.toString().padStart(2, '0')}/${year}!`);
    onSuccess();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileUp className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Import Báo cáo Ung thư từ File Excel
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống tự động nhận diện cấu trúc Sheet "Ung Thư" và đối chiếu danh mục bệnh chuẩn
          </p>
        </div>
      </div>

      {/* 4-Step Wizard Container */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Step 1: Select Month & Year */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-xs font-black">1</span>
            <span>Bước 1: Chọn Kỳ Báo cáo (Tháng / Năm)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg pl-8">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tháng
              </label>
              <select
                value={month}
                onChange={e => setMonth(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>Tháng {m.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Năm
              </label>
              <select
                value={year}
                onChange={e => setYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              >
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>Năm {y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* Step 2: File Selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-xs font-black">2</span>
            <span>Bước 2: Tải lên File Excel (.xlsx, .xls)</span>
          </div>

          <div className="pl-8">
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
              <Upload className="w-8 h-8 text-rose-500 mb-2" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {selectedFile ? selectedFile.name : 'Bấm để chọn File Excel từ máy tính'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Hỗ trợ định dạng .XLSX hoặc .XLS theo mẫu chuẩn Trạm Y tế
              </p>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Step 3 & 4 (When file is selected) */}
        {selectedFile && (
          <>
            <div className="border-t border-slate-100 dark:border-slate-800" />

            {/* Step 3: Choose Sheet */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-xs font-black">3</span>
                <span>Bước 3: Chọn Sheet chứa dữ liệu Ung thư</span>
              </div>

              <div className="pl-8 flex flex-wrap gap-2">
                {availableSheets.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSheetChange(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedSheet === s
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Sheet: {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Preview & Execute */}
            {parseResult && (
              <>
                <div className="border-t border-slate-100 dark:border-slate-800" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-xs font-black">4</span>
                      <span>Bước 4: Kiểm tra và Nhấn Import</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                        Khớp chuẩn: {parseResult.matchedCount} bệnh
                      </span>

                      {parseResult.unknownDiseases.length > 0 && (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full">
                          Chưa có trong danh mục: {parseResult.unknownDiseases.length} bệnh
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unknown Diseases Alert Banner */}
                  {parseResult.unknownDiseases.length > 0 && (
                    <div className="ml-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 space-y-2">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                        <AlertCircle className="w-4 h-4" />
                        <span>Phát hiện tên bệnh chưa có trong Danh mục Hệ thống:</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {parseResult.unknownDiseases.map((uDis, uIdx) => (
                          <div
                            key={uIdx}
                            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-xs text-slate-900 dark:text-white font-medium"
                          >
                            <span>Khuyết: <strong>{uDis}</strong></span>
                            <button
                              onClick={() => {
                                setUnknownModalDisease(uDis);
                                setNewDiseaseNameInput(uDis);
                              }}
                              className="text-rose-600 hover:text-rose-700 font-bold underline text-[11px] ml-1"
                            >
                              + Thêm bệnh mới
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Data Rows Preview Grid */}
                  <div className="ml-8 overflow-x-auto max-h-80 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white">
                        <tr>
                          <th className="p-2.5">Tên bệnh (File Excel)</th>
                          <th className="p-2.5">Đối chiếu Danh mục</th>
                          <th className="p-2.5 text-right">Mắc mới</th>
                          <th className="p-2.5 text-right">Tích lũy</th>
                          <th className="p-2.5 text-right">Số chết</th>
                          <th className="p-2.5 text-right">Chết TL</th>
                          <th className="p-2.5 text-right">Quản lý HT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parseResult.parsedRows.map((r, idx) => (
                          <tr key={idx} className={r.isUnknownDisease ? 'bg-amber-50/50 dark:bg-amber-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}>
                            <td className="p-2.5 font-bold text-slate-900 dark:text-white">{r.diseaseNameRaw}</td>
                            <td className="p-2.5">
                              {r.isUnknownDisease ? (
                                <span className="text-amber-600 font-bold text-[11px]">Chưa khớp</span>
                              ) : (
                                <span className="text-emerald-600 font-bold text-[11px]">✓ {r.matchedDiseaseName}</span>
                              )}
                            </td>
                            <td className="p-2.5 text-right font-bold text-rose-600">{r.newCase}</td>
                            <td className="p-2.5 text-right font-medium">{r.totalCase}</td>
                            <td className="p-2.5 text-right font-medium">{r.death}</td>
                            <td className="p-2.5 text-right font-medium">{r.totalDeath}</td>
                            <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">{r.currentManagement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Final Execute Import Button */}
                  <div className="pl-8 pt-3">
                    <button
                      onClick={handleStartImportClick}
                      className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>XÁC NHẬN IMPORT BÁO CÁO THÁNG {month.toString().padStart(2, '0')}/{year}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

      </div>

      {/* MODAL 1: DYNAMICALLY ADD UNKNOWN DISEASE */}
      {unknownModalDisease && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-rose-600" />
                <span>Thêm Bệnh Ung thư Mới vào Danh mục</span>
              </h3>
              <button onClick={() => setUnknownModalDisease(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Phát hiện tên bệnh <strong>"{unknownModalDisease}"</strong> trong file Excel nhưng chưa có trong danh mục 49 bệnh ung thư gốc. Bấm "Thêm ngay" để lưu vào danh mục hệ thống.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tên bệnh chính thức
              </label>
              <input
                type="text"
                value={newDiseaseNameInput}
                onChange={e => setNewDiseaseNameInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setUnknownModalDisease(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Bỏ qua
              </button>
              <button
                onClick={() => handleAddNewDisease(newDiseaseNameInput)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Thêm ngay & Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DUPLICATE REPORT PROMPT (OVERWRITE / UPDATE / CANCEL) */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Đã tồn tại Báo cáo Tháng {month.toString().padStart(2, '0')}/{year}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Tháng {month.toString().padStart(2, '0')}/{year} đã có dữ liệu lưu trong hệ thống. Vui lòng chọn hành động mong muốn:
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => executeImport('OVERWRITE')}
                className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 transition-all group"
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600">
                  ○ Ghi đè (Overwrite)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Thay thế toàn bộ số liệu báo cáo cũ bằng file Excel mới.
                </p>
              </button>

              <button
                onClick={() => executeImport('UPDATE')}
                className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition-all group"
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                  ○ Cập nhật (Update)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cập nhật bổ sung dữ liệu giữ nguyên thời điểm khởi tạo.
                </p>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
