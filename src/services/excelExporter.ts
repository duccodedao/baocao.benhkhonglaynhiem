import ExcelJS from 'exceljs';
import { ReportWithDetails, ReportDetail } from '../types';
import { getUnitConfig } from './storage';

export async function exportReportToExcel(
  report: ReportWithDetails,
  customTitle?: string
): Promise<void> {
  const config = getUnitConfig();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Hệ thống Quản lý Báo cáo Ung thư Trạm Y tế';
  workbook.lastModifiedBy = report.createdBy;
  workbook.created = new Date();

  const sheetName = `Ung Thư T${report.month}-${report.year}`;
  const worksheet = workbook.addWorksheet(sheetName, {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  // Column definitions and widths
  worksheet.columns = [
    { key: 'stt', width: 8 },                 // Col A: STT
    { key: 'diseaseName', width: 35 },        // Col B: Tên bệnh
    { key: 'newCase', width: 14 },            // Col C: Số mắc
    { key: 'totalCase', width: 15 },          // Col D: Mắc tích lũy
    { key: 'death', width: 14 },              // Col E: Số chết
    { key: 'totalDeath', width: 16 },         // Col F: Chết tích lũy
    { key: 'stopTreatment', width: 22 },      // Col G: Không tiếp tục điều trị
    { key: 'currentManagement', width: 20 },  // Col H: Quản lý hiện tại
    { key: 'note', width: 25 },               // Col I: Ghi chú
  ];

  // 1. HEADER UNITS & COUNTRY MOTTO
  worksheet.mergeCells('A1:D1');
  worksheet.getCell('A1').value = config.provinceName.toUpperCase();
  worksheet.getCell('A1').font = { name: 'Times New Roman', size: 10, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:D2');
  worksheet.getCell('A2').value = config.districtName.toUpperCase();
  worksheet.getCell('A2').font = { name: 'Times New Roman', size: 10, bold: true };
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A3:D3');
  worksheet.getCell('A3').value = config.unitName.toUpperCase();
  worksheet.getCell('A3').font = { name: 'Times New Roman', size: 11, bold: true, underline: true };
  worksheet.getCell('A3').alignment = { horizontal: 'center' };

  worksheet.mergeCells('E1:I1');
  worksheet.getCell('E1').value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';
  worksheet.getCell('E1').font = { name: 'Times New Roman', size: 11, bold: true };
  worksheet.getCell('E1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('E2:I2');
  worksheet.getCell('E2').value = 'Độc lập - Tự do - Hạnh phúc';
  worksheet.getCell('E2').font = { name: 'Times New Roman', size: 11, bold: true, underline: true };
  worksheet.getCell('E2').alignment = { horizontal: 'center' };

  worksheet.addRow([]); // Blank row 4

  // 2. MAIN REPORT TITLE
  worksheet.mergeCells('A5:I5');
  const titleText = customTitle || `BÁO CÁO BỆNH UNG THƯ THÁNG ${report.month.toString().padStart(2, '0')} NĂM ${report.year}`;
  const titleCell = worksheet.getCell('A5');
  titleCell.value = titleText;
  titleCell.font = { name: 'Times New Roman', size: 15, bold: true, color: { argb: 'FF002060' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A6:I6');
  const subTitleCell = worksheet.getCell('A6');
  subTitleCell.value = `(Đơn vị báo cáo: ${report.unitName} - Ngày lập: ${new Date(report.createdDate).toLocaleDateString('vi-VN')})`;
  subTitleCell.font = { name: 'Times New Roman', size: 11, italic: true };
  subTitleCell.alignment = { horizontal: 'center' };

  worksheet.addRow([]); // Blank row 7

  // 3. TABLE HEADERS (Row 8)
  const headerRow = worksheet.addRow([
    'STT',
    'Tên bệnh',
    'Số mắc',
    'Mắc tích lũy',
    'Số chết',
    'Chết tích lũy',
    'Không tiếp tục điều trị',
    'Quản lý hiện tại',
    'Ghi chú'
  ]);

  headerRow.height = 32;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6EEF8' } // Soft professional blue fill
    };
    cell.font = { name: 'Times New Roman', size: 11, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // 4. DATA ROWS
  let sumNewCase = 0;
  let sumTotalCase = 0;
  let sumDeath = 0;
  let sumTotalDeath = 0;
  let sumStopTreatment = 0;
  let sumCurrentManagement = 0;

  report.details.forEach((item, index) => {
    sumNewCase += item.newCase || 0;
    sumTotalCase += item.totalCase || 0;
    sumDeath += item.death || 0;
    sumTotalDeath += item.totalDeath || 0;
    sumStopTreatment += item.stopTreatment || 0;
    sumCurrentManagement += item.currentManagement || 0;

    const row = worksheet.addRow([
      index + 1,
      item.diseaseName,
      item.newCase || 0,
      item.totalCase || 0,
      item.death || 0,
      item.totalDeath || 0,
      item.stopTreatment || 0,
      item.currentManagement || 0,
      item.note || ''
    ]);

    row.height = 20;

    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Times New Roman', size: 11 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      if (colNum === 1) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNum === 2) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (colNum === 9) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0';
      }
    });
  });

  // 5. TOTALS ROW
  const totalRow = worksheet.addRow([
    '',
    'TỔNG CỘNG',
    sumNewCase,
    sumTotalCase,
    sumDeath,
    sumTotalDeath,
    sumStopTreatment,
    sumCurrentManagement,
    ''
  ]);

  totalRow.height = 24;
  totalRow.eachCell((cell, colNum) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' }
    };
    cell.font = { name: 'Times New Roman', size: 11, bold: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'double', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    if (colNum === 2) {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    } else if (colNum >= 3 && colNum <= 8) {
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.numFmt = '#,##0';
    }
  });

  worksheet.addRow([]); // Blank row

  // 6. SIGNATURE BLOCK
  const now = new Date();
  const dateStr = `Ngày ${now.getDate().toString().padStart(2, '0')} tháng ${(now.getMonth() + 1).toString().padStart(2, '0')} năm ${now.getFullYear()}`;

  const sigDateRow = worksheet.addRow(['', '', '', '', '', '', dateStr, '', '']);
  worksheet.mergeCells(`G${sigDateRow.number}:I${sigDateRow.number}`);
  worksheet.getCell(`G${sigDateRow.number}`).font = { name: 'Times New Roman', size: 11, italic: true };
  worksheet.getCell(`G${sigDateRow.number}`).alignment = { horizontal: 'center' };

  const sigTitleRow = worksheet.addRow([
    config.reporterTitle.toUpperCase(),
    '',
    '',
    '',
    '',
    '',
    config.headTitle.toUpperCase(),
    '',
    ''
  ]);

  worksheet.mergeCells(`A${sigTitleRow.number}:C${sigTitleRow.number}`);
  worksheet.mergeCells(`G${sigTitleRow.number}:I${sigTitleRow.number}`);

  worksheet.getCell(`A${sigTitleRow.number}`).font = { name: 'Times New Roman', size: 11, bold: true };
  worksheet.getCell(`A${sigTitleRow.number}`).alignment = { horizontal: 'center' };

  worksheet.getCell(`G${sigTitleRow.number}`).font = { name: 'Times New Roman', size: 11, bold: true };
  worksheet.getCell(`G${sigTitleRow.number}`).alignment = { horizontal: 'center' };

  const sigNoteRow = worksheet.addRow([
    '(Ký, ghi rõ họ tên)',
    '',
    '',
    '',
    '',
    '',
    '(Ký tên, đóng dấu)',
    '',
    ''
  ]);

  worksheet.mergeCells(`A${sigNoteRow.number}:C${sigNoteRow.number}`);
  worksheet.mergeCells(`G${sigNoteRow.number}:I${sigNoteRow.number}`);

  worksheet.getCell(`A${sigNoteRow.number}`).font = { name: 'Times New Roman', size: 10, italic: true };
  worksheet.getCell(`A${sigNoteRow.number}`).alignment = { horizontal: 'center' };

  worksheet.getCell(`G${sigNoteRow.number}`).font = { name: 'Times New Roman', size: 10, italic: true };
  worksheet.getCell(`G${sigNoteRow.number}`).alignment = { horizontal: 'center' };

  // Write buffer and trigger browser download
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Bao_Cao_Ung_Thu_T${report.month}_${report.year}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportOfficialNcdToExcel(
  reportData: any,
  options?: {
    customTitle?: string;
    periodText?: string;
    isQuarterly?: boolean;
    fileName?: string;
  }
): Promise<void> {
  const config = getUnitConfig();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Trạm Y tế phường Hiệp Thành';
  workbook.created = new Date();

  const isQ = options?.isQuarterly;
  const sheetName = isQ
    ? `Báo cáo Quý ${reportData.year}`
    : `Báo cáo NCD T${reportData.month}-${reportData.year}`;

  const worksheet = workbook.addWorksheet(sheetName, {
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToWidth: 1, fitToHeight: 0 }
  });

  worksheet.columns = [
    { key: 'stt', width: 10 },
    { key: 'chiTieu', width: 52 },
    { key: 'thangNay', width: 18 },
    { key: 'luyKe', width: 18 },
    { key: 'cungKy', width: 18 },
    { key: 'soSanh', width: 18 },
  ];

  // Header Units & National Motto
  worksheet.mergeCells('A1:C1');
  worksheet.getCell('A1').value = 'Đơn vị chủ quản: UBND PHƯỜNG HIỆP THÀNH';
  worksheet.getCell('A1').font = { name: 'Times New Roman', size: 10, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:C2');
  worksheet.getCell('A2').value = 'Đơn vị: TRẠM Y TẾ';
  worksheet.getCell('A2').font = { name: 'Times New Roman', size: 10, bold: true };
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  worksheet.mergeCells('D1:F1');
  worksheet.getCell('D1').value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';
  worksheet.getCell('D1').font = { name: 'Times New Roman', size: 11, bold: true };
  worksheet.getCell('D1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('D2:F2');
  worksheet.getCell('D2').value = 'Độc lập - Tự do - Hạnh phúc';
  worksheet.getCell('D2').font = { name: 'Times New Roman', size: 11, bold: true, underline: true };
  worksheet.getCell('D2').alignment = { horizontal: 'center' };

  worksheet.addRow([]);

  // Title
  const mainTitle = options?.customTitle || `${config.unitName.toUpperCase()} - BÁO CÁO PHÒNG CHỐNG BỆNH KHÔNG LÂY NHIỄM (NCD)`;
  worksheet.mergeCells('A5:F5');
  worksheet.getCell('A5').value = mainTitle;
  worksheet.getCell('A5').font = { name: 'Times New Roman', size: 14, bold: true, color: { argb: 'FF990000' } };
  worksheet.getCell('A5').alignment = { horizontal: 'center' };

  const subText = options?.periodText || `Tháng ${reportData.month} năm ${reportData.year} - Lần lưu gần nhất: ${reportData.lastSavedAt ? new Date(reportData.lastSavedAt).toLocaleString('vi-VN') : 'Mới tạo'}`;
  worksheet.mergeCells('A6:F6');
  worksheet.getCell('A6').value = subText;
  worksheet.getCell('A6').font = { name: 'Times New Roman', size: 11, italic: true };
  worksheet.getCell('A6').alignment = { horizontal: 'center' };

  worksheet.addRow([]);

  // Table header
  const colPeriodLabel = isQ ? 'Trong quý' : `Tháng ${reportData.month}/${reportData.year}`;
  const colPrevLabel = isQ ? 'Cùng kỳ năm trước' : `Tháng ${reportData.month}/${reportData.year - 1}`;
  const headerRow = worksheet.addRow(['STT', 'Nội dung báo cáo', colPeriodLabel, 'Cộng dồn', colPrevLabel, 'So sánh cùng kỳ']);
  headerRow.height = 28;
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6EEF8' } };
    cell.font = { name: 'Times New Roman', size: 11, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'medium' }, right: { style: 'thin' } };
  });

  const addSectionRow = (title: string) => {
    const row = worksheet.addRow(['', title, '', '', '', '']);
    worksheet.mergeCells(`A${row.number}:F${row.number}`);
    row.getCell('A').font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FF002060' } };
    row.getCell('A').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4F8' } };
  };

  const addDataRow = (stt: string, name: string, cur: number, cum: number, prev: number, comp: string, isSub?: boolean, isMergedCols34?: boolean) => {
    const row = worksheet.addRow([stt, name, cur || 0, cum || 0, prev || 0, comp || 'Không']);
    if (isMergedCols34) {
      worksheet.mergeCells(`C${row.number}:D${row.number}`);
    }
    row.eachCell((cell, colIndex) => {
      cell.font = { name: 'Times New Roman', size: 11, italic: !!isSub };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      if (colIndex === 1) cell.alignment = { horizontal: 'center' };
      else if (colIndex === 2) cell.alignment = { horizontal: 'left' };
      else if (colIndex >= 3 && colIndex <= 5) { cell.alignment = { horizontal: 'right' }; cell.numFmt = '#,##0'; }
      else cell.alignment = { horizontal: 'center' };
    });
  };

  // Section 1: THA
  addSectionRow('6. PHÒNG, CHỐNG TĂNG HUYẾT ÁP (THA)');
  addDataRow('1', isQ ? 'Số bệnh nhân phát hiện mới trong quý' : 'Số bệnh nhân phát hiện mới trong tháng', reportData.tha?.m1_newCase, reportData.tha?.m1_newCase_cum, reportData.tha?.m1_newCase_prevYear, reportData.tha?.m1_newCase_comp);
  addDataRow('2', isQ ? 'Số bệnh nhân khám & tái khám trong quý' : 'Số bệnh nhân khám & tái khám trong tháng', reportData.tha?.m2_reTreat, reportData.tha?.m2_reTreat_cum, reportData.tha?.m2_reTreat_prevYear, reportData.tha?.m2_reTreat_comp);
  addDataRow('3', 'Số bệnh nhân tử vong', reportData.tha?.m3_death, reportData.tha?.m3_death_cum, reportData.tha?.m3_death_prevYear, reportData.tha?.m3_death_comp);
  addDataRow('4', 'Số bệnh nhân bỏ điều trị / ngưng quản lý', reportData.tha?.m4_stopTreat, reportData.tha?.m4_stopTreat_cum, reportData.tha?.m4_stopTreat_prevYear, reportData.tha?.m4_stopTreat_comp);
  addDataRow('5', 'Tổng số bệnh nhân đang quản lý hiện tại', reportData.tha?.m5_currentManaged, reportData.tha?.m5_currentManaged, reportData.tha?.m5_currentManaged_prevYear, reportData.tha?.m5_currentManaged_comp, false, true);
  addDataRow('6', 'Số bệnh nhân đạt huyết áp mục tiêu', reportData.tha?.m6_targetBp, reportData.tha?.m6_targetBp, reportData.tha?.m6_targetBp_prevYear, reportData.tha?.m6_targetBp_comp, false, true);

  // Section 2: DTD
  addSectionRow('7. PHÒNG, CHỐNG ĐÁI THÁO ĐƯỜNG (ĐTĐ)');
  addDataRow('1', isQ ? 'Số bệnh nhân phát hiện mới trong quý' : 'Số bệnh nhân phát hiện mới trong tháng', reportData.dtd?.m1_newCase, reportData.dtd?.m1_newCase_cum, reportData.dtd?.m1_newCase_prevYear, reportData.dtd?.m1_newCase_comp);
  addDataRow('2', isQ ? 'Số bệnh nhân khám & cấp thuốc trong quý' : 'Số bệnh nhân khám & cấp thuốc trong tháng', reportData.dtd?.m2_reTreat, reportData.dtd?.m2_reTreat_cum, reportData.dtd?.m2_reTreat_prevYear, reportData.dtd?.m2_reTreat_comp);
  addDataRow('3', 'Tổng số bệnh nhân ĐTĐ đang quản lý hiện tại', reportData.dtd?.m3_currentManaged, reportData.dtd?.m3_currentManaged, reportData.dtd?.m3_currentManaged_prevYear, reportData.dtd?.m3_currentManaged_comp, false, true);
  addDataRow('4', 'Số bệnh nhân ĐTĐ đạt chỉ số đường huyết ổn định', reportData.dtd?.m4_stableTreat, reportData.dtd?.m4_stableTreat, reportData.dtd?.m4_stableTreat_prevYear, reportData.dtd?.m4_stableTreat_comp, false, true);
  addDataRow('5', 'Số bệnh nhân ĐTĐ tử vong', reportData.dtd?.m5_death, reportData.dtd?.m5_death_cum, reportData.dtd?.m5_death_prevYear, reportData.dtd?.m5_death_comp);
  addDataRow('6', 'Số bệnh nhân ĐTĐ bỏ điều trị / ngưng quản lý', reportData.dtd?.m6_stopTreat, reportData.dtd?.m6_stopTreat_cum, reportData.dtd?.m6_stopTreat_prevYear, reportData.dtd?.m6_stopTreat_comp);
  addDataRow('7', isQ ? 'Tiền ĐTĐ: Số bệnh nhân phát hiện mới trong quý' : 'Tiền ĐTĐ: Số bệnh nhân phát hiện mới trong tháng', reportData.dtd?.m7_prediabetesNew, reportData.dtd?.m7_prediabetesNew_cum, reportData.dtd?.m7_prediabetesNew_prevYear, reportData.dtd?.m7_prediabetesNew_comp);
  addDataRow('8', 'Tiền ĐTĐ: Tổng số bệnh nhân đang quản lý hiện tại', reportData.dtd?.m8_prediabetesManaged, reportData.dtd?.m8_prediabetesManaged, reportData.dtd?.m8_prediabetesManaged_prevYear, reportData.dtd?.m8_prediabetesManaged_comp, false, true);

  // Section 3: CANCER
  addSectionRow('8. PHÒNG, CHỐNG UNG THƯ');
  addDataRow('1', isQ ? 'Số bệnh nhân phát hiện mới trong quý' : 'Số bệnh nhân phát hiện mới trong tháng', reportData.cancer?.m1_newCase, reportData.cancer?.m1_newCase_cum, reportData.cancer?.m1_newCase_prevYear, reportData.cancer?.m1_newCase_comp);
  addDataRow('2', isQ ? 'Số bệnh nhân khám & theo dõi trong quý' : 'Số bệnh nhân khám & theo dõi trong tháng', reportData.cancer?.m2_reTreat, reportData.cancer?.m2_reTreat_cum, reportData.cancer?.m2_reTreat_prevYear, reportData.cancer?.m2_reTreat_comp);
  addDataRow('3', 'Số bệnh nhân tử vong', reportData.cancer?.m3_death, reportData.cancer?.m3_death_cum, reportData.cancer?.m3_death_prevYear, reportData.cancer?.m3_death_comp);
  addDataRow('4', 'Số bệnh nhân ngưng theo dõi / bỏ quản lý', reportData.cancer?.m4_stopTreat, reportData.cancer?.m4_stopTreat_cum, reportData.cancer?.m4_stopTreat_prevYear, reportData.cancer?.m4_stopTreat_comp);
  addDataRow('5', 'Tổng số bệnh nhân ung thư đang quản lý hiện tại', reportData.cancer?.m5_currentManaged, reportData.cancer?.m5_currentManaged, reportData.cancer?.m5_currentManaged_prevYear, reportData.cancer?.m5_currentManaged_comp, false, true);

  // Section 4: IOD
  addSectionRow('9. PHÒNG, CHỐNG RỐI LOẠN DO THIẾU I-ỐT (IOD)');
  addDataRow('1', 'Số mẫu muối/gia vị kiểm tra', reportData.iod?.m1_saltTested, reportData.iod?.m1_saltTested_cum, reportData.iod?.m1_saltTested_prevYear, reportData.iod?.m1_saltTested_comp);
  addDataRow('1.1', 'Trong đó: Số mẫu đủ tiêu chuẩn I-ốt', reportData.iod?.m1_1_saltPass, reportData.iod?.m1_1_saltPass_cum, reportData.iod?.m1_1_saltPass_prevYear, reportData.iod?.m1_1_saltPass_comp, true);
  addDataRow('1.2', 'Trong đó: Số mẫu không đủ tiêu chuẩn I-ốt', reportData.iod?.m1_2_saltFail, reportData.iod?.m1_2_saltFail_cum, reportData.iod?.m1_2_saltFail_prevYear, reportData.iod?.m1_2_saltFail_comp, true);
  addDataRow('2', 'Tỷ lệ hộ gia đình sử dụng muối/gia vị đủ I-ốt (%)', reportData.iod?.m2_householdRatio, reportData.iod?.m2_householdRatio_cum, reportData.iod?.m2_householdRatio_prevYear, reportData.iod?.m2_householdRatio_comp);
  addDataRow('3', 'Tỷ lệ bướu cổ trẻ em 8-10 tuổi (%)', reportData.iod?.m3_goiterChildRatio, reportData.iod?.m3_goiterChildRatio_cum, reportData.iod?.m3_goiterChildRatio_prevYear, reportData.iod?.m3_goiterChildRatio_comp);
  addDataRow('4', 'Số lượt khám phát hiện bướu cổ', reportData.iod?.m4_goiterExamTotal, reportData.iod?.m4_goiterExamTotal_cum, reportData.iod?.m4_goiterExamTotal_prevYear, reportData.iod?.m4_goiterExamTotal_comp);
  addDataRow('5', 'Số bệnh nhân bướu cổ đơn thuần đang quản lý', reportData.iod?.m5_goiterSimpleTotal, reportData.iod?.m5_goiterSimpleTotal_cum, reportData.iod?.m5_goiterSimpleTotal_prevYear, reportData.iod?.m5_goiterSimpleTotal_comp);
  addDataRow('5.1', 'Trong đó: Số bệnh nhân là trẻ em', reportData.iod?.m5_1_goiterChild, reportData.iod?.m5_1_goiterChild_cum, reportData.iod?.m5_1_goiterChild_prevYear, reportData.iod?.m5_1_goiterChild_comp, true);
  addDataRow('5.2', 'Trong đó: Số bệnh nhân đang điều trị', reportData.iod?.m5_2_goiterTreated, reportData.iod?.m5_2_goiterTreated_cum, reportData.iod?.m5_2_goiterTreated_prevYear, reportData.iod?.m5_2_goiterTreated_comp, true);
  addDataRow('6', 'Số bệnh nhân suy giáp đang quản lý', reportData.iod?.m6_hypothyroidism, reportData.iod?.m6_hypothyroidism_cum, reportData.iod?.m6_hypothyroidism_prevYear, reportData.iod?.m6_hypothyroidism_comp);
  addDataRow('7', 'Số bệnh nhân viêm giáp đang quản lý', reportData.iod?.m7_thyroiditis, reportData.iod?.m7_thyroiditis_cum, reportData.iod?.m7_thyroiditis_prevYear, reportData.iod?.m7_thyroiditis_comp);
  addDataRow('8', 'Số bệnh nhân Basedow đang quản lý', reportData.iod?.m8_basedow, reportData.iod?.m8_basedow_cum, reportData.iod?.m8_basedow_prevYear, reportData.iod?.m8_basedow_comp);
  addDataRow('9', 'Tỷ lệ bao phủ I-ốt (%)', reportData.iod?.m9_saltCoverageRatio, reportData.iod?.m9_saltCoverageRatio_cum, reportData.iod?.m9_saltCoverageRatio_prevYear, reportData.iod?.m9_saltCoverageRatio_comp);

  worksheet.addRow([]); // Blank row

  // Signature block
  const now = new Date();
  const dateStr = `Ngày ${now.getDate().toString().padStart(2, '0')} tháng ${(now.getMonth() + 1).toString().padStart(2, '0')} năm ${now.getFullYear()}`;

  const sigDateRow = worksheet.addRow(['', '', '', '', dateStr, '']);
  worksheet.mergeCells(`E${sigDateRow.number}:F${sigDateRow.number}`);
  worksheet.getCell(`E${sigDateRow.number}`).font = { name: 'Times New Roman', size: 11, italic: true };
  worksheet.getCell(`E${sigDateRow.number}`).alignment = { horizontal: 'center' };

  const sigTitleRow = worksheet.addRow([
    config.reporterTitle.toUpperCase(),
    '',
    '',
    '',
    config.headTitle.toUpperCase(),
    ''
  ]);

  worksheet.mergeCells(`A${sigTitleRow.number}:B${sigTitleRow.number}`);
  worksheet.mergeCells(`E${sigTitleRow.number}:F${sigTitleRow.number}`);

  worksheet.getCell(`A${sigTitleRow.number}`).font = { name: 'Times New Roman', size: 11, bold: true };
  worksheet.getCell(`A${sigTitleRow.number}`).alignment = { horizontal: 'center' };

  worksheet.getCell(`E${sigTitleRow.number}`).font = { name: 'Times New Roman', size: 11, bold: true };
  worksheet.getCell(`E${sigTitleRow.number}`).alignment = { horizontal: 'center' };

  const sigNoteRow = worksheet.addRow([
    '(Ký, ghi rõ họ tên)',
    '',
    '',
    '',
    '(Ký tên, đóng dấu)',
    ''
  ]);

  worksheet.mergeCells(`A${sigNoteRow.number}:B${sigNoteRow.number}`);
  worksheet.mergeCells(`E${sigNoteRow.number}:F${sigNoteRow.number}`);

  worksheet.getCell(`A${sigNoteRow.number}`).font = { name: 'Times New Roman', size: 10, italic: true };
  worksheet.getCell(`A${sigNoteRow.number}`).alignment = { horizontal: 'center' };

  worksheet.getCell(`E${sigNoteRow.number}`).font = { name: 'Times New Roman', size: 10, italic: true };
  worksheet.getCell(`E${sigNoteRow.number}`).alignment = { horizontal: 'center' };

  // Download
    // CANCER APPENDIX WORKSHEET
  if (reportData.cancerDetails) {
    const cancerSheet = workbook.addWorksheet('Phụ lục Ung thư', {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToWidth: 1, fitToHeight: 0 }
    });
    cancerSheet.columns = [
      { key: 'loai', width: 40 },
      { key: 'mac', width: 15 },
      { key: 'macTichLuy', width: 15 },
      { key: 'chet', width: 15 },
      { key: 'chetTichLuy', width: 15 },
      { key: 'ngungDieuTri', width: 25 },
      { key: 'quanLyHienTai', width: 20 },
    ];
    
    cancerSheet.mergeCells('A1:G1');
    cancerSheet.getCell('A1').value = 'PHỤ LỤC: DANH SÁCH BỆNH NHÂN UNG THƯ';
    cancerSheet.getCell('A1').font = { name: 'Times New Roman', size: 14, bold: true, color: { argb: 'FF990000' } };
    cancerSheet.getCell('A1').alignment = { horizontal: 'center' };
    cancerSheet.addRow([]);

    const header = cancerSheet.addRow(['Loại ung thư', 'Số Mắc', 'Mắc Tích Lũy', 'Số Chết', 'Chết Tích Lũy', 'Không tiếp tục điều trị', 'Quản lý hiện tại']);
    header.height = 25;
    header.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6EEF8' } };
      cell.font = { name: 'Times New Roman', size: 11, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'medium' }, right: { style: 'thin' } };
    });

    const cancerTypes = [
      'K Bàng Quang', 'K Bóng vater', 'K Buồng trứng', 'K Cổ tử cung', 'K Da', 'K Dạ Dày', 'K Đại tràng', 'K Đầu tụy', 'K Dương vật', 'K Gan', 'K Hạch', 'K Hầu họng', 'K Hầu mũi', 'K Hồi tràng', 'K Lưỡi', 'K Manh tràng', 'K Máu', 'K Mũi', 'K Não', 'K Phổi', 'K Ruột', 'K Tá tràng', 'K Thận', 'K Thanh quản', 'K Thực quản', 'K Tinh hoàn', 'K Trực tràng', 'K Tuyến giáp', 'K Tuyến mang tai', 'K Tuyến tiền liệt', 'K Vòm họng', 'K Võng mạc', 'K Vú', 'K Xoang hàm', 'K Xương', 'K Túi mật', 'K âm hộ', 'K hậu môn', 'K tuyến ức', 'K khâủ cái', 'K phúc mạc', 'K nướu hàm dưới', 'K hỗng tràng', 'K đường mật', 'K mô liên kết Đầu-mặt-cổ', 'K màng phổi', 'K thanh môn', 'k niệu quản', 'K khác'
    ];

    cancerTypes.forEach(type => {
      const details = reportData.cancerDetails[type] || {};
      const r = cancerSheet.addRow([
        type,
        details.mac || 0,
        details.macTichLuy || 0,
        details.chet || 0,
        details.chetTichLuy || 0,
        details.ngungDieuTri || 0,
        details.quanLyHienTai || 0
      ]);
      r.eachCell((cell, colIndex) => {
        cell.font = { name: 'Times New Roman', size: 11 };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        if (colIndex > 1) {
          cell.alignment = { horizontal: 'center' };
          if (cell.value !== 0 && cell.value !== '') cell.numFmt = '#,##0';
        }
      });
    });
  }

const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = options?.fileName || (isQ ? `Bao_Cao_NCD_Quy_${reportData.year}.xlsx` : `Bao_Cao_NCD_Thang_${reportData.month}_${reportData.year}.xlsx`);
  anchor.click();
  URL.revokeObjectURL(url);
}



export async function exportPatientsToExcel(patients: any[]): Promise<void> {
  const config = getUnitConfig();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Trạm Y tế phường Hiệp Thành';
  const worksheet = workbook.addWorksheet('Danh Sách Bệnh Nhân');

  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 8 },
    { header: 'Mã Bệnh Nhân', key: 'code', width: 16 },
    { header: 'Họ và Tên', key: 'name', width: 25 },
    { header: 'Năm Sinh', key: 'birth', width: 12 },
    { header: 'Giới Tính', key: 'gender', width: 12 },
    { header: 'Chương Trình Bệnh', key: 'prog', width: 20 },
    { header: 'Số Điện Thoại', key: 'phone', width: 16 },
    { header: 'Địa Chỉ', key: 'addr', width: 30 },
    { header: 'Trạng Thái', key: 'status', width: 20 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.height = 24;
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6EEF8' } };
    cell.font = { name: 'Times New Roman', size: 11, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  patients.forEach((p, idx) => {
    const row = worksheet.addRow({
      stt: idx + 1,
      code: p.patientCode || p.id,
      name: p.fullName,
      birth: p.birthYear,
      gender: p.gender,
      prog: p.programType || p.diseaseName,
      phone: p.phone,
      addr: p.address,
      status: p.status === 'DANG_QUAN_LY' ? 'Đang quản lý' : p.status
    });
    row.eachCell(c => {
      c.font = { name: 'Times New Roman', size: 11 };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Danh_Sach_Benh_Nhan_TYT_Hiep_Thanh.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportCancerAppendixToExcel(
  cancerDetails: Record<string, any>,
  cancerTypes: string[],
  month: number,
  year: number
): Promise<void> {
  const config = getUnitConfig();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = config.unitName || 'Trạm Y tế';
  workbook.created = new Date();

  const sheetName = `Phụ lục K T${month}-${year}`;
  const worksheet = workbook.addWorksheet(sheetName, {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  worksheet.columns = [
    { key: 'type', width: 35 },
    { key: 'mac', width: 12 },
    { key: 'macTichLuy', width: 15 },
    { key: 'chet', width: 12 },
    { key: 'chetTichLuy', width: 15 },
    { key: 'ngungDieuTri', width: 22 },
    { key: 'quanLyHienTai', width: 20 },
  ];

  worksheet.mergeCells('A1:G1');
  worksheet.getCell('A1').value = `PHỤ LỤC DANH SÁCH BỆNH NHÂN UNG THƯ THÁNG ${month}/${year}`;
  worksheet.getCell('A1').font = { name: 'Times New Roman', size: 14, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.addRow([]); // empty row

  const headerRow = worksheet.addRow({
    type: 'Loại ung thư',
    mac: 'Số Mắc',
    macTichLuy: 'Mắc Tích Lũy',
    chet: 'Số Chết',
    chetTichLuy: 'Chết Tích Lũy',
    ngungDieuTri: 'Không tiếp tục điều trị',
    quanLyHienTai: 'Quản lý hiện tại'
  });

  headerRow.eachCell(cell => {
    cell.font = { name: 'Times New Roman', size: 11, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  cancerTypes.forEach(type => {
    const data = cancerDetails[type] || {};
    const row = worksheet.addRow({
      type: type,
      mac: data.mac || 0,
      macTichLuy: data.macTichLuy || 0,
      chet: data.chet || 0,
      chetTichLuy: data.chetTichLuy || 0,
      ngungDieuTri: data.ngungDieuTri || 0,
      quanLyHienTai: data.quanLyHienTai || 0
    });
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Times New Roman', size: 11 };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      if (colNumber > 1) {
        cell.alignment = { horizontal: 'center' };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Phu_luc_Ung_thu_T${month}_${year}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}
