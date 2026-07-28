import fs from 'fs';

const filePath = 'src/components/OfficialMonthlyReport.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const updatedLoadStr = `
        if (prevData.cancerDetails || prevData.cancer) {
          setReportData(prev => ({
            ...prev,
            cancer: prevData.cancer || prev.cancer,
            cancerDetails: prevData.cancerDetails || prev.cancerDetails
          }));
          showToast(\`Đã tải dữ liệu ung thư từ tháng \${prevMonth}/\${prevYear}\`, 'success');
        } else {
`;

content = content.replace(`
        if (prevData.cancerDetails) {
          setReportData(prev => ({
            ...prev,
            cancerDetails: prevData.cancerDetails
          }));
          showToast(\`Đã tải dữ liệu ung thư từ tháng \${prevMonth}/\${prevYear}\`, 'success');
        } else {
`, updatedLoadStr);
fs.writeFileSync(filePath, content);
