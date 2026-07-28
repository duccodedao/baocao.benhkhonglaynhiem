import fs from 'fs';

const filePath = 'src/services/excelExporter.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Find the injected code and remove it from the wrong place
const startMarker = '  // CANCER APPENDIX WORKSHEET';
const endMarker = '  const buffer = await workbook.xlsx.writeBuffer();';

const startIdx = content.indexOf(startMarker);
if (startIdx !== -1) {
  // Extract the block
  const blockStart = startIdx;
  const blockEnd = content.indexOf(endMarker, blockStart);
  
  if (blockEnd !== -1) {
    const extractedBlock = content.substring(blockStart, blockEnd);
    
    // Remove it
    content = content.substring(0, blockStart) + content.substring(blockEnd);
    
    // 2. Inject it into exportOfficialNcdToExcel
    // Look for the last `workbook.xlsx.writeBuffer()` in the file or specifically in exportOfficialNcdToExcel
    // exportOfficialNcdToExcel has its buffer write around line 512
    const secondWriteBufferIdx = content.indexOf('const buffer = await workbook.xlsx.writeBuffer();', blockStart + 10);
    
    if (secondWriteBufferIdx !== -1) {
      content = content.substring(0, secondWriteBufferIdx) + extractedBlock + content.substring(secondWriteBufferIdx);
    }
  }
}

fs.writeFileSync(filePath, content);
