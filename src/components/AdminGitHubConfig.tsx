import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { GitHubConfig } from '../types';
import { getGitHubConfig, saveGitHubConfig, testGitHubConnection } from '../services/documents';
import {
  Github,
  Key,
  FolderGit2,
  GitBranch,
  Folder,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const AdminGitHubConfig: React.FC = () => {
  const { showToast } = useToast();
  const [config, setConfig] = useState<GitHubConfig>(getGitHubConfig());
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    setConfig(getGitHubConfig());
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const result = await testGitHubConnection(config);
    setTesting(false);
    setTestResult(result);

    if (result.success) {
      showToast(result.message, 'success');
      const updated = { ...config, isConfigured: true, lastTestedAt: new Date().toISOString() };
      setConfig(updated);
      saveGitHubConfig(updated);
    } else {
      showToast(result.message, 'danger');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.repository || !config.token) {
      showToast('Vui lòng điền tên Repository và Personal Access Token!', 'warning');
      return;
    }

    const updated = { ...config, isConfigured: true };
    saveGitHubConfig(updated);
    setConfig(updated);
    showToast('Đã lưu cấu hình GitHub thành công!', 'success');
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 dark:text-rose-400 border border-slate-700">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Cấu Hình Đồng Bộ & Lưu Trữ GitHub</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                LƯU TRỮ VĂN BẢN
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cấu hình GitHub Personal Access Token (PAT) để lưu trữ tệp văn bản y tế trực tiếp lên kho chứa Git
            </p>
          </div>
        </div>

        {/* Connection Status Badge */}
        <div>
          {config.isConfigured ? (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Đã kết nối GitHub</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Chưa cấu hình Token</span>
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GitHub Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-slate-500" />
              <span>GitHub Username / Tên tài khoản</span>
            </label>
            <input
              type="text"
              value={config.username}
              onChange={e => setConfig({ ...config, username: e.target.value })}
              placeholder="VD: sonlyhongduc"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          {/* Repository Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-purple-500" />
              <span>Repository Path (Username/Repo) *</span>
            </label>
            <input
              type="text"
              required
              value={config.repository}
              onChange={e => setConfig({ ...config, repository: e.target.value })}
              placeholder="VD: sonlyhongduc/van-ban-y-te"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          {/* Personal Access Token (PAT) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>GitHub Personal Access Token (PAT) *</span>
              <span className="text-[10px] text-slate-400 font-normal">(Yêu cầu quyền contents: read/write)</span>
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                required
                value={config.token}
                onChange={e => setConfig({ ...config, token: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx hoặc github_pat_..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-sky-500" />
              <span>Branch (Nhánh Git)</span>
            </label>
            <input
              type="text"
              value={config.branch}
              onChange={e => setConfig({ ...config, branch: e.target.value })}
              placeholder="main"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          {/* Target Folder */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-amber-500" />
              <span>Thư mục lưu trữ (Folder path)</span>
            </label>
            <input
              type="text"
              value={config.folderPath}
              onChange={e => setConfig({ ...config, folderPath: e.target.value })}
              placeholder="documents"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !config.repository || !config.token}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center gap-2 border border-slate-700 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-sky-400 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Đang kiểm tra...' : 'Kiểm tra kết nối GitHub'}</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>LƯU CẤU HÌNH GITHUB</span>
          </button>

          {config.repository && (
            <a
              href={`https://github.com/${config.repository}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-xs font-bold text-sky-500 hover:text-sky-600 flex items-center gap-1"
            >
              <span>Xem Repository trên GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </form>

      {/* Test Result Message Box */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Instructions Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Hướng dẫn tạo GitHub Personal Access Token (PAT):</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          <li>Truy cập <strong className="text-slate-700 dark:text-slate-200">GitHub.com &gt; Settings &gt; Developer Settings &gt; Personal Access Tokens (Fine-grained hoặc Tokens classic)</strong></li>
          <li>Tạo token mới và tích chọn quyền <strong className="text-slate-700 dark:text-slate-200">Contents: Read and write</strong> đối với Repository của Trạm Y tế</li>
          <li>Dán mã token vào ô trên và bấm <strong className="text-slate-700 dark:text-slate-200">Kiểm tra kết nối GitHub</strong> rồi lưu cấu hình.</li>
        </ol>
      </div>
    </div>
  );
};
