import React from 'react';

function Box({ className = '' }) {
  return <div className={`app-skeleton-box ${className}`.trim()} aria-hidden="true" />;
}

export default function AppSkeleton({ variant = 'page' }) {
  if (variant === 'template') {
    return (
      <div className="app-skeleton app-skeleton--template" aria-label="Loading template page">
        <div className="app-skeleton-hero">
          <Box className="sk-logo" />
          <Box className="sk-badge" />
          <Box className="sk-title" />
          <Box className="sk-subtitle" />
          <Box className="sk-search" />
        </div>
        <div className="app-skeleton-grid">
          <Box className="sk-card" />
          <Box className="sk-card" />
          <Box className="sk-card" />
        </div>
      </div>
    );
  }

  if (variant === 'map') {
    return (
      <div className="app-skeleton app-skeleton--map" aria-label="Loading map page">
        <Box className="sk-map-overview" />
        <Box className="sk-map-filter" />
        <Box className="sk-map-canvas" />
      </div>
    );
  }

  if (variant === 'login') {
    return (
      <div className="app-skeleton app-skeleton--login" aria-label="Loading login page">
        <Box className="sk-login-card" />
      </div>
    );
  }

  return (
    <div className="app-skeleton app-skeleton--page" aria-label="Loading">
      <Box className="sk-page-main" />
    </div>
  );
}
