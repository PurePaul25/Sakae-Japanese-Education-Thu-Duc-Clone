import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    AlertTriangle,
    Eye,
    Trash2,
    X,
    Loader2,
    ClipboardList,
    Phone,
    Mail,
    User,
    BookOpen,
    Calendar,
    Clock,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import DropdownSelect from '../ui/DropdownSelect';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_META = {
    PENDING: { label: 'Chờ liên hệ', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    CONTACTED: { label: 'Đã liên hệ', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    CONFIRMED: { label: 'Đã xác nhận', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    CANCELLED: { label: 'Đã hủy', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
};
const ALL_STATUSES = Object.keys(STATUS_META);
const LIMIT = 10;

function fmt(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
}
function fmtDatetime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('vi-VN');
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const meta = STATUS_META[status] ?? STATUS_META.PENDING;
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold whitespace-nowrap ${meta.cls}`}
        >
            {meta.label}
        </span>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, colorCls, loading }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
        {loading ? (
            <>
                <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-1" />
                <div className="h-7 w-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </>
        ) : (
            <>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                <p className={`text-2xl font-bold ${colorCls}`}>{value ?? 0}</p>
            </>
        )}
    </div>
);

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({ registration, onConfirm, onCancel, loading, show, duration = 300 }) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
        <div
            className={`absolute inset-0 bg-black/70 transition-opacity duration-${duration} ${show ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
            className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 transform transition-all duration-${duration} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        >
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-18 h-18 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle size={36} className="text-red-600" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Xóa đăng ký?</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        Bạn có chắc muốn xóa đăng ký của{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {registration?.fullName}
                        </span>
                        ? Hành động này không thể hoàn tác.
                    </p>
                </div>
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60"
                    >
                        {loading ? 'Đang xóa...' : 'Xóa đăng ký'}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ─── Bulk Delete Confirm Modal ────────────────────────────────────────────────
const BulkDeleteConfirmModal = ({ mode, count, filterDesc, onConfirm, onCancel, loading, show, duration = 300 }) => {
    const isDeleteAll = mode === 'all';
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
            <div
                className={`absolute inset-0 bg-black/70 transition-opacity duration-${duration} ${show ? 'opacity-100' : 'opacity-0'}`}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 transform transition-all duration-${duration} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-18 h-18 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle size={36} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                            {isDeleteAll ? 'Xóa tất cả đăng ký?' : 'Xóa các đăng ký đã chọn?'}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            {isDeleteAll ? (
                                <>
                                    Bạn sắp xóa <span className="font-semibold text-red-600">{count}</span> đăng ký
                                    {filterDesc ? <> ({filterDesc})</> : null}.
                                </>
                            ) : (
                                <>
                                    Bạn sắp xóa <span className="font-semibold text-red-600">{count}</span> đăng ký đã
                                    chọn.
                                </>
                            )}{' '}
                            Hành động này không thể hoàn tác.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Huỷ
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Đang xóa...' : isDeleteAll ? 'Xóa tất cả' : `Xóa ${count} mục`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── InfoRow helper ───────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-3">
        <span className="text-slate-400 mt-1 flex-shrink-0">{icon}</span>
        <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-500 mb-0.5">{label}</p>
            <p className="text-base text-slate-700 dark:text-slate-300 break-words">{value ?? '—'}</p>
        </div>
    </div>
);

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ registration: reg, onClose, onStatusChange, updatingId, show, duration = 300 }) => {
    if (!reg) return null;
    const schedule = reg.schedule ?? null;
    const course = reg.course ?? null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div
                className={`absolute inset-0 bg-black/70 transition-opacity duration-${duration} ${show ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-${duration} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-300 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <ClipboardList size={24} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                                Chi tiết đăng ký
                            </h3>
                            <p className="text-sm text-slate-400">#{reg.id?.slice(0, 8)}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="p-5 grid gap-5">
                    <section className="grid gap-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Thông tin học viên
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <InfoRow icon={<User size={16} />} label="Họ tên" value={reg.fullName} />
                            <InfoRow icon={<Mail size={16} />} label="Email" value={reg.email} />
                            <InfoRow icon={<Phone size={16} />} label="Điện thoại" value={reg.phone} />
                            <InfoRow icon={<Phone size={16} />} label="Zalo" value={reg.zalo || '—'} />
                        </div>
                        {reg.note && (
                            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-3 flex gap-2">
                                <MessageSquare size={16} className="text-slate-400 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 mb-0.5">Ghi chú</p>
                                    <p className="text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                        {reg.note}
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                    {course && (
                        <section className="grid gap-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khóa học</h4>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <InfoRow icon={<BookOpen size={16} />} label="Tên khóa" value={course.title} />
                                <InfoRow icon={<BookOpen size={16} />} label="Cấp độ" value={course.level || '—'} />
                                <InfoRow icon={<BookOpen size={16} />} label="Loại" value={course.type || '—'} />
                            </div>
                        </section>
                    )}
                    {schedule && (
                        <section className="grid gap-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lịch học</h4>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <InfoRow
                                    icon={<Calendar size={16} />}
                                    label="Ngày khai giảng"
                                    value={fmt(schedule.startDate)}
                                />
                                <InfoRow icon={<Clock size={16} />} label="Giờ học" value={schedule.time || '—'} />
                                <InfoRow
                                    icon={<Calendar size={16} />}
                                    label="Ngày học"
                                    value={schedule.studyDays || '—'}
                                />
                                {schedule.teacher && (
                                    <InfoRow icon={<User size={16} />} label="Giáo viên" value={schedule.teacher} />
                                )}
                            </div>
                        </section>
                    )}
                    <section className="grid gap-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Thời gian & Trạng thái
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3 items-center">
                            <InfoRow
                                icon={<Calendar size={16} />}
                                label="Ngày đăng ký"
                                value={fmtDatetime(reg.createdAt)}
                            />
                            <div className="flex items-center gap-2">
                                <StatusBadge status={reg.status} />
                                <div className="relative flex items-center">
                                    <DropdownSelect
                                        value={reg.status}
                                        onChange={(value) => onStatusChange(reg.id, value)}
                                        options={ALL_STATUSES.map((status) => ({
                                            label: STATUS_META[status].label,
                                            value: status,
                                        }))}
                                        placeholder="Chọn trạng thái"
                                        buttonClassName="text-sm"
                                        disabled={updatingId === reg.id}
                                    />
                                    {updatingId === reg.id && (
                                        <Loader2 size={12} className="absolute right-1.5 text-red-500 animate-spin" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

// ─── Table Spinner Loading ───────────────────────────────────────────────────
const TableSpinner = () => (
    <tr>
        <td colSpan={8}>
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 size={36} className="animate-spin text-red-500" />
                <p className="text-sm text-slate-400">Đang tải danh sách đăng ký...</p>
            </div>
        </td>
    </tr>
);

const EmptyState = () => (
    <tr>
        <td colSpan={8}>
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <ClipboardList size={32} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có đăng ký nào.</p>
                <p className="text-sm text-slate-400 mt-1">Thay đổi bộ lọc hoặc chờ học viên đăng ký mới.</p>
            </div>
        </td>
    </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminRegistrations = () => {
    const { addToast } = useToast();
    const addToastRef = useRef(addToast);
    useEffect(() => {
        addToastRef.current = addToast;
    }, [addToast]);

    const fetchRegistrationsErrorShown = useRef(false);
    const [registrations, setRegistrations] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [sort, setSort] = useState('newest');
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const [detailTarget, setDetailTarget] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkDeleteMode, setBulkDeleteMode] = useState(null);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const MODAL_DURATION = 300;

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [statusFilter, courseFilter, sort]);

    useEffect(() => {
        api.get('/courses?limit=100')
            .then((res) => {
                const payload = res.data?.data ?? res.data;
                setCourses(payload?.items ?? payload?.data ?? []);
            })
            .catch(() => {});
    }, []);

    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await api.get('/course-registrations/dashboard');
            setStats(res.data?.data ?? res.data ?? null);
        } catch {
            /* non-critical */
        } finally {
            setStatsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const fetchRegistrations = useCallback(
        async (p = 1, isRefresh = false) => {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            try {
                const params = {
                    page: p,
                    limit: LIMIT,
                    sort,
                    ...(debouncedSearch && { q: debouncedSearch }),
                    ...(statusFilter && { status: statusFilter }),
                    ...(courseFilter && { courseId: courseFilter }),
                };
                const res = await api.get('/course-registrations', { params });
                const payload = res.data?.data ?? res.data;
                setRegistrations(payload?.items ?? payload?.data ?? []);
                setMeta(payload?.meta ?? null);
                fetchRegistrationsErrorShown.current = false;
            } catch {
                if (!fetchRegistrationsErrorShown.current) {
                    addToastRef.current('Không thể tải danh sách đăng ký.', 'error');
                    fetchRegistrationsErrorShown.current = true;
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [debouncedSearch, statusFilter, courseFilter, sort],
    );

    useEffect(() => {
        fetchRegistrations(page);
    }, [page, fetchRegistrations]);

    useEffect(() => {
        setSelectedIds(new Set());
    }, [page, debouncedSearch, statusFilter, courseFilter, sort]);

    const pageIds = registrations.map((r) => r.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    const somePageSelected = pageIds.some((id) => selectedIds.has(id));
    const selectedCount = selectedIds.size;

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAllPage = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allPageSelected) pageIds.forEach((id) => next.delete(id));
            else pageIds.forEach((id) => next.add(id));
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    const getFilterParams = () => ({
        ...(debouncedSearch && { q: debouncedSearch }),
        ...(statusFilter && { status: statusFilter }),
        ...(courseFilter && { courseId: courseFilter }),
    });

    const getFilterDesc = () => {
        const parts = [];
        if (debouncedSearch) parts.push(`tìm kiếm "${debouncedSearch}"`);
        if (statusFilter) parts.push(`trạng thái "${STATUS_META[statusFilter]?.label}"`);
        if (courseFilter) {
            const course = courses.find((c) => c.id === courseFilter);
            if (course) parts.push(`khóa "${course.title}"`);
        }
        return parts.length ? parts.join(', ') : 'toàn bộ danh sách';
    };

    const handleStatusChange = async (id, newStatus) => {
        setUpdatingId(id);
        setDetailTarget((prev) => (prev?.id === id ? { ...prev, status: newStatus } : prev));
        setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
        try {
            await api.patch(`/course-registrations/${id}`, { status: newStatus });
            addToastRef.current(`Đã cập nhật trạng thái thành "${STATUS_META[newStatus]?.label}".`, 'success');
            fetchStats();
        } catch (err) {
            addToastRef.current(err?.response?.data?.message || 'Cập nhật trạng thái thất bại.', 'error');
            fetchRegistrations(page, true);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/course-registrations/${deleteTarget.id}`);
            addToastRef.current(`Đã xóa đăng ký của "${deleteTarget.fullName}".`, 'success');
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(deleteTarget.id);
                return next;
            });
            fetchRegistrations(page, true);
            fetchStats();
        } catch (err) {
            addToastRef.current(err?.response?.data?.message || 'Xóa thất bại.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const openBulkDelete = (mode) => {
        setBulkDeleteMode(mode);
        setTimeout(() => setShowBulkDeleteModal(true), 10);
    };

    const closeBulkDelete = () => {
        setShowBulkDeleteModal(false);
        setTimeout(() => setBulkDeleteMode(null), MODAL_DURATION);
    };

    const handleBulkDeleteConfirm = async () => {
        setBulkDeleting(true);
        try {
            if (bulkDeleteMode === 'all') {
                const res = await api.delete('/course-registrations/bulk/all', { params: getFilterParams() });
                const deleted = res.data?.data?.deleted ?? 0;
                addToastRef.current(`Đã xóa ${deleted} đăng ký.`, 'success');
            } else {
                const ids = [...selectedIds];
                const res = await api.post('/course-registrations/bulk-delete', { ids });
                const deleted = res.data?.data?.deleted ?? ids.length;
                addToastRef.current(`Đã xóa ${deleted} đăng ký.`, 'success');
            }
            clearSelection();
            setPage(1);
            fetchRegistrations(1, true);
            fetchStats();
        } catch (err) {
            addToastRef.current(err?.response?.data?.message || 'Xóa thất bại.', 'error');
        } finally {
            setBulkDeleting(false);
        }
    };

    const openDetail = (reg) => {
        setDetailTarget(reg);
        setTimeout(() => setShowDetailModal(true), 10);
    };
    const closeDetail = () => {
        setShowDetailModal(false);
        setTimeout(() => setDetailTarget(null), MODAL_DURATION);
    };
    const openDelete = (reg) => {
        setDeleteTarget(reg);
        setTimeout(() => setShowDeleteModal(true), 10);
    };
    const closeDelete = () => {
        setShowDeleteModal(false);
        setTimeout(() => setDeleteTarget(null), MODAL_DURATION);
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Quản lý đăng ký khóa học</h2>
                <p className="text-slate-500 mt-1">Danh sách học viên đã đăng ký tư vấn.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                <StatCard
                    label="Tổng đăng ký"
                    value={stats?.totalRegistrations}
                    colorCls="text-slate-800 dark:text-white"
                    loading={statsLoading}
                />
                <StatCard
                    label="Chờ liên hệ"
                    value={stats?.pending}
                    colorCls="text-amber-600 dark:text-amber-400"
                    loading={statsLoading}
                />
                <StatCard
                    label="Đã liên hệ"
                    value={stats?.contacted}
                    colorCls="text-blue-600 dark:text-blue-400"
                    loading={statsLoading}
                />
                <StatCard
                    label="Đã xác nhận"
                    value={stats?.confirmed}
                    colorCls="text-green-600 dark:text-green-400"
                    loading={statsLoading}
                />
                <StatCard
                    label="Đã hủy"
                    value={stats?.cancelled}
                    colorCls="text-slate-500 dark:text-slate-400"
                    loading={statsLoading}
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                        type="text"
                        placeholder="Tìm tên, email, SĐT..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border transition duration-200 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div className="relative flex items-center">
                    <SlidersHorizontal size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <DropdownSelect
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                        options={[
                            { label: 'Tất cả trạng thái', value: '' },
                            ...ALL_STATUSES.map((status) => ({ label: STATUS_META[status].label, value: status })),
                        ]}
                        placeholder="Tất cả trạng thái"
                        buttonClassName="text-sm pl-9"
                    />
                </div>
                <div className="relative flex items-center">
                    <BookOpen size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <DropdownSelect
                        value={courseFilter}
                        onChange={(value) => setCourseFilter(value)}
                        options={[
                            { label: 'Tất cả khóa học', value: '' },
                            ...courses.map((course) => ({ label: course.title, value: course.id })),
                        ]}
                        placeholder="Tất cả khóa học"
                        buttonClassName="text-sm pl-9"
                    />
                </div>
                <DropdownSelect
                    value={sort}
                    onChange={(value) => setSort(value)}
                    options={[
                        { label: 'Mới nhất', value: 'newest' },
                        { label: 'Cũ nhất', value: 'oldest' },
                    ]}
                    placeholder="Sắp xếp"
                    buttonClassName="text-sm"
                />
            </div>

            {/* Bulk actions */}
            {!loading && (registrations.length > 0 || (meta?.total ?? 0) > 0) && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {selectedCount > 0 && (
                        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
                            <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                                Đã chọn {selectedCount} mục
                            </span>
                            <button
                                onClick={clearSelection}
                                className="px-2.5 py-1 text-xs font-semibold cursor-pointer text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Bỏ chọn
                            </button>
                            <button
                                onClick={() => openBulkDelete('selected')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                <Trash2 size={14} />
                                Xóa đã chọn
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                <div className="overflow-x-auto overflow-y-visible relative">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-4 py-3 w-10">
                                    {!loading && registrations.length > 0 && (
                                        <input
                                            type="checkbox"
                                            checked={allPageSelected}
                                            ref={(el) => {
                                                if (el) el.indeterminate = somePageSelected && !allPageSelected;
                                            }}
                                            onChange={toggleSelectAllPage}
                                            title={allPageSelected ? 'Bỏ chọn trang này' : 'Chọn tất cả trang này'}
                                            className="w-4 h-4 cursor-pointer accent-red-600 rounded"
                                        />
                                    )}
                                </th>
                                {[
                                    'Họ tên / Email',
                                    'Điện thoại',
                                    'Khóa học',
                                    'Lịch học',
                                    'Trạng thái',
                                    'Ngày ĐK',
                                    '',
                                ].map((h, i) => (
                                    <th
                                        key={i}
                                        className="px-4 py-3 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <TableSpinner />
                            ) : registrations.length === 0 ? (
                                <EmptyState />
                            ) : (
                                registrations.map((reg) => {
                                    const schedule = reg.schedule ?? null;
                                    return (
                                        <tr
                                            key={reg.id}
                                            className={`hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors ${selectedIds.has(reg.id) ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                                        >
                                            <td className="px-4 py-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(reg.id)}
                                                    onChange={() => toggleSelect(reg.id)}
                                                    className="w-4 h-4 cursor-pointer accent-red-600 rounded"
                                                />
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <p className="font-semibold text-slate-700 dark:text-white text-sm">
                                                    {reg.fullName}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">{reg.email}</p>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                                    {reg.phone}
                                                </p>
                                                {reg.zalo && (
                                                    <p className="text-xs text-slate-400 mt-0.5">Zalo: {reg.zalo}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-[150px] line-clamp-2">
                                                    {reg.course?.title ?? '—'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-2.5 whitespace-nowrap">
                                                {schedule ? (
                                                    <>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                                            {fmt(schedule.startDate)}
                                                        </p>
                                                        {schedule.time && (
                                                            <p className="text-xs text-slate-400 mt-0.5">
                                                                {schedule.time}
                                                            </p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-slate-600">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5 overflow-visible">
                                                <div className="flex items-center gap-1.5 overflow-visible">
                                                    <StatusBadge status={reg.status} />
                                                    <div className="relative overflow-visible">
                                                        <DropdownSelect
                                                            value={reg.status}
                                                            onChange={(value) => handleStatusChange(reg.id, value)}
                                                            options={ALL_STATUSES.map((status) => ({
                                                                label: STATUS_META[status].label,
                                                                value: status,
                                                            }))}
                                                            placeholder="Chọn trạng thái"
                                                            buttonClassName="text-[13px] px-2 py-1"
                                                            disabled={updatingId === reg.id}
                                                        />
                                                        {updatingId === reg.id && (
                                                            <Loader2
                                                                size={10}
                                                                className="absolute right-1 top-1/2 -translate-y-1/2 text-red-500 animate-spin"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-sm text-slate-500 whitespace-nowrap">
                                                {fmt(reg.createdAt)}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <button
                                                        onClick={() => openDetail(reg)}
                                                        title="Xem chi tiết"
                                                        className="p-1.5 cursor-pointer text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDelete(reg)}
                                                        title="Xóa đăng ký"
                                                        className="p-1.5 cursor-pointer text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                    {refreshing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-950/70">
                            <div className="flex flex-col items-center gap-3 text-slate-600 dark:text-slate-300">
                                <div className="w-10 h-10 border-4 border-slate-300 dark:border-slate-700 border-t-red-500 rounded-full animate-spin" />
                                <span className="text-sm">Đang cập nhật...</span>
                            </div>
                        </div>
                    )}
                </div>
                {meta && meta.totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                        <p className="text-sm text-slate-500">
                            Trang <span className="font-semibold">{page}</span> /{' '}
                            <span className="font-semibold">{meta.totalPages}</span> · Tổng{' '}
                            <span className="font-semibold">{meta.total}</span> đăng ký
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                                .filter((n) => n === 1 || n === meta.totalPages || Math.abs(n - page) <= 1)
                                .reduce((acc, n, idx, arr) => {
                                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                                    acc.push(n);
                                    return acc;
                                }, [])
                                .map((item, i) =>
                                    item === '…' ? (
                                        <span key={`e-${i}`} className="px-1 text-slate-400 text-sm">
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={item}
                                            onClick={() => setPage(item)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === item ? 'bg-blue-600 text-white' : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            {item}
                                        </button>
                                    ),
                                )}
                            <button
                                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                                disabled={page === meta.totalPages}
                                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {detailTarget && (
                <DetailModal
                    registration={detailTarget}
                    onClose={closeDetail}
                    onStatusChange={handleStatusChange}
                    updatingId={updatingId}
                    show={showDetailModal}
                    duration={MODAL_DURATION}
                />
            )}
            {deleteTarget && (
                <DeleteConfirmModal
                    registration={deleteTarget}
                    onConfirm={async () => {
                        await handleDeleteConfirm();
                        closeDelete();
                    }}
                    onCancel={closeDelete}
                    loading={deleting}
                    show={showDeleteModal}
                    duration={MODAL_DURATION}
                />
            )}
            {bulkDeleteMode && (
                <BulkDeleteConfirmModal
                    mode={bulkDeleteMode}
                    count={bulkDeleteMode === 'all' ? (meta?.total ?? 0) : selectedCount}
                    filterDesc={bulkDeleteMode === 'all' ? getFilterDesc() : null}
                    onConfirm={async () => {
                        await handleBulkDeleteConfirm();
                        closeBulkDelete();
                    }}
                    onCancel={closeBulkDelete}
                    loading={bulkDeleting}
                    show={showBulkDeleteModal}
                    duration={MODAL_DURATION}
                />
            )}
        </div>
    );
};

export default AdminRegistrations;
