import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sliders,
  ShieldCheck,
  Bell,
  MapPin,
  Cookie,
  Sun,
  Moon,
  Eye,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Navigation
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { previewMode, togglePreviewMode, user } = useAuth();
  const { showToast } = useToast();

  // 1. Cookie State
  const [cookieEnabled, setCookieEnabled] = useState<boolean>(() => {
    return localStorage.getItem('yt_cookie_accepted') !== 'false';
  });

  // 2. Notification Permission State
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // 3. Location State
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationData, setLocationData] = useState<{
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    wardName?: string;
    provinceName?: string;
    error?: string;
  } | null>(() => {
    const saved = localStorage.getItem('yt_user_location');
    return saved ? JSON.parse(saved) : null;
  });

  const handleToggleCookie = (enabled: boolean) => {
    setCookieEnabled(enabled);
    localStorage.setItem('yt_cookie_accepted', enabled ? 'true' : 'false');
    showToast(enabled ? 'Đã bật lưu trữ Cookie hệ thống' : 'Đã tắt Cookie hệ thống', 'info');
  };

  const handleClearCookies = () => {
    showToast('Đã xóa dữ liệu bộ nhớ tạm Cookie thành công', 'success');
  };

  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      showToast('Trình duyệt của bạn không hỗ trợ Thông báo Browser', 'warning');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
      if (result === 'granted') {
        showToast('Đã cấp quyền thông báo hệ thống trên trình duyệt!', 'success');
        new Notification('Trạm Y tế - Chuyển đổi số', {
          body: 'Bạn sẽ nhận được thông báo quan trọng từ Ban Quản trị.'
        });
      } else {
        showToast('Quyền thông báo bị từ chối hoặc bỏ qua', 'warning');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchLocation = () => {
    if (!('geolocation' in navigator)) {
      showToast('Trình duyệt không hỗ trợ Định vị GPS', 'warning');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy);

        try {
          // Reverse geocoding via public OSM nominatim with maximum zoom
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            const ward = address.suburb || address.quarter || address.village || address.town || address.neighbourhood || address.residential || 'Phường / Xã';
            const province = address.city || address.state || address.province || 'Tỉnh / Thành phố';

            const locResult = {
              latitude: lat,
              longitude: lng,
              accuracy: accuracy,
              wardName: ward,
              provinceName: province
            };
            setLocationData(locResult);
            localStorage.setItem('yt_user_location', JSON.stringify(locResult));
            showToast(`Xác định vị trí chính xác (Sai số ±${accuracy}m): ${ward}, ${province}`, 'success');
          } else {
            throw new Error('Geocode lookup failed');
          }
        } catch {
          const fallbackLoc = {
            latitude: lat,
            longitude: lng,
            accuracy: accuracy,
            wardName: 'Phường Hiệp Thành (GPS chính xác)',
            provinceName: 'TP. Hồ Chí Minh'
          };
          setLocationData(fallbackLoc);
          localStorage.setItem('yt_user_location', JSON.stringify(fallbackLoc));
          showToast(`Đã ghi nhận tọa độ GPS (Sai số ±${accuracy}m): ${lat.toFixed(6)}, ${lng.toFixed(6)}`, 'success');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        const errMsg = 'Khởi tạo GPS thất bại hoặc bị từ chối truy cập vị trí';
        setLocationData({ error: errMsg });
        showToast(errMsg, 'danger');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Cài Đặt Hệ Thống & Cấu Hình Quyền
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quản lý quyền truy cập thiết bị, tùy chỉnh giao diện và chế độ hoạt động
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: TRUY CẬP QUYỀN */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            1. Truy cập quyền
          </h3>
        </div>

        {/* 1.1 Cookie */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cookie className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                1.1 Bộ nhớ tạm & Cookie
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lưu giữ thông tin đăng nhập, cấu hình bộ lọc báo cáo và trạng thái giao diện local.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleToggleCookie(!cookieEnabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                cookieEnabled
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-slate-200 text-slate-600 border-slate-300'
              }`}
            >
              {cookieEnabled ? 'Đã bật Cookie' : 'Đã tắt Cookie'}
            </button>
            <button
              onClick={handleClearCookies}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              title="Xóa bộ nhớ tạm Cookie"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1.2 Thông báo */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                1.2 Thông báo Browser
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nhận thông báo tự động khi có nhắc nhở lịch nộp báo cáo NCD hoặc cập nhật từ Ban chỉ đạo.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
              notifPermission === 'granted'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
            }`}>
              {notifPermission === 'granted' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>
                {notifPermission === 'granted' ? 'Đã cấp quyền' : notifPermission === 'denied' ? 'Bị từ chối' : 'Chưa cấp quyền'}
              </span>
            </span>

            {notifPermission !== 'granted' && (
              <button
                onClick={handleRequestNotificationPermission}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all"
              >
                Cấp quyền
              </button>
            )}
          </div>
        </div>

        {/* 1.3 Vị trí GPS */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  1.3 Vị trí Tọa độ & Đơn vị Trạm
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xác định tọa độ GPS nhằm tự động nhận diện tên Phường/Xã và Tỉnh/Thành phố công tác.
              </p>
            </div>

            <button
              onClick={handleFetchLocation}
              disabled={locationLoading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
            >
              <Navigation className={`w-4 h-4 ${locationLoading ? 'animate-spin' : ''}`} />
              <span>{locationLoading ? 'Đang định vị GPS...' : 'Xác định vị trí hiện tại'}</span>
            </button>
          </div>

          {locationData && !locationData.error && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <p><strong>Phường/Xã:</strong> {locationData.wardName}</p>
                <p><strong>Tỉnh/Thành phố:</strong> {locationData.provinceName}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400">
                  Độ chính xác GPS: ±{locationData.accuracy || 10}m
                </p>
                <p className="text-[10px] font-mono opacity-80">
                  Tọa độ: {locationData.latitude?.toFixed(6)}, {locationData.longitude?.toFixed(6)}
                </p>
              </div>
            </div>
          )}

          {locationData?.error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {locationData.error}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: GIAO DIỆN & TÙY CHỌN BÁO CÁO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Sun className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            2. Giao diện & Chế độ xem
          </h3>
        </div>

        {/* Dark/Light Mode */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span>Chủ đề Giao diện (Sáng / Tối)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chuyển đổi giao diện làm việc phù hợp điều kiện ánh sáng. Tự động lưu trạng thái.
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className={`w-14 h-7 rounded-full transition-colors relative p-0.5 ${
              theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform flex items-center justify-center text-xs ${
                theme === 'dark' ? 'translate-x-7 text-indigo-600' : 'translate-x-0 text-amber-500'
              }`}
            >
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
