import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { checkAuth } from '../services/texture';
import './ProtectedRoute.css';

export default function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null);
  const location = useLocation();

  useEffect(() => {
    checkAuth().then(setAuth);
  }, []);

  if (auth === null) {
    return (
      <div className="protected-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!auth) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children;
}
