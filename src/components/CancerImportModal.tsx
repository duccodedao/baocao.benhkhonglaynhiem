import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { CANCER_TYPES } from '../constants/cancerTypes';
import { parseExcelFile, ExcelImportResult } from '../services/excelImporter';
import { getDiseases } from '../services/storage';
import {
  FileUp,
  Upload,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  X,
  Download
} from 'lucide-react';
import { DiseaseMaster } from '../types';

interface CancerImportModalProps {
  onImport: (parsedData: Record<string, any>) => void;
  onClose: () => void;
}

export const CancerImportModal: React.FC<CancerImportModalProps> = ({ onImport, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelImportResult | null>(null);

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(CANCER_TYPES.map(type => ({ 
        "Tên bệnh/Loại bệnh": type, 
        "Số mắc mới": 0, 
        "Mắc tích lũy": 0, 
        "Số chết": 0, 
        "Chết tích lũy": 0, 
        "Ngừng điều trị": 0, 
        "Quản lý hiện tại": 0, 
        "Ghi chú": "" 
      })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Phụ lục");
    XLSX.writeFile(wb, "Template_UngThu.xlsx");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);

    try {
      // Create a search space primarily focused on CANCER_TYPES for this specific import
      const cancerDiseases: DiseaseMaster[] = CANCER_TYPES.map(name => ({
        id: name,
        code: name,
        name: name,
        category: 'Cancer',
        order: 0,
        active: true,
        createdAt: new Date().toISOString()
      }));
      
      const res = await parseExcelFile(file, undefined, cancerDiseases);
      setAvailableSheets(res.availableSheets);
      setSelectedSheet(res.sheetName);
      setParseResult(res);
    } catch (err: any) {
      alert(`Lỗi đọc file Excel: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleStartImportClick = () => {
    if (!parseResult) return;

    const cancerDetails: Record<string, any> = {};
    parseResult.parsedRows.forEach(row => {
      const diseaseName = row.matchedDiseaseName || row.diseaseNameRaw;
      cancerDetails[diseaseName] = {
        mac: row.newCase,
        macTichLuy: row.totalCase,
        chet: row.death,
        chetTichLuy: row.totalDeath,
        ngungDieuTri: row.stopTreatment,
        quanLyHienTai: row.currentManagement,
        note: row.note
      };
    });

    onImport(cancerDetails);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileUp className="w-5 h-5 text-rose-600" />
            <span>Import Phụ lục Ung thư</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center text-sm">
           <p className="text-slate-600 dark:text-slate-400">Chọn file Excel để import dữ liệu ung thư.</p>
           <button onClick={downloadTemplate} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-100 transition-colors">
             <Download className="w-4 h-4" />
             Tải file mẫu
           </button>
        </div>

        <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
          <Upload className="w-8 h-8 text-rose-500 mb-2" />
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {selectedFile ? selectedFile.name : 'Bấm để chọn File Excel'}
          </p>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="hidden" />
        </label>

        {parseResult && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500">
              Đã khớp {parseResult.matchedCount} loại bệnh.
              {parseResult.unknownDiseases.length > 0 && (
                <div className="text-rose-600 mt-2">
                  Không khớp {parseResult.unknownDiseases.length} loại bệnh: {parseResult.unknownDiseases.join(', ')}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Hủy</button>
              <button onClick={handleStartImportClick} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs">Import dữ liệu</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
