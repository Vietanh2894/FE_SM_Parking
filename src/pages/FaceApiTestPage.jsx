import React, { useState } from 'react';
import FaceRecognitionService from '../services/faceRecognitionService';
import DashboardNavigation from '../components/DashboardNavigation';

const FaceApiTestPage = () => {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState({});
    const [testFile, setTestFile] = useState(null);
    const [testName, setTestName] = useState('Test User');
    const [testDescription, setTestDescription] = useState('Test Description');

    const runTest = async (testName, testFn) => {
        setLoading(prev => ({ ...prev, [testName]: true }));
        try {
            const result = await testFn();
            setResults(prev => ({ 
                ...prev, 
                [testName]: { 
                    success: result.success, 
                    data: result.data, 
                    error: result.error,
                    message: result.message,
                    timestamp: new Date().toLocaleTimeString()
                }
            }));
        } catch (error) {
            setResults(prev => ({ 
                ...prev, 
                [testName]: { 
                    success: false, 
                    error: error.message,
                    timestamp: new Date().toLocaleTimeString()
                }
            }));
        }
        setLoading(prev => ({ ...prev, [testName]: false }));
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setTestFile(file);
    };

    const testRegisterFile = () => {
        if (!testFile) {
            alert('Please select a file first');
            return;
        }
        return FaceRecognitionService.registerFaceFromFile(testName, testFile, testDescription);
    };

    const testRecognizeFile = () => {
        if (!testFile) {
            alert('Please select a file first');
            return;
        }
        return FaceRecognitionService.recognizeFaceFromFile(testFile, 0.6);
    };

    const tests = [
        {
            name: 'connection',
            label: 'Test Connection',
            fn: () => FaceRecognitionService.testConnection()
        },
        {
            name: 'health',
            label: 'Health Check', 
            fn: () => FaceRecognitionService.checkHealth()
        },
        {
            name: 'list',
            label: 'List Faces',
            fn: () => FaceRecognitionService.listRegisteredFaces()
        },
        {
            name: 'registerFile',
            label: 'Register Face (File)',
            fn: testRegisterFile
        },
        {
            name: 'recognizeFile',
            label: 'Recognize Face (File)',
            fn: testRecognizeFile
        }
    ];

    const getStatusColor = (result) => {
        if (!result) return 'bg-gray-100';
        return result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNavigation />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Face Recognition API Tester</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Test các API endpoints của Face Recognition system
                    </p>
                </div>

                {/* File Upload Section */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Test File Upload</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Test Image File
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {testFile && (
                                <p className="mt-2 text-sm text-gray-600">
                                    File: {testFile.name} ({(testFile.size / 1024).toFixed(1)} KB)
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Test Name
                            </label>
                            <input
                                type="text"
                                value={testName}
                                onChange={(e) => setTestName(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                                Test Description
                            </label>
                            <input
                                type="text"
                                value={testDescription}
                                onChange={(e) => setTestDescription(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* API Tests */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">API Endpoint Tests</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tests.map((test) => (
                            <div key={test.name} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-gray-900">{test.label}</h3>
                                    <button
                                        onClick={() => runTest(test.name, test.fn)}
                                        disabled={loading[test.name]}
                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading[test.name] ? 'Testing...' : 'Test'}
                                    </button>
                                </div>
                                
                                {results[test.name] && (
                                    <div className={`mt-3 p-3 rounded text-sm ${getStatusColor(results[test.name])}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">
                                                {results[test.name].success ? '✅ Success' : '❌ Failed'}
                                            </span>
                                            <span className="text-xs opacity-75">
                                                {results[test.name].timestamp}
                                            </span>
                                        </div>
                                        
                                        {results[test.name].message && (
                                            <p className="mb-2 font-medium">{results[test.name].message}</p>
                                        )}
                                        
                                        {results[test.name].error && (
                                            <p className="text-red-600 mb-2">{results[test.name].error}</p>
                                        )}
                                        
                                        {results[test.name].data && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer font-medium">Response Data</summary>
                                                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                                    {JSON.stringify(results[test.name].data, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Backend Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-4">Backend Configuration</h2>
                    <div className="text-sm text-blue-800">
                        <p><strong>API Base URL:</strong> http://localhost:8080</p>
                        <p><strong>Expected Endpoints:</strong></p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>GET /api/v1/simple-face/test</li>
                            <li>GET /api/v1/simple-face/health</li>
                            <li>GET /api/v1/simple-face/list</li>
                            <li>POST /api/v1/simple-face/register-file</li>
                            <li>POST /api/v1/simple-face/recognize-file</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceApiTestPage;