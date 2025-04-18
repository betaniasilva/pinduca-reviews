'use client'; 

import React, { useState } from 'react';
import Header from './Header'; 
import LoginModal from './LoginModal'; 

interface LayoutClientWrapperProps {
  children: React.ReactNode;
}

const LayoutClientWrapper: React.FC<LayoutClientWrapperProps> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const handleOpenLoginModal = () => {
    console.log("LayoutClientWrapper: Abrindo modal de login..."); 
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    console.log("LayoutClientWrapper: Fechando modal de login..."); 
    setIsLoginModalOpen(false);
  };

  return (
    <>
      <Header onOpenLoginModal={handleOpenLoginModal} />
      {children}
      {isLoginModalOpen && <LoginModal onClose={handleCloseLoginModal} />}
    </>
  );
};

export default LayoutClientWrapper;