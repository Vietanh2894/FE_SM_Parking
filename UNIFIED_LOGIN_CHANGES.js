// Test các thay đổi unified login
// File này chỉ để tham khảo và test, có thể xóa sau khi test xong

/*
=== THAY ĐỔI CHÍNH ===

1. AUTHSERVICE.JS:
   - Thêm method login(credential, password) mới
   - Gọi endpoint /login thay vì /user/login và /login riêng biệt
   - Xử lý response với accessToken, userType, userInfo, staffInfo
   - Lưu thông tin phù hợp dựa trên userType
   - Thêm các helper methods: getUserType(), getCurrentUserInfo(), getCurrentUserRole()

2. LOGINPAGE.JSX:
   - Đổi từ username thành credential
   - Cập nhật placeholder và label để hướng dẫn người dùng
   - Sử dụng AuthService.login() thay vì gọi API trực tiếp
   - Logic redirect dựa trên userType (STAFF -> /dashboard, USER -> /home)

3. USEAUTH.JS:
   - Cập nhật logic checkAuth để xử lý cả userInfo và staffInfo
   - Sửa login method để sử dụng AuthService.login()
   - Cập nhật logout để sử dụng AuthService.performLogout()

=== TEST CASES ===

1. Test User Login:
   Credential: user10@gmail.com (có chứa @)
   Password: 123456
   Expected: userType = "USER", redirect to /home

2. Test Staff Login:
   Credential: admin001 (không có @)
   Password: admin123
   Expected: userType = "STAFF", redirect to /dashboard

3. Test Token Storage:
   - accessToken từ backend được lưu thành 'token' trong localStorage
   - userType được lưu vào localStorage
   - userInfo hoặc staffInfo được lưu tùy theo type

4. Test Role Detection:
   - USER: role từ userInfo.role
   - STAFF: role từ staffInfo.chucVu

=== BACKEND RESPONSE FORMAT ===

Success Response:
{
    "statusCode": 200,
    "message": "CALL API SUCCESS",
    "data": {
        "accessToken": "jwt-token-here",
        "userType": "USER" | "STAFF",
        "userInfo": {...} | null,
        "staffInfo": {...} | null
    }
}

Error Response:
{
    "statusCode": 400|401|500,
    "message": "Error message"
}

=== NOTES ===
- Backend field tên là 'accessToken' nhưng frontend lưu thành 'token'
- Logic phân biệt User/Staff dựa trên credential có chứa @ hay không
- Tất cả login đều qua endpoint /login duy nhất
*/

export const TEST_CREDENTIALS = {
    USER: {
        credential: 'user10@gmail.com',
        password: '123456'
    },
    STAFF: {
        credential: 'admin001', 
        password: 'admin123'
    }
};

// Helper function để test login
export const testLogin = async (type) => {
    const { credential, password } = TEST_CREDENTIALS[type];
    
    try {
        const response = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credential, password })
        });
        
        const data = await response.json();
        console.log(`${type} Login Test:`, data);
        return data;
    } catch (error) {
        console.error(`${type} Login Test Error:`, error);
        return null;
    }
};