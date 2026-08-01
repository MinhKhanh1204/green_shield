import React from 'react';
import './CustomBagLayout.css';
import { useLocation } from 'react-router-dom';

export default function CustomBagLayout({ children }) {
  const location = useLocation();
  const hasMainNav = location.pathname === '/custom-bag';

  return (
    <div className={`custom-bag-layout${hasMainNav ? ' custom-bag-layout--with-nav' : ''}`}>
      {children}
    </div>
  );
}
