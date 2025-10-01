import axios from 'axios';
import { DEV_CONFIG } from '../utils/devConfig';

const API_BASE_URL = DEV_CONFIG.API_BASE_URL || 'http://localhost:8080';

class FaceRecognitionService {
    
    /**
     * Test connection to face recognition service
     */
    static async testConnection() {
        try {
            console.log('Testing connection to:', `${API_BASE_URL}/api/v1/simple-face/test`);
            const response = await axios.get(`${API_BASE_URL}/api/v1/simple-face/test`);
            console.log('Test response:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Face Recognition test error:', error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Connection failed'
            };
        }
    }

    /**
     * Check health of face recognition service
     */
    static async checkHealth() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/simple-face/health`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Face Recognition health check error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Health check failed'
            };
        }
    }

    /**
     * Register face with base64 image
     */
    static async registerFace(name, base64Image, description = '') {
        try {
            console.log('Registering face:', { name, description });
            const response = await axios.post(`${API_BASE_URL}/api/v1/simple-face/register`, {
                name,
                image: base64Image,
                description
            });
            console.log('Register response:', response.data);
            
            // Handle nested response structure
            const success = response.data?.statusCode === 200 || response.data?.data?.success;
            
            return {
                success: success,
                data: response.data?.data || response.data,
                message: response.data?.message || 'Face registered successfully'
            };
        } catch (error) {
            console.error('Face registration error:', error);
            
            // Return mock data for development if API fails
            if (DEV_CONFIG.USE_MOCK_DATA) {
                console.warn('Using mock data for registerFace');
                return {
                    success: true,
                    data: {
                        success: true,
                        message: "Face registered successfully (mock)",
                        person: {
                            id: Math.floor(Math.random() * 1000),
                            name: name,
                            description: description,
                            createdAt: new Date().toISOString()
                        }
                    }
                };
            }
            
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Registration failed'
            };
        }
    }

    /**
     * Register face with file upload
     */
    static async registerFaceFromFile(name, imageFile, description = '') {
        try {
            console.log('Registering face from file:', { name, description, fileSize: imageFile.size, fileType: imageFile.type });
            
            const formData = new FormData();
            formData.append('name', name);
            formData.append('image', imageFile);
            if (description && description.trim()) {
                formData.append('description', description);
            }

            console.log('FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const response = await axios.post(`${API_BASE_URL}/api/v1/simple-face/register-file`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Registration response:', response.data);
            
            // Handle nested response structure similar to other methods
            const apiData = response.data?.data;
            const success = response.data?.statusCode === 200 || apiData?.success;
            
            return {
                success: success,
                data: apiData || response.data,
                message: response.data?.message || 'Face registered successfully'
            };
        } catch (error) {
            console.error('Face registration from file error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Registration failed'
            };
        }
    }

    /**
     * Recognize face with base64 image
     */
    static async recognizeFace(base64Image, threshold = 0.6) {
        try {
            console.log('Recognizing face with threshold:', threshold);
            const response = await axios.post(`${API_BASE_URL}/api/v1/simple-face/recognize`, {
                image: base64Image,
                threshold
            });
            
            console.log('Recognition response:', response.data);
            
            // Extract recognition data from nested response
            const apiData = response.data?.data;
            // Logic đúng: nếu face_id không null thì nhận diện thành công
            const isRecognized = apiData?.face_id !== null && apiData?.face_id !== undefined;
            
            return {
                success: isRecognized,
                data: {
                    recognized: isRecognized,
                    name: apiData?.name || null,
                    face_id: apiData?.face_id || null,
                    similarity: apiData?.similarity || 0,
                    confidence: apiData?.confidence || 0,
                    processing_time: apiData?.processing_time || 0,
                    message: apiData?.message || (isRecognized ? 'Nhận diện thành công' : 'Không nhận diện được')
                },
                message: response.data?.message || 'API call completed'
            };
        } catch (error) {
            console.error('Face recognition error:', error);
            return {
                success: false,
                data: {
                    recognized: false,
                    name: null,
                    face_id: null,
                    similarity: 0,
                    confidence: 0,
                    processing_time: 0,
                    message: 'Lỗi khi nhận diện khuôn mặt'
                },
                error: error.response?.data?.message || error.message || 'Recognition failed'
            };
        }
    }

    /**
     * Recognize face from file upload
     */
    static async recognizeFaceFromFile(imageFile, threshold = 0.6) {
        try {
            console.log('Recognizing face from file with threshold:', threshold);
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('threshold', threshold.toString());

            const response = await axios.post(`${API_BASE_URL}/api/v1/simple-face/recognize-file`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Recognition from file response:', response.data);
            
            // Extract recognition data from nested response
            const apiData = response.data?.data;
            // Logic đúng: nếu face_id không null thì nhận diện thành công
            const isRecognized = apiData?.face_id !== null && apiData?.face_id !== undefined;
            
            return {
                success: isRecognized,
                data: {
                    recognized: isRecognized,
                    name: apiData?.name || null,
                    face_id: apiData?.face_id || null,
                    similarity: apiData?.similarity || 0,
                    confidence: apiData?.confidence || 0,
                    processing_time: apiData?.processing_time || 0,
                    message: apiData?.message || (isRecognized ? 'Nhận diện thành công' : 'Không nhận diện được')
                },
                message: response.data?.message || 'API call completed'
            };
        } catch (error) {
            console.error('Face recognition from file error:', error);
            return {
                success: false,
                data: {
                    recognized: false,
                    name: null,
                    face_id: null,
                    similarity: 0,
                    confidence: 0,
                    processing_time: 0,
                    message: 'Lỗi khi nhận diện khuôn mặt'
                },
                error: error.response?.data?.message || error.message || 'Recognition failed'
            };
        }
    }

    /**
     * Compare two faces
     */
    static async compareFaces(base64Image1, base64Image2, threshold = 0.6) {
        try {
            console.log('Comparing faces with threshold:', threshold);
            const response = await axios.post(`${API_BASE_URL}/api/v1/simple-face/compare`, {
                image1: base64Image1,
                image2: base64Image2,
                threshold
            });
            
            console.log('Compare response:', response.data);
            
            // Handle nested response structure
            const apiData = response.data?.data;
            const success = response.data?.statusCode === 200 || apiData?.success;
            
            return {
                success: success,
                data: {
                    similarity: apiData?.similarity || 0,
                    confidence: apiData?.confidence || 0,
                    processing_time: apiData?.processing_time || 0,
                    message: apiData?.message || 'Comparison completed',
                    threshold: threshold,
                    match: (apiData?.similarity || 0) >= threshold
                },
                message: response.data?.message || 'API call completed'
            };
        } catch (error) {
            console.error('Face comparison error:', error);
            return {
                success: false,
                data: {
                    similarity: 0,
                    confidence: 0,
                    processing_time: 0,
                    message: 'Lỗi khi so sánh khuôn mặt',
                    threshold: threshold,
                    match: false
                },
                error: error.response?.data?.message || error.message || 'Comparison failed'
            };
        }
    }

    /**
     * Compare two faces from file uploads
     * Converts files to base64 and uses /compare endpoint
     */
    static async compareFacesFromFiles(imageFile1, imageFile2, threshold = 0.6) {
        try {
            console.log('Comparing faces from files with threshold:', threshold);
            
            // Convert both files to base64
            const base64Image1 = await this.fileToBase64(imageFile1);
            const base64Image2 = await this.fileToBase64(imageFile2);
            
            console.log('Files converted to base64, calling compare endpoint');
            
            // Use the existing compareFaces method with base64 images
            const response = await axios.post(`${API_BASE_URL}/api/v1/simple-face/compare`, {
                image1: base64Image1,
                image2: base64Image2,
                threshold
            });
            
            console.log('Comparison from files response:', response.data);
            
            // Handle nested response structure
            const apiData = response.data?.data;
            const success = response.data?.statusCode === 200 || apiData?.success;
            
            return {
                success: success,
                data: {
                    similarity: apiData?.similarity || 0,
                    confidence: apiData?.confidence || 0,
                    processing_time: apiData?.processing_time || 0,
                    message: apiData?.message || 'Comparison completed',
                    threshold: threshold,
                    match: (apiData?.similarity || 0) >= threshold
                },
                message: response.data?.message || 'API call completed'
            };
        } catch (error) {
            console.error('Face comparison from files error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                data: {
                    similarity: 0,
                    confidence: 0,
                    processing_time: 0,
                    message: 'Lỗi khi so sánh khuôn mặt',
                    threshold: threshold,
                    match: false
                },
                error: error.response?.data?.message || error.message || 'Comparison failed'
            };
        }
    }

    /**
     * List all registered faces
     */
    static async listRegisteredFaces() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/simple-face/list`);
            console.log('Raw API response:', response.data);
            
            // Handle the nested response structure from backend
            const apiData = response.data?.data;
            let faces = [];
            
            if (apiData && apiData.faces && Array.isArray(apiData.faces)) {
                // Map backend fields to frontend expected fields
                faces = apiData.faces.map(face => ({
                    id: face.face_id,
                    name: face.name,
                    description: face.description || '',
                    createdAt: face.created_at,
                    updatedAt: face.updated_at
                }));
            }
            
            console.log('Processed faces:', faces);
            
            return {
                success: true,
                data: faces,
                total: apiData?.count || faces.length
            };
        } catch (error) {
            console.error('List faces error:', error);
            
            // Return mock data for development if API fails
            if (DEV_CONFIG.USE_MOCK_DATA) {
                console.warn('Using mock data for listRegisteredFaces');
                return {
                    success: true,
                    data: [
                        {
                            id: 1,
                            name: "John Doe",
                            description: "Test person 1",
                            createdAt: "2025-09-30T10:00:00Z"
                        },
                        {
                            id: 2,
                            name: "Jane Smith", 
                            description: "Test person 2",
                            createdAt: "2025-09-30T11:00:00Z"
                        }
                    ]
                };
            }
            
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to load faces'
            };
        }
    }

    /**
     * Delete a registered face
     */
    static async deleteFace(faceId) {
        try {
            console.log('Deleting face with ID:', faceId);
            const response = await axios.delete(`${API_BASE_URL}/api/v1/simple-face/delete/${faceId}`);
            console.log('Delete response:', response.data);
            
            // Handle nested response structure
            const apiData = response.data?.data;
            const success = response.data?.statusCode === 200 || apiData?.success;
            
            return {
                success: success,
                data: apiData || response.data,
                message: response.data?.message || 'Face deleted successfully'
            };
        } catch (error) {
            console.error('Delete face error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Delete failed'
            };
        }
    }

    // Utility methods
    
    /**
     * Convert file to base64
     */
    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove data:image/jpeg;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    /**
     * Validate image file
     */
    static validateImageFile(file) {
        const errors = [];
        
        // Check file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            errors.push('Chỉ hỗ trợ file JPG, JPEG, PNG');
        }
        
        // Check file size (10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            errors.push('Kích thước file không được vượt quá 10MB');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get confidence level description
     */
    static getConfidenceDescription(confidence) {
        if (confidence >= 0.9) return 'Rất cao';
        if (confidence >= 0.8) return 'Cao';
        if (confidence >= 0.7) return 'Trung bình cao';
        if (confidence >= 0.6) return 'Trung bình';
        if (confidence >= 0.5) return 'Thấp';
        return 'Rất thấp';
    }

    /**
     * Get confidence color for UI
     */
    static getConfidenceColor(confidence) {
        if (confidence >= 0.8) return 'text-green-600';
        if (confidence >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    }
}

export default FaceRecognitionService;