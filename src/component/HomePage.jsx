import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();

    const handleJoin = () => {
        navigate('/dashboard');
    };

    return (
        <div className="welcome-container">
            <h1>Chào mừng đến với SmartParking</h1>
            <button onClick={handleJoin} className="join-button">Join</button>
        </div>
    );
};

export default HomePage;



