
import { useEffect, useState } from 'react';

const DeploymentInfo = () => {
  const [deploymentInfo, setDeploymentInfo] = useState({
    hostname: '',
    origin: '',
    isProduction: false,
    resetPasswordUrl: ''
  });

  useEffect(() => {
    const isProduction = window.location.hostname.includes('vercel.app');
    const resetPasswordUrl = isProduction 
      ? 'https://help-desk-qmaz-v1-iota.vercel.app/reset-password'
      : `${window.location.origin}/reset-password`;

    setDeploymentInfo({
      hostname: window.location.hostname,
      origin: window.location.origin,
      isProduction,
      resetPasswordUrl
    });
  }, []);

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-3 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">Deployment Info</div>
      <div>Hostname: {deploymentInfo.hostname}</div>
      <div>Origin: {deploymentInfo.origin}</div>
      <div>Is Production: {deploymentInfo.isProduction ? 'Yes' : 'No'}</div>
      <div>Reset URL: {deploymentInfo.resetPasswordUrl}</div>
    </div>
  );
};

export default DeploymentInfo;
