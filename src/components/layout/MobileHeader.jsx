import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MobileMenu from './MobileMenu';

export default function MobileHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Detect if we're on a sub-page (more than one level deep)
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isSubPage = pathParts.length > 1;

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header 
      className="md:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b"
      style={{
        height: '60px',
        background: 'linear-gradient(180deg, rgba(212, 237, 232, 0.95) 0%, rgba(200, 230, 225, 0.92) 100%)',
        borderColor: 'rgba(38, 166, 154, 0.25)',
        boxShadow: '0 2px 12px rgba(38, 166, 154, 0.1)'
      }}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Back button or Hamburger Menu */}
        {isSubPage ? (
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#26A69A' }} />
          </button>
        ) : (
          <MobileMenu />
        )}
        
        {/* Center: Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center shadow-md" style={{ 
            borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, #26A69A, #38B2AC)'
          }}>
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <h1 className="text-base font-semibold" style={{ color: '#1A3A34' }}>MindWell</h1>
        </div>
        
        {/* Right: Spacer for balance */}
        <div className="w-10" />
      </div>
    </header>
  );
}