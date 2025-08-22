import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            console.log('Attempting login...');
            const response = await api.post('/login', {
                username,
                password,
            });

            console.log('Login response:', response.data);

            if (response.data && response.data.data && response.data.data.accessToken) {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                console.log('Token stored, navigating to home...');
                navigate('/home');
            } else {
                setError('Login failed: No access token received.');
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.response?.data) {
                setError(err.response.data.message || err.response.data.error || 'Login failed');
            } else if (err.code === 'ERR_NETWORK') {
                setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối!');
            } else {
                setError('Invalid username or password.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Login</h2>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;
