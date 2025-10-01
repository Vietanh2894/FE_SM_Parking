import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavigation from '../components/DashboardNavigation';

const FaceRecognitionDemo = () => {
    const navigate = useNavigate();

    const features = [
        {
            title: 'Đăng ký khuôn mặt',
            description: 'Thêm khuôn mặt mới vào hệ thống với thông tin cá nhân',
            path: '/face-registration',
            icon: (
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            )
        },
        {
            title: 'Nhận diện khuôn mặt',
            description: 'Tải lên ảnh để nhận diện khuôn mặt trong hệ thống',
            path: '/face-recognition',
            icon: (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            title: 'So sánh khuôn mặt',
            description: 'So sánh độ tương đồng giữa hai khuôn mặt',
            path: '/face-comparison',
            icon: (
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            title: 'Quản lý khuôn mặt',
            description: 'Xem, tìm kiếm và quản lý danh sách khuôn mặt đã đăng ký',
            path: '/face-management',
            icon: (
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNavigation />
            
            <div className="ml-[260px] p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Hệ thống Nhận diện Khuôn mặt
                    </h1>
                    <p className="text-gray-600">
                        Quản lý và nhận diện khuôn mặt với công nghệ AI tiên tiến
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(feature.path)}
                            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer p-6"
                        >
                            <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-lg mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Quick Start Guide */}
                <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Hướng dẫn sử dụng
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">1. Đăng ký khuôn mặt</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Bắt đầu bằng cách đăng ký khuôn mặt mới vào hệ thống. Tải lên ảnh chân dung rõ nét và nhập thông tin cần thiết.
                            </p>
                            
                            <h3 className="font-medium text-gray-900 mb-2">2. Nhận diện khuôn mặt</h3>
                            <p className="text-gray-600 text-sm">
                                Sử dụng chức năng nhận diện để xác định danh tính từ ảnh. Hệ thống sẽ so khớp với cơ sở dữ liệu đã có.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">3. So sánh khuôn mặt</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                So sánh độ tương đồng giữa hai ảnh để xác định xem có phải cùng một người hay không.
                            </p>
                            
                            <h3 className="font-medium text-gray-900 mb-2">4. Quản lý dữ liệu</h3>
                            <p className="text-gray-600 text-sm">
                                Sử dụng trang quản lý để xem, tìm kiếm và xóa các khuôn mặt đã đăng ký trong hệ thống.
                            </p>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="font-medium text-blue-900">Trạng thái hệ thống</h3>
                            <p className="text-blue-700 text-sm mt-1">
                                Hệ thống Face Recognition đang hoạt động với chế độ development. 
                                API backend cần được kết nối để sử dụng đầy đủ tính năng.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceRecognitionDemo;