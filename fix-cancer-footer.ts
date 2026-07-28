import fs from 'fs';

const filePath = 'src/components/OfficialMonthlyReport.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const tfootCode = `
              <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border border-slate-200 dark:border-slate-700">
                <tr>
                  <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 uppercase">Tổng cộng</td>
                  <td className="py-2 px-3 text-center border-r border-slate-200 dark:border-slate-700">
                    {CANCER_TYPES.reduce((acc, type) => acc + (reportData.cancerDetails?.[type]?.mac || 0), 0)}
                  </td>
                  <td className="py-2 px-3 text-center border-r border-slate-200 dark:border-slate-700">
                    {CANCER_TYPES.reduce((acc, type) => acc + (reportData.cancerDetails?.[type]?.macTichLuy || 0), 0)}
                  </td>
                  <td className="py-2 px-3 text-center border-r border-slate-200 dark:border-slate-700">
                    {CANCER_TYPES.reduce((acc, type) => acc + (reportData.cancerDetails?.[type]?.chet || 0), 0)}
                  </td>
                  <td className="py-2 px-3 text-center border-r border-slate-200 dark:border-slate-700">
                    {CANCER_TYPES.reduce((acc, type) => acc + (reportData.cancerDetails?.[type]?.chetTichLuy || 0), 0)}
                  </td>
                  <td className="py-2 px-3 text-center border-r border-slate-200 dark:border-slate-700">
                    {CANCER_TYPES.reduce((acc, type) => acc + (reportData.cancerDetails?.[type]?.ngungDieuTri || 0), 0)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {CANCER_TYPES.reduce((acc, type) => acc + (reportData.cancerDetails?.[type]?.quanLyHienTai || 0), 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
`;

if (!content.includes('tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border border-slate-200 dark:border-slate-700"')) {
  content = content.replace('              </tbody>\n            </table>', '              </tbody>\n' + tfootCode);
  fs.writeFileSync(filePath, content);
}
