import React, { useState } from 'react';
import ImageUploadWithPreview from '../components/common/ImageUploadWithPreview';
import FaceRecognitionStatus from '../components/common/FaceRecognitionStatus';
import dangKyThangService from '../services/dangKyThangService';
import ParkingTransactionService from '../services/parkingTransactionService';

const FaceRecognitionTestPage = () => {
    const [activeTab, setActiveTab] = useState('registration');
    const [faceImageBase64, setFaceImageBase64] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [testData, setTestData] = useState({
        // Registration test data
        registration: {
            bienSoXe: 'TEST-123',
            tenXe: 'Honda Test',
            maLoaiXe: 'LX001',
            maNhanVien: 'NV001',
            soThang: 1,
            cccd: '123456789',
            soCavet: 'CV123',
            diaChi: 'Test Address',
            email: 'test@test.com',
            soDienThoai: '0123456789',
            password: 'password123',
            enableFaceRecognition: true
        },
        // Entry test data
        entry: {
            bienSoXe: 'TEST-123',
            maBaiDo: 'P001',
            maLoaiXe: 'LX001'
        },
        // Exit test data
        exit: {
            bienSoXe: 'TEST-123'
        }
    });

    const handleImageChange = (base64String, file) => {
        setFaceImageBase64(base64String);
        setTestResult(null);
        
        console.log('🖼️ Test face image uploaded:', {
            hasImage: !!base64String,
            fileSize: file ? `${(file.size / 1024).toFixed(1)}KB` : null,
            fileName: file?.name
        });
    };

    const handleTestRegistration = async () => {
        if (!faceImageBase64) {
            alert('Vui lòng chọn ảnh khuôn mặt');
            return;
        }

        setLoading(true);
        try {
            const dataToSend = {
                ...testData.registration,
                faceImageBase64
            };

            const result = await dangKyThangService.createDangKyThangWithFace(dataToSend);
            
            setTestResult({
                type: 'registration',
                success: result.success,
                data: result.data,
                message: result.message,
                faceId: result.data?.faceId,
                faceSimilarity: result.data?.faceSimilarity,
                faceVerificationStatus: 'VERIFIED_ENTRY'
            });
        } catch (error) {
            setTestResult({
                type: 'registration',
                success: false,
                message: error.response?.data?.message || 'Test failed',
                error: error
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTestEntry = async () => {
        if (!faceImageBase64) {
            alert('Vui lòng chọn ảnh khuôn mặt');
            return;
        }

        setLoading(true);
        try {
            const dataToSend = {
                ...testData.entry,
                faceImageBase64
            };

            const result = await ParkingTransactionService.directVehicleEntryWithFace(dataToSend);
            
            setTestResult({
                type: 'entry',
                success: result.success,
                data: result.data,
                message: result.message,
                faceId: result.data?.faceIdEntry,
                faceSimilarity: result.faceSimilarityEntry,
                faceVerificationStatus: result.faceVerificationStatus
            });
        } catch (error) {
            setTestResult({
                type: 'entry',
                success: false,
                message: error.response?.data?.message || 'Test failed',
                error: error
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTestExit = async () => {
        if (!faceImageBase64) {
            alert('Vui lòng chọn ảnh khuôn mặt');
            return;
        }

        setLoading(true);
        try {
            const dataToSend = {
                ...testData.exit,
                faceImageBase64
            };

            const result = await ParkingTransactionService.directVehicleExitWithFace(dataToSend);
            
            setTestResult({
                type: 'exit',
                success: result.success,
                data: result.data,
                message: result.message,
                faceId: result.data?.faceIdExit,
                faceSimilarity: result.faceSimilarityExit,
                faceVerificationStatus: result.faceVerificationStatus
            });
        } catch (error) {
            setTestResult({
                type: 'exit',
                success: false,
                message: error.response?.data?.message || 'Test failed',
                error: error
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (section, field, value) => {
        setTestData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const tabs = [
        { id: 'registration', label: '📝 Registration Test', color: 'blue' },
        { id: 'entry', label: '🚗 Entry Test', color: 'green' },
        { id: 'exit', label: '🏁 Exit Test', color: 'orange' }
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    🔬 Face Recognition API Test Center
                </h1>
                <p className="text-gray-600">
                    Test các API endpoint mới cho Face Recognition trong hệ thống parking
                </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setTestResult(null);
                        }}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            activeTab === tab.id
                                ? `bg-${tab.color}-500 text-white shadow-sm`
                                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Panel - Configuration */}
                <div className="space-y-6">
                    {/* Face Image Upload */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            📸 Face Image Upload
                        </h3>
                        <ImageUploadWithPreview
                            onImageChange={handleImageChange}
                            label="Test Face Image"
                            isRequired={true}
                            accept="image/*"
                            previewClassName="w-32 h-32"
                            disabled={loading}
                        />
                    </div>

                    {/* Test Data Configuration */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            ⚙️ Test Data Configuration
                        </h3>
                        
                        {activeTab === 'registration' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Biển số xe"
                                        value={testData.registration.bienSoXe}
                                        onChange={(e) => handleInputChange('registration', 'bienSoXe', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tên xe"
                                        value={testData.registration.tenXe}
                                        onChange={(e) => handleInputChange('registration', 'tenXe', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={testData.registration.email}
                                    onChange={(e) => handleInputChange('registration', 'email', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Số điện thoại"
                                    value={testData.registration.soDienThoai}
                                    onChange={(e) => handleInputChange('registration', 'soDienThoai', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                        )}

                        {activeTab === 'entry' && (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Biển số xe"
                                    value={testData.entry.bienSoXe}
                                    onChange={(e) => handleInputChange('entry', 'bienSoXe', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <select
                                    value={testData.entry.maBaiDo}
                                    onChange={(e) => handleInputChange('entry', 'maBaiDo', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="P001">P001 - Bãi đỗ xe máy</option>
                                    <option value="P002">P002 - Bãi đỗ xe ô tô</option>
                                </select>
                            </div>
                        )}

                        {activeTab === 'exit' && (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Biển số xe"
                                    value={testData.exit.bienSoXe}
                                    onChange={(e) => handleInputChange('exit', 'bienSoXe', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Test Button */}
                    <button
                        onClick={() => {
                            if (activeTab === 'registration') handleTestRegistration();
                            else if (activeTab === 'entry') handleTestEntry();
                            else if (activeTab === 'exit') handleTestExit();
                        }}
                        disabled={loading || !faceImageBase64}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Testing...
                            </>
                        ) : (
                            `🧪 Test ${activeTab === 'registration' ? 'Registration' : activeTab === 'entry' ? 'Entry' : 'Exit'} API`
                        )}
                    </button>
                </div>

                {/* Right Panel - Results */}
                <div className="space-y-6">
                    {/* Face Recognition Status */}
                    {testResult && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                🎯 Face Recognition Result
                            </h3>
                            <FaceRecognitionStatus
                                isEnabled={true}
                                similarity={testResult.faceSimilarity}
                                status={testResult.faceVerificationStatus}
                                faceId={testResult.faceId}
                                isProcessing={loading}
                            />
                        </div>
                    )}

                    {/* API Response */}
                    {testResult && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                📋 API Response
                            </h3>
                            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-sm font-medium ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                                        {testResult.success ? '✅ Success' : '❌ Failed'}
                                    </span>
                                </div>
                                <p className={`text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'} mb-3`}>
                                    {testResult.message}
                                </p>
                                
                                {/* Response Details */}
                                <details className="text-xs">
                                    <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                                        📄 Raw Response Data
                                    </summary>
                                    <pre className="bg-gray-100 p-3 rounded border overflow-auto max-h-64 text-xs">
                                        {JSON.stringify(testResult.data || testResult.error, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        </div>
                    )}

                    {/* API Endpoints Info */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            🔗 API Endpoints
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className={`p-3 rounded-lg ${activeTab === 'registration' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                                <div className="font-medium text-blue-700">POST /dang-ky-thang/with-face</div>
                                <div className="text-gray-600">Đăng ký tháng với Face Recognition</div>
                            </div>
                            <div className={`p-3 rounded-lg ${activeTab === 'entry' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                <div className="font-medium text-green-700">POST /parking-transactions/direct-entry-with-face</div>
                                <div className="text-gray-600">Xe vào bãi với Face Recognition</div>
                            </div>
                            <div className={`p-3 rounded-lg ${activeTab === 'exit' ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                                <div className="font-medium text-orange-700">POST /parking-transactions/direct-exit-with-face</div>
                                <div className="text-gray-600">Xe ra bãi với Face Recognition</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceRecognitionTestPage;