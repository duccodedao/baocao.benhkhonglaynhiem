import * as XLSX from 'xlsx';
import { ReportDetail, DiseaseMaster } from '../types';

export interface ParsedExcelRow {
  diseaseNameRaw: string;
  matchedDiseaseId?: string;
  matchedDiseaseName?: string;
  newCase: number;
  totalCase: number;
  death: number;
  totalDeath: number;
  stopTreatment: number;
  currentManagement: number;
  note: string;
  isUnknownDisease: boolean;
}

export interface ExcelImportResult {
  sheetName: string;
  availableSheets: string[];
  parsedRows: ParsedExcelRow[];
  unknownDiseases: string[];
  matchedCount: number;
}

// Vietnamese text normalization helper for fuzzy disease matching
export function normalizeVietnamese(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds the best match for a disease name from a list of targets.
 * Prioritizes exact matches, then shortest length difference for partial matches.
 */
export function findBestMatch(input: string, targets: string[]): string | null {
  const normInput = normalizeVietnamese(input);
  if (!normInput) return null;

  // 1. Exact match (normalized)
  for (const t of targets) {
    if (normalizeVietnamese(t) === normInput) return t;
  }

  // 2. Starts with / Ends with matches
  // Only consider if input is reasonably long or starts with exactly the same words
  const partialMatches = targets.filter(t => {
    const nt = normalizeVietnamese(t);
    
    // Strict prefix match: if input is short, require word boundary or very close length
    if (normInput.length < 5) {
      return nt === normInput || nt.startsWith(normInput + ' ');
    }
    
    return nt.startsWith(normInput) || normInput.startsWith(nt);
  });

  if (partialMatches.length > 0) {
    // Pick the one with the smallest length difference
    return partialMatches.reduce((best, curr) => {
      const bestDiff = Math.abs(normalizeVietnamese(best).length - normInput.length);
      const currDiff = Math.abs(normalizeVietnamese(curr).length - normInput.length);
      return currDiff < bestDiff ? curr : best;
    });
  }

  // 3. Contains matches
  const containsMatches = targets.filter(t => {
    const nt = normalizeVietnamese(t);
    // Again, be stricter if input is short
    if (normInput.length < 5) return false;
    return nt.includes(normInput) || normInput.includes(nt);
  });

  if (containsMatches.length > 0) {
    return containsMatches.reduce((best, curr) => {
      const bestDiff = Math.abs(normalizeVietnamese(best).length - normInput.length);
      const currDiff = Math.abs(normalizeVietnamese(curr).length - normInput.length);
      return currDiff < bestDiff ? curr : best;
    });
  }

  return null;
}

export async function parseExcelFile(
  file: File,
  targetSheetName?: string,
  existingDiseases: DiseaseMaster[] = []
): Promise<ExcelImportResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const availableSheets = workbook.SheetNames;
  
  // Try to find target sheet, default to 'Ung Thư', 'Ung thu', 'Sheet1', or first sheet
  let selectedSheetName = targetSheetName || availableSheets.find(s => 
    s.toLowerCase().includes('ung thư') || s.toLowerCase().includes('ung thu')
  ) || availableSheets[0];

  const worksheet = workbook.Sheets[selectedSheetName];
  if (!worksheet) {
    throw new Error(`Không tìm thấy Sheet "${selectedSheetName}" trong file Excel.`);
  }

  // Convert worksheet to 2D array matrix of raw cells
  const matrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  // Locate the header row by searching for "Tên bệnh" or "Bệnh" or "Chẩn đoán"
  let headerRowIndex = -1;
  let colIndexes = {
    diseaseName: -1,
    newCase: -1,
    totalCase: -1,
    death: -1,
    totalDeath: -1,
    stopTreatment: -1,
    currentManagement: -1,
    note: -1,
  };

  const isHeaderRow = (row: any[]) => {
    const rowStr = row.map(cell => String(cell || '').trim().toLowerCase()).join(' ');
    return rowStr.includes('tên bệnh') && rowStr.includes('số mắc');
  };

  for (let r = 0; r < Math.min(matrix.length, 25); r++) {
    const row = matrix[r] || [];
    
    // Check for exact headers or strongly matched header row
    if (isHeaderRow(row)) {
      headerRowIndex = r;
      // Map columns
      for (let c = 0; c < row.length; c++) {
        const rawVal = normalizeVietnamese(String(row[c] || ''));
        const val = rawVal.replace(/\s+/g, ''); // Remove spaces for stable column matching
        
        if (val.includes('tenbenh') || val.includes('loaibenh') || val.includes('benh')) colIndexes.diseaseName = c;
        else if (val.includes('mactichluy') || val.includes('mactichlu')) colIndexes.totalCase = c;
        else if (val.includes('chettichluy') || val.includes('chettichlu')) colIndexes.totalDeath = c;
        else if (val.includes('somacmoi') || val.includes('macmoi') || val.includes('somacmo') || (val.includes('somac') && !val.includes('tichluy'))) colIndexes.newCase = c;
        else if ((val.includes('sochet') || val.includes('chet') || val.includes('tuvong')) && !val.includes('tichluy')) colIndexes.death = c;
        else if (val.includes('ngungdieutri') || val.includes('khongtieptuc') || val.includes('ngungdie') || val.includes('ngungdieu')) colIndexes.stopTreatment = c;
        else if (val.includes('quanlyhientai') || val.includes('quanly') || val.includes('quanlyhie')) colIndexes.currentManagement = c;
        else if (val.includes('ghichu') || val.includes('note') || val === 'ghi') colIndexes.note = c;
      }
      break;
    }
  }

  // Fallback to old logic if not found
  if (headerRowIndex === -1) {
    // ... (keep the original scanning logic as fallback)
    for (let r = 0; r < Math.min(matrix.length, 25); r++) {
      const row = matrix[r] || [];
      for (let c = 0; c < row.length; c++) {
        const cellVal = String(row[c] || '').trim().toLowerCase();
        if (cellVal.includes('tên bệnh') || cellVal.includes('loại bệnh') || cellVal === 'bệnh' || cellVal.includes('ung thư') || cellVal.includes('tên bệnh/loại bệnh')) {
          headerRowIndex = r;
          colIndexes.diseaseName = c;
          break;
        }
      }
      if (headerRowIndex !== -1) break;
    }
    
    // Scan for columns
    const scanRows = [matrix[headerRowIndex !== -1 ? headerRowIndex : 0]].filter(Boolean);
    for (const sRow of scanRows) {
      for (let c = 0; c < sRow.length; c++) {
        const rawVal = normalizeVietnamese(String(sRow[c] || ''));
        const val = rawVal.replace(/\s+/g, '');
        
        if (val.includes('tenbenh') || val.includes('loaibenh') || val === 'benh' || val.includes('ungthu')) {
          if (colIndexes.diseaseName === -1) colIndexes.diseaseName = c;
        } else if (val.includes('chettichluy') || val.includes('tuvongtichluy')) {
          if (colIndexes.totalDeath === -1) colIndexes.totalDeath = c;
        } else if (val.includes('mactichluy') || val.includes('mactong') || val.includes('tichluy')) {
          if (colIndexes.totalCase === -1) colIndexes.totalCase = c;
        } else if (val.includes('somac') || (val === 'mac' && !val.includes('tichluy')) || val.includes('macmoi')) {
          if (colIndexes.newCase === -1) colIndexes.newCase = c;
        } else if (val.includes('sochet') || (val.includes('chet') && !val.includes('tichluy')) || (val.includes('tuvong') && !val.includes('tichluy'))) {
          if (colIndexes.death === -1) colIndexes.death = c;
        } else if (val.includes('khongtieptuc') || val.includes('ngungdieutri') || val.includes('botrieu')) {
          if (colIndexes.stopTreatment === -1) colIndexes.stopTreatment = c;
        } else if (val.includes('quanlyhientai') || val.includes('dangquanly') || val.includes('quanly')) {
          if (colIndexes.currentManagement === -1) colIndexes.currentManagement = c;
        } else if (val.includes('ghichu') || val.includes('note')) {
          if (colIndexes.note === -1) colIndexes.note = c;
        }
      }
    }
  }
  
  console.log('Detected colIndexes:', colIndexes);

  // Fallback defaults if columns weren't fuzzy detected
  if (colIndexes.diseaseName === -1) colIndexes.diseaseName = 0; // Col A
  if (colIndexes.newCase === -1) colIndexes.newCase = 1;         // Col B
  if (colIndexes.totalCase === -1) colIndexes.totalCase = 2;       // Col C
  if (colIndexes.death === -1) colIndexes.death = 3;           // Col D
  if (colIndexes.totalDeath === -1) colIndexes.totalDeath = 4;      // Col E
  if (colIndexes.stopTreatment === -1) colIndexes.stopTreatment = 5; // Col F
  if (colIndexes.currentManagement === -1) colIndexes.currentManagement = 6; // Col G
  if (colIndexes.note === -1) colIndexes.note = 7;             // Col H

  const startDataRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 0;
  const parsedRows: ParsedExcelRow[] = [];
  const unknownDiseasesSet = new Set<string>();

  const parseNum = (val: any): number => {
    if (typeof val === 'number') return Math.round(val);
    const str = String(val).trim();
    if (!str) return 0;
    
    // Vietnamese format: 1.000 (thousand) and 1,5 (decimal)
    // Remove thousands separators (.), replace decimal comma with dot
    const cleaned = str.replace(/\./g, '').replace(/,/g, '.');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : Math.round(n);
  };

  for (let r = startDataRow; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row) continue;

    const rawDiseaseName = String(row[colIndexes.diseaseName] || '').trim();
    
    if (!rawDiseaseName || rawDiseaseName.toLowerCase().startsWith('tổng') || rawDiseaseName.toLowerCase().startsWith('cong')) {
      continue;
    }

    // Try matching with master disease catalog
    const matchedName = findBestMatch(rawDiseaseName, existingDiseases.map(d => d.name));
    const matched = matchedName ? existingDiseases.find(d => d.name === matchedName) : null;

    const isUnknown = !matched;
    if (isUnknown) {
      unknownDiseasesSet.add(rawDiseaseName);
    }

    parsedRows.push({
      diseaseNameRaw: rawDiseaseName,
      matchedDiseaseId: matched?.id,
      matchedDiseaseName: matched ? matched.name : rawDiseaseName,
      newCase: parseNum(row[colIndexes.newCase]),
      totalCase: parseNum(row[colIndexes.totalCase]),
      death: parseNum(row[colIndexes.death]),
      totalDeath: parseNum(row[colIndexes.totalDeath]),
      stopTreatment: parseNum(row[colIndexes.stopTreatment]),
      currentManagement: parseNum(row[colIndexes.currentManagement]),
      note: String(row[colIndexes.note] || '').trim(),
      isUnknownDisease: isUnknown
    });
  }

  const unknownDiseases = Array.from(unknownDiseasesSet);
  const matchedCount = parsedRows.length - unknownDiseases.length;

  return {
    sheetName: selectedSheetName,
    availableSheets,
    parsedRows,
    unknownDiseases,
    matchedCount
  };
}
