'use client';

import React from 'react';
import LoginModal from '@/components/LoginModal'; 

const LoginPage: React.FC = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <LoginModal onClose={() => console.log('Modal closed')} />
        </div>
    );
};

export default LoginPage;