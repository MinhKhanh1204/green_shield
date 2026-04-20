import React from 'react';
import './CustomBagLayout.css';

export default function CustomBagLayout({ children }) {
  return (
    <div className="custom-bag-layout">
      {children}
    </div>
  );
}
