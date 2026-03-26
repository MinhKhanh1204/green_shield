import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import logolg from '../assets/logo-lg.png';
import './CustomBagLayout.css';

export default function CustomBagLayout({ children }) {
  const { pathname } = useLocation();
  const hideHeader = pathname.includes('/design') || pathname.includes('/checkout') || pathname.includes('/preview');

  return (
    <div className="custom-bag-layout">
      {!hideHeader && (
        <header className="custom-bag-header">
          <Link to="/" className="custom-bag-logo">
            <img src={logo} alt="logo" width="24" />
            <img className="logo-lg" src={logolg} alt="GreenShield" width="100" />
          </Link>
          <Link to="/" className="custom-bag-home">Về trang chủ</Link>
        </header>
      )}
      {children}
    </div>
  );
}
