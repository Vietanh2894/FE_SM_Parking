import React from 'react';
import { 
    formatCurrency, 
    formatDate, 
    EXTENSION_STATUS,
    getStatusIcon,
    getStatusColor
} from '../../types/extensionTypes';

const PendingRequestList = ({ 
    pendingRequests, 
    onRefresh, 
    isLoading = false 
}) => {
    if (isLoading) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!pendingRequests || pendingRequests.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Yêu cầu gia hạn đang chờ
                    </h3>
                    <button
                        onClick={onRefresh}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Làm mới
                    </button>
                </div>
                
                <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">Không có yêu cầu gia hạn nào đang chờ duyệt</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Yêu cầu gia hạn đang chờ
                        <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                            {pendingRequests.length}
                        </span>
                    </h3>
                    <button
                        onClick={onRefresh}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Request List */}
            <div className="divide-y divide-gray-200">
                {pendingRequests.map((request) => (
                    <PendingRequestItem key={request.id} request={request} />
                ))}
            </div>
        </div>
    );
};

const PendingRequestItem = ({ request }) => {
    const statusColor = getStatusColor(request.trangThai);
    const iconProps = getStatusIcon(request.trangThai);

    return (
        <div className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-start space-x-4">
                {/* Status Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${statusColor.bg}`}>
                    <svg className={`w-5 h-5 ${statusColor.text}`} fill="none" stroke="currentColor" viewBox={iconProps.viewBox}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconProps.path} />
                    </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                                {request.bienSoXe}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                                {request.trangThai}
                            </span>
                        </div>
                        <span className="text-sm text-gray-500">
                            {formatDate(request.ngayTao)}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Thời hạn gia hạn:</span>
                            <span className="ml-2 text-gray-900 font-medium">
                                {request.soThangGiaHan} tháng
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Số tiền:</span>
                            <span className="ml-2 text-gray-900 font-medium">
                                {formatCurrency(request.soTien)}
                            </span>
                        </div>
                    </div>

                    {request.lyDoGiaHan && (
                        <div className="mt-2 text-sm">
                            <span className="text-gray-500">Lý do:</span>
                            <p className="text-gray-700 mt-1 italic">"{request.lyDoGiaHan}"</p>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="mt-3 text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                                Tạo: {formatDate(request.ngayTao)}
                            </div>
                            {request.ngayXuLy && (
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-1 ${
                                        request.trangThai === EXTENSION_STATUS.APPROVED 
                                            ? 'bg-green-500' 
                                            : request.trangThai === EXTENSION_STATUS.REJECTED
                                            ? 'bg-red-500'
                                            : 'bg-orange-500'
                                    }`}></div>
                                    Xử lý: {formatDate(request.ngayXuLy)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin note for processed requests */}
                    {request.ghiChuAdmin && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-md border-l-4 border-gray-300">
                            <div className="text-xs text-gray-500 mb-1">Ghi chú từ quản trị viên:</div>
                            <p className="text-sm text-gray-700 italic">"{request.ghiChuAdmin}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PendingRequestList;