import fs from 'fs';
const filepath = 'src/components/OfficialMonthlyReport.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Add Search, Download to lucide-react imports if not there
if (!content.includes('Search,') && !content.includes(', Search')) {
  content = content.replace('Pill', 'Pill,\n  Search,\n  Download');
} else if (!content.includes('Download,')) {
    content = content.replace('Search,', 'Search, Download,');
}

// 2. Add exportCancerAppendixToExcel to imports
if (!content.includes('exportCancerAppendixToExcel')) {
  content = content.replace('exportOfficialNcdToExcel }', 'exportOfficialNcdToExcel, exportCancerAppendixToExcel }');
}

// 3. Add state for cancer search
if (!content.includes('cancerSearch')) {
  content = content.replace('const [activeReportTab, setActiveReportTab]', 'const [cancerSearch, setCancerSearch] = useState("");\n  const [activeReportTab, setActiveReportTab]');
}

// 4. Update the Phụ lục Ung thư section
const targetStr = `        {/* Cancer Details Appendix */}
        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="flex items-center justify-between mb-3 px-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Phụ lục: Danh sách Bệnh nhân Ung thư
            </h4>
            <button
              onClick={loadPreviousCancerData}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800/80 transition-colors shadow-sm border border-emerald-200 dark:border-emerald-800"
            >
              Lấy dữ liệu tháng trước
            </button>
          </div>
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700">`;

const replacement = `        {/* Cancer Details Appendix */}
        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-4 gap-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider whitespace-nowrap">
              Phụ lục: Danh sách Bệnh nhân Ung thư
            </h4>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm loại ung thư..."
                  value={cancerSearch}
                  onChange={e => setCancerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>
              <button
                onClick={() => {
                  exportCancerAppendixToExcel(reportData.cancerDetails || {}, CANCER_TYPES, month, year);
                  showToast('Đã xuất Phụ lục Ung thư', 'success');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800/80 transition-colors shadow-sm border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                Xuất Excel
              </button>
              <button
                onClick={loadPreviousCancerData}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/80 transition-colors shadow-sm border border-blue-200 dark:border-blue-800 whitespace-nowrap"
              >
                Lấy dữ liệu tháng trước
              </button>
            </div>
          </div>
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700">`;

if (content.includes('Lấy dữ liệu tháng trước')) {
    content = content.replace(targetStr, replacement);
}

// 5. Update the mapping to use the filtered list
const mapStr = `              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 border-b border-l border-r border-slate-200 dark:border-slate-700">
                {CANCER_TYPES.map(type => (`;
                
const mapReplacement = `              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 border-b border-l border-r border-slate-200 dark:border-slate-700">
                {CANCER_TYPES.filter(t => t.toLowerCase().includes(cancerSearch.toLowerCase())).map(type => (`;

if (content.includes(mapStr)) {
    content = content.replace(mapStr, mapReplacement);
}

fs.writeFileSync(filepath, content);
