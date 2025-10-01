import React, { useState } from 'react';
import FaceRecognitionService from '../services/faceRecognitionService';

const FaceApiTester = () => {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState({});

    const testEndpoint = async (endpointName, testFn) => {
        setLoading(prev => ({ ...prev, [endpointName]: true }));
        try {
            const result = await testFn();
            setResults(prev => ({ 
                ...prev, 
                [endpointName]: { 
                    success: result.success, 
                    data: result.data, 
                    error: result.error,
                    timestamp: new Date().toLocaleTimeString()
                }
            }));
        } catch (error) {
            setResults(prev => ({ 
                ...prev, 
                [endpointName]: { 
                    success: false, 
                    error: error.message,
                    timestamp: new Date().toLocaleTimeString()
                }
            }));
        }
        setLoading(prev => ({ ...prev, [endpointName]: false }));
    };

    const tests = [
        {
            name: 'test',
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
        }
    ];

    const getStatusColor = (result) => {
        if (!result) return 'bg-gray-100';
        return result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Face Recognition API Tester
                </h1>
                
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">API Endpoints Test</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {tests.map(test => (
                            <div key={test.name} className="border rounded-lg p-4">
                                <h3 className="font-medium mb-2">{test.label}</h3>
                                <button
                                    onClick={() => testEndpoint(test.name, test.fn)}
                                    disabled={loading[test.name]}
                                    className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mb-2"
                                >
                                    {loading[test.name] ? 'Testing...' : 'Test'}
                                </button>
                                
                                {results[test.name] && (
                                    <div className={`p-2 rounded text-xs ${getStatusColor(results[test.name])}`}>
                                        <div className="font-medium">
                                            {results[test.name].success ? '✅ Success' : '❌ Failed'}
                                        </div>
                                        <div className="mt-1">
                                            Time: {results[test.name].timestamp}
                                        </div>
                                        {results[test.name].error && (
                                            <div className="mt-1 text-red-600">
                                                Error: {results[test.name].error}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Results Display */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Test Results</h2>
                    <div className="space-y-4">
                        {Object.entries(results).map(([endpoint, result]) => (
                            <div key={endpoint} className="border rounded-lg p-4">
                                <h3 className="font-medium mb-2 capitalize">{endpoint} Endpoint</h3>
                                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Backend URLs Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-4">Backend Configuration</h2>
                    <div className="text-sm text-blue-800">
                        <p><strong>API Base URL:</strong> http://localhost:8080</p>
                        <p><strong>Expected Endpoints:</strong></p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>GET /api/v1/simple-face/test</li>
                            <li>GET /api/v1/simple-face/health</li>
                            <li>GET /api/v1/simple-face/list</li>
                            <li>POST /api/v1/simple-face/register</li>
                            <li>POST /api/v1/simple-face/recognize</li>
                            <li>POST /api/v1/simple-face/compare</li>
                            <li>DELETE /api/v1/simple-face/delete/{'{faceId}'}</li>
                        </ul>
                    </div>
                </div>

                {/* Troubleshooting */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                    <h2 className="text-lg font-semibold text-yellow-900 mb-4">Troubleshooting</h2>
                    <div className="text-sm text-yellow-800">
                        <p><strong>If you see 404 errors:</strong></p>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                            <li>Check if Spring Boot backend is running on port 8080</li>
                            <li>Verify SimpleFaceRecognitionController mapping is correct</li>
                            <li>Check SimpleFaceRecognitionService baseUrl configuration</li>
                            <li>Ensure @CrossOrigin is properly configured</li>
                        </ol>
                        
                        <p className="mt-4"><strong>Backend Service URLs should be:</strong></p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>baseUrl + "/register" (not "/face/register")</li>
                            <li>baseUrl + "/recognize" (not "/face/recognize")</li>
                            <li>baseUrl + "/list" (not "/face/list")</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceApiTester;