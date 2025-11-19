import { useEffect } from 'react';
import { useWalletConnection } from '../hooks/useWalletConnection';

const WalletTest = () => {
  const { 
    isConnected, 
    walletAddress, 
    shortAddress, 
    connect, 
    disconnect 
  } = useWalletConnection();

  useEffect(() => {
    console.log('Wallet connection status:', { isConnected, walletAddress });
  }, [isConnected, walletAddress]);

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Wallet Connection Test</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-white">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {isConnected && (
          <div className="bg-gray-700 p-3 rounded">
            <p className="text-gray-300 text-sm">Wallet Address:</p>
            <p className="text-white font-mono text-sm break-all">{walletAddress}</p>
            <p className="text-gray-400 text-xs mt-1">Short: {shortAddress}</p>
          </div>
        )}
        
        <div className="flex space-x-3">
          {!isConnected ? (
            <button
              onClick={connect}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletTest;
