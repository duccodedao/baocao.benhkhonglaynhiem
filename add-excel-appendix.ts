import fs from 'fs';
const filepath = 'src/services/excelExporter.ts';
let content = fs.readFileSync(filepath, 'utf8');

const newFunc = `
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

  const sheetName = \`Phụ lục K T\${month}-\${year}\`;
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
  worksheet.getCell('A1').value = \`PHỤ LỤC DANH SÁCH BỆNH NHÂN UNG THƯ THÁNG \${month}/\${year}\`;
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
  anchor.download = \`Phu_luc_Ung_thu_T\${month}_\${year}.xlsx\`;
  anchor.click();
  URL.revokeObjectURL(url);
}
`;

if (!content.includes('exportCancerAppendixToExcel')) {
  fs.writeFileSync(filepath, content + newFunc);
}
