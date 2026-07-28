import fs from 'fs';

const filePath = 'src/services/excelExporter.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const exportFooter = `
    const totalRow = cancerSheet.addRow([
      'Tổng cộng',
      cancerTypes.reduce((acc, type) => acc + (reportData.cancerDetails[type]?.mac || 0), 0),
      cancerTypes.reduce((acc, type) => acc + (reportData.cancerDetails[type]?.macTichLuy || 0), 0),
      cancerTypes.reduce((acc, type) => acc + (reportData.cancerDetails[type]?.chet || 0), 0),
      cancerTypes.reduce((acc, type) => acc + (reportData.cancerDetails[type]?.chetTichLuy || 0), 0),
      cancerTypes.reduce((acc, type) => acc + (reportData.cancerDetails[type]?.ngungDieuTri || 0), 0),
      cancerTypes.reduce((acc, type) => acc + (reportData.cancerDetails[type]?.quanLyHienTai || 0), 0)
    ]);
    totalRow.height = 20;
    totalRow.eachCell((cell, colIndex) => {
      cell.font = { name: 'Times New Roman', size: 11, bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4F8' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      if (colIndex > 1) {
        cell.alignment = { horizontal: 'center' };
        if (cell.value !== 0 && cell.value !== '') cell.numFmt = '#,##0';
      }
    });
`;

if (!content.includes("totalRow = cancerSheet.addRow")) {
  content = content.replace("    });\n  }", "    });\n" + exportFooter + "  }");
  fs.writeFileSync(filePath, content);
}
