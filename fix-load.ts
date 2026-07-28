import fs from 'fs';

const filePath = 'src/components/OfficialMonthlyReport.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const loadPrevStr = `
  const loadPreviousCancerData = async () => {
    try {
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
      }
      const prevId = \`ncd_\${prevYear}_\${prevMonth.toString().padStart(2, '0')}\`;
      const docRef = doc(db, 'officialNcdReports', prevId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const prevData = snap.data() as any;
        if (prevData.cancerDetails || prevData.cancer) {
          setReportData((prev: any) => ({
            ...prev,
            cancer: prevData.cancer || prev.cancer,
            cancerDetails: prevData.cancerDetails || prev.cancerDetails
          }));
          showToast(\`Đã tải dữ liệu ung thư từ tháng \${prevMonth}/\${prevYear}\`, 'success');
        } else {
          showToast(\`Tháng \${prevMonth}/\${prevYear} chưa có dữ liệu ung thư\`, 'warning');
        }
      } else {
         showToast(\`Không tìm thấy dữ liệu tháng \${prevMonth}/\${prevYear}\`, 'warning');
      }
    } catch (e) {
      console.error(e);
      showToast('Lỗi khi tải dữ liệu tháng trước', 'error');
    }
  };
`;

if (!content.includes('loadPreviousCancerData = async ()')) {
  content = content.replace('  const handleCompChange = (', loadPrevStr + '\n  const handleCompChange = (');
  fs.writeFileSync(filePath, content);
}
