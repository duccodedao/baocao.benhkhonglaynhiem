import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MedicalDocument } from '../types';
import {
  getDocumentsList,
  saveDocumentsList,
  deleteDocumentItem,
  subscribeDocuments,
  getGitHubConfig,
  uploadFileToGitHubRepo,
  deleteFileFromGitHubRepo
} from '../services/documents';
import {
  FileText,
  Upload,
  Search,
  Plus,
  Eye,
  Download,
  Trash2,
  Edit3,
  Github,
  CheckCircle2,
  Clock,
  Archive,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  File as FileIcon,
  X,
  Calendar,
  Tag,
  Filter,
  Check,
  Building2,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const MedicalDocuments: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Upload / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form Fields
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'HIEU_LUC' | 'DU_THAO' | 'HET_HIEU_LUC' | 'LUU_TRU'>('HIEU_LUC');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Preview & Confirm Delete Modal State
  const [previewDoc, setPreviewDoc] = useState<MedicalDocument | null>(null);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<MedicalDocument | null>(null);

  useEffect(() => {
    setDocuments(getDocumentsList());
    const unsubscribe = subscribeDocuments(() => {
      setDocuments(getDocumentsList());
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAddModal = () => {
    setEditingDocId(null);
    setDocumentNumber('');
    setIssuingAuthority('Sở Y tế');
    setTitle('');
    setExcerpt('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setStatus('HIEU_LUC');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doc: MedicalDocument) => {
    setEditingDocId(doc.id);
    setDocumentNumber(doc.documentNumber);
    setIssuingAuthority(doc.issuingAuthority || 'Sở Y tế');
    setTitle(doc.title);
    setExcerpt(doc.excerpt);
    setIssueDate(doc.issueDate);
    setStatus(doc.status);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !documentNumber.trim()) {
      showToast('Vui lòng nhập Tên văn bản và Số ký hiệu!', 'warning');
      return;
    }

    setUploading(true);

    let downloadUrl = '';
    let githubPath = '';
    let githubSha = '';
    let fileData = '';
    let fileName = selectedFile ? selectedFile.name : 'Document.pdf';
    let fileSize = selectedFile ? selectedFile.size : 102400;
    let fileType = selectedFile ? selectedFile.type : 'application/pdf';

    const githubConfig = getGitHubConfig();

    if (selectedFile) {
      // Read file to Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);
      const rawBase64 = await base64Promise;

      fileData = rawBase64;

      // If GitHub is configured, upload to GitHub Repository
      if (githubConfig.isConfigured && githubConfig.token && githubConfig.repository) {
        showToast('Đang tải văn bản lên GitHub Repository...', 'info');
        const ghResult = await uploadFileToGitHubRepo(
          githubConfig,
          selectedFile.name,
          rawBase64,
          `Thêm văn bản y tế: ${documentNumber} - ${title}`
        );

        if (ghResult.success) {
          downloadUrl = ghResult.downloadUrl || '';
          githubPath = ghResult.githubPath || '';
          githubSha = ghResult.sha || '';
          showToast('Đã lưu trữ văn bản lên GitHub thành công!', 'success');
        } else {
          showToast(`Không thể tải lên GitHub: ${ghResult.error}. Lưu bản ghi nội bộ local.`, 'warning');
        }
      } else {
        downloadUrl = rawBase64; // Fallback data URL
      }
    }

    if (editingDocId) {
      // Update existing document
      const updatedDocs = documents.map(d => {
        if (d.id === editingDocId) {
          return {
            ...d,
            documentNumber,
            issuingAuthority: issuingAuthority.trim() || 'Sở Y tế',
            title,
            excerpt,
            issueDate,
            status,
            fileName: selectedFile ? fileName : d.fileName,
            fileSize: selectedFile ? fileSize : d.fileSize,
            fileType: selectedFile ? fileType : d.fileType,
            downloadUrl: downloadUrl || d.downloadUrl,
            githubPath: githubPath || d.githubPath,
            githubSha: githubSha || d.githubSha,
            fileData: fileData || d.fileData
          };
        }
        return d;
      });

      setDocuments(updatedDocs);
      saveDocumentsList(updatedDocs);
      showToast('Cập nhật thông tin văn bản thành công!', 'success');
    } else {
      // Add new document
      const newDoc: MedicalDocument = {
        id: `doc_${Date.now()}`,
        documentNumber,
        issuingAuthority: issuingAuthority.trim() || 'Sở Y tế',
        title,
        excerpt,
        issueDate,
        status,
        fileName: selectedFile ? fileName : 'Văn_bản_mới.pdf',
        fileSize,
        fileType,
        downloadUrl: downloadUrl || 'https://raw.githubusercontent.com/octocat/Hello-World/master/README',
        fileData,
        githubPath,
        githubSha,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user ? `${user.displayName} (${user.role})` : 'Cán bộ Y tế'
      };

      const updatedDocs = [newDoc, ...documents];
      setDocuments(updatedDocs);
      saveDocumentsList(updatedDocs);
      showToast('Đã thêm văn bản mới thành công!', 'success');
    }

    setUploading(false);
    setIsModalOpen(false);
  };

  const executeDeleteDocument = async (doc: MedicalDocument) => {
    const githubConfig = getGitHubConfig();
    if (doc.githubPath && doc.githubSha && githubConfig.isConfigured) {
      showToast('Đang xóa tệp khỏi GitHub Repository...', 'info');
      await deleteFileFromGitHubRepo(
        githubConfig,
        doc.githubPath,
        doc.githubSha,
        `Xóa văn bản y tế: ${doc.documentNumber}`
      );
    }

    const updatedDocs = documents.filter(d => d.id !== doc.id);
    setDocuments(updatedDocs);
    saveDocumentsList(updatedDocs);
    deleteDocumentItem(doc.id);
    showToast('Đã xóa văn bản khỏi hệ thống!', 'success');
    setDeleteConfirmDoc(null);
  };

  // Filtered documents
  const filteredDocs = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.issuingAuthority && doc.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const renderFileIcon = (fileType: string, fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || fileType.includes('pdf')) {
      return <FileText className="w-6 h-6 text-rose-500 shrink-0" />;
    }
    if (ext === 'doc' || ext === 'docx' || fileType.includes('word')) {
      return <FileText className="w-6 h-6 text-sky-500 shrink-0" />;
    }
    if (ext === 'xls' || ext === 'xlsx' || fileType.includes('excel')) {
      return <FileSpreadsheet className="w-6 h-6 text-emerald-500 shrink-0" />;
    }
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
      return <ImageIcon className="w-6 h-6 text-purple-500 shrink-0" />;
    }
    return <FileIcon className="w-6 h-6 text-amber-500 shrink-0" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const renderStatusBadge = (st: MedicalDocument['status']) => {
    switch (st) {
      case 'HIEU_LUC':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            <span>Hiệu lực</span>
          </span>
        );
      case 'DU_THAO':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            <span>Dự thảo</span>
          </span>
        );
      case 'HET_HIEU_LUC':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3" />
            <span>Hết hiệu lực</span>
          </span>
        );
      case 'LUU_TRU':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1 w-fit">
            <Archive className="w-3 h-3" />
            <span>Lưu trữ</span>
          </span>
        );
    }
  };

  const githubConfig = getGitHubConfig();

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Quản Lý Văn Bản & Chỉ Đạo Y Tế</span>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                LƯU TRỮ GITHUB
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Lưu trữ, tra cứu quy định, quyết định, hướng dẫn chuyên môn và đồng bộ trực tiếp lên GitHub Repo
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {githubConfig.isConfigured ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
              <Github className="w-4 h-4 text-purple-500" />
              <span>Repo: <strong className="font-mono text-slate-900 dark:text-white">{githubConfig.repository}</strong></span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/30">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Chưa cấu hình Token GitHub</span>
            </div>
          )}

          {user && (user.role === 'ADMIN' || user.role === 'STAFF') && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Văn Bản Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên văn bản, số ký hiệu, trích yếu..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
          />
        </div>

        {/* Status Tabs Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'HIEU_LUC', label: 'Hiệu lực' },
            { id: 'DU_THAO', label: 'Dự thảo' },
            { id: 'HET_HIEU_LUC', label: 'Hết hiệu lực' },
            { id: 'LUU_TRU', label: 'Lưu trữ' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st.id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tệp đã tải lên</th>
                <th className="py-3.5 px-4 min-w-[180px]">Tên văn bản</th>
                <th className="py-3.5 px-4 min-w-[140px]">Cơ quan ban hành</th>
                <th className="py-3.5 px-4 min-w-[200px]">Trích yếu</th>
                <th className="py-3.5 px-4">Số ký hiệu</th>
                <th className="py-3.5 px-4">Ngày ban hành</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-xs">Không tìm thấy văn bản phù hợp</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Tệp đã tải lên */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {renderFileIcon(doc.fileType, doc.fileName)}
                        <div className="max-w-[130px] truncate">
                          <p className="font-bold text-slate-900 dark:text-white truncate" title={doc.fileName}>
                            {doc.fileName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tên văn bản */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white leading-relaxed">
                      {doc.title}
                    </td>

                    {/* Cơ quan ban hành */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{doc.issuingAuthority || 'Sở Y tế'}</span>
                      </div>
                    </td>

                    {/* Trích yếu */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px] max-w-xs">
                      <p className="line-clamp-2" title={doc.excerpt}>
                        {doc.excerpt || 'Chưa có trích yếu'}
                      </p>
                    </td>

                    {/* Số ký hiệu */}
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {doc.documentNumber}
                    </td>

                    {/* Ngày ban hành */}
                    <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                      {doc.issueDate}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(doc.status)}
                    </td>

                    {/* Thao tác (Xem / Tải / Xóa / Sửa) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Xem */}
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
                          title="Xem chi tiết & Nội dung văn bản"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Tải về */}
                        <a
                          href={doc.fileData || doc.downloadUrl || '#'}
                          download={doc.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          title="Tải tệp về máy"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        {/* Sửa */}
                        {user && (user.role === 'ADMIN' || user.role === 'STAFF') && (
                          <button
                            onClick={() => handleOpenEditModal(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                            title="Sửa thông tin văn bản"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Xóa */}
                        {user && user.role === 'ADMIN' && (
                          <button
                            onClick={() => setDeleteConfirmDoc(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Xóa văn bản khỏi hệ thống"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: THÊM / SỬA VĂN BẢN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingDocId ? 'Sửa Thông Tin Văn Bản' : 'Tải Lên Văn Bản Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Số ký hiệu */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số ký hiệu văn bản *
                  </label>
                  <input
                    type="text"
                    required
                    value={documentNumber}
                    onChange={e => setDocumentNumber(e.target.value)}
                    placeholder="VD: 158/QĐ-SYT"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>

                {/* Ngày ban hành */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày ban hành *
                  </label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              {/* Cơ quan ban hành */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cơ quan ban hành *
                </label>
                <input
                  type="text"
                  required
                  list="issuing-authorities"
                  value={issuingAuthority}
                  onChange={e => setIssuingAuthority(e.target.value)}
                  placeholder="VD: Sở Y tế, Bộ Y tế, UBND Tỉnh, CDC Tỉnh..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                />
                <datalist id="issuing-authorities">
                  <option value="Bộ Y tế" />
                  <option value="Sở Y tế" />
                  <option value="Ủy ban nhân dân Tỉnh" />
                  <option value="Trung tâm Kiểm soát bệnh tật (CDC Tỉnh)" />
                  <option value="Ủy ban nhân dân Huyện/Thành phố" />
                  <option value="Trung tâm Y tế Huyện" />
                  <option value="Trạm Y tế Xã/Phường" />
                </datalist>
              </div>

              {/* Tên văn bản */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên văn bản / Tiêu đề *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="VD: Quyết định phê duyệt kế hoạch PC Bệnh không lây nhiễm..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              {/* Trích yếu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Trích yếu nội dung
                </label>
                <textarea
                  rows={3}
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  placeholder="Tóm tắt ngắn gọn mục đích và nội dung chỉ đạo của văn bản..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Trạng thái hiệu lực
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="HIEU_LUC">Hiệu lực</option>
                  <option value="DU_THAO">Dự thảo</option>
                  <option value="HET_HIEU_LUC">Hết hiệu lực</option>
                  <option value="LUU_TRU">Lưu trữ</option>
                </select>
              </div>

              {/* Tệp đính kèm */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tệp văn bản đính kèm (PDF, Word, Ảnh...)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-rose-500 mx-auto mb-1 opacity-80" />
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-400">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nhấp hoặc kéo thả tệp vào đây</p>
                      <p className="text-[10px] text-slate-400">Hỗ trợ PDF, DOCX, XLSX, JPG, PNG (Tự động đồng bộ GitHub)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang lưu tệp...</span>
                    </>
                  ) : (
                    <span>LƯU VĂN BẢN</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XEM CHI TIẾT VĂN BẢN */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chi Tiết Văn Bản Chỉ Đạo
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Số ký hiệu</span>
                  <p className="text-sm font-mono font-extrabold text-rose-600 dark:text-rose-400">
                    {previewDoc.documentNumber}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Cơ quan ban hành</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-4 h-4 text-rose-500" />
                    <span>{previewDoc.issuingAuthority || 'Sở Y tế'}</span>
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Tên văn bản</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                  {previewDoc.title}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Trích yếu nội dung</span>
                <p className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-medium mt-1">
                  {previewDoc.excerpt || 'Không có trích yếu.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ngày ban hành</span>
                  <p className="font-bold text-slate-900 dark:text-white">{previewDoc.issueDate}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Trạng thái</span>
                  <div className="mt-0.5">{renderStatusBadge(previewDoc.status)}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Người tải lên: {previewDoc.uploadedBy}</span>
                <span>Ngày tạo: {new Date(previewDoc.uploadedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <a
                href={previewDoc.fileData || previewDoc.downloadUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-sky-400" />
                <span>Mở trong Tab Mới</span>
              </a>

              <a
                href={previewDoc.fileData || previewDoc.downloadUrl || '#'}
                download={previewDoc.fileName}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>TẢI TỆP VỀ MÁY ({formatFileSize(previewDoc.fileSize)})</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP CONFIRM / CANCEL DELETE DIALOG */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900">
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Xác Nhận Xóa Văn Bản
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Số ký hiệu:</span>
                <span className="font-mono font-bold text-rose-600 ml-1.5">{deleteConfirmDoc.documentNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Tên văn bản:</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">{deleteConfirmDoc.title}</p>
              </div>
              {deleteConfirmDoc.issuingAuthority && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Cơ quan ban hành:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 ml-1.5">{deleteConfirmDoc.issuingAuthority}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmDoc(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-all"
              >
                Hủy Bỏ (Cancel)
              </button>

              <button
                type="button"
                onClick={() => executeDeleteDocument(deleteConfirmDoc)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác Nhận Xóa (Confirm)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
