import React from 'react';

const LoadingMessage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-admin-bg">
      <div className="spinner mb-4" style={{ width: '3rem', height: '3rem' }}></div>
      <h3 className="text-xl font-semibold text-admin-text">Loading...</h3>
    </div>
  );
};

export default LoadingMessage;
