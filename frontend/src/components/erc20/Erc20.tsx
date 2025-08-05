import React, { useEffect, useState, useCallback } from 'react';
import ContractAbi from '../../contracts/Erc20.json';
import ContractDetails from '../../contracts/deployment.json';
import { BrowserProvider, Contract, ethers } from 'ethers';
import GetBalanceAddress from '../../components/ReadingFromBlockchain/GetBalanceAddress';
import TransferToken from '../../components/WritingToBlockchain/TransferToken';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const ABI = ContractAbi.abi;

const Erc20: React.FC = () => {
  const [accounts, setAccounts] = useState<string[]>();
  const [connectedAccount, setConnectedAccount] = useState<string>();
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [tokenInfo, setTokenInfo] = useState<{name?: string, symbol?: string, decimals?: number}>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Check if wallet is already connected and update state
   */
  const checkIfWalletIsConnected = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const accountList: string[] = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accountList.length > 0) {
        setAccounts(accountList);
        setConnectedAccount(accountList[0]);
        console.log('Connected wallet:', accountList[0]);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  }, []);

  /**
   * Triggered when user clicks "Connect Wallet"
   */
  const handleConnectWallet = async () => {
    if (!window.ethereum) return;

    try {
      const accountList: string[] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accountList.length > 0) {
        setAccounts(accountList);
        setConnectedAccount(accountList[0]);
        console.log('Wallet connected:', accountList[0]);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  /**
   * Initialize provider and contract
   */
  const initiateContract = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);

      setProvider(web3Provider);


      
      const signer = await web3Provider.getSigner();
      
      // Optionally, you can verify chain ID or name here
      const network = await web3Provider.getNetwork();
      console.log('Connected to network:', network.name, `Chain ID: ${network.chainId}`);

      const contractInstance = new Contract(
        ContractDetails.address, // Ensure this matches the current network
        ABI,
        signer
      );

      setContract(contractInstance);
      console.log('Contract initialized:', contractInstance);
    } catch (error) {
      console.error('Failed to initialize contract:', error);
    }
  }, [connectedAccount]);

  /**
   * Run on mount: check wallet and setup listener
   */
  useEffect(() => {
    checkIfWalletIsConnected();

    // Listen for account changes
    window.ethereum?.on('accountsChanged', checkIfWalletIsConnected);

    return () => {
      window.ethereum?.removeListener('accountsChanged', checkIfWalletIsConnected);
    };
  }, [checkIfWalletIsConnected]);

  /**
   * Run on mount: initialize the contract
   */
  useEffect(() => {
    initiateContract();
  }, [initiateContract]);

  const handleGetInfo = async () => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }

    try {
      setIsLoading(true);
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);
      
      setTokenInfo({ name, symbol, decimals: Number(decimals) });
      console.log('Token info:', { name, symbol, decimals: Number(decimals) });
    } catch (error) {
      console.error('Error getting token info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ERC-20 Token
            </h1>
            
            <button
              onClick={handleConnectWallet}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 font-medium">
                Connect Wallet
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </header>

      {/* Connection Status */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
          connectedAccount 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            connectedAccount ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`}></div>
          <span className="text-sm font-medium">
            {connectedAccount ? `${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}` : 'Not Connected'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Write Operations */}
          <div className="group">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 transition-all duration-300 hover:border-green-500/30 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-green-400">Transfer Tokens</h2>
              </div>
              
              <TransferToken 
                setIsLoading={setIsLoading} 
                isLoading={isLoading} 
                connectedAccount={connectedAccount} 
                contract={contract}
              />
            </div>
          </div>

          {/* Read Operations */}
          <div className="group">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-blue-400">Read Information</h2>
              </div>

              <div className="space-y-6">
                {/* Token Info Section */}
                <div className="space-y-4">
                  <button 
                    onClick={handleGetInfo} 
                    disabled={isLoading || !contract}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      'Get Token Info'
                    )}
                  </button>
                  
                  {tokenInfo.name && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 animate-fadeIn">
                      <h3 className="text-lg font-semibold mb-3 text-blue-300">Token Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Name:</span>
                          <span className="font-medium">{tokenInfo.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Symbol:</span>
                          <span className="font-medium">{tokenInfo.symbol}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Decimals:</span>
                          <span className="font-medium">{tokenInfo.decimals}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Balance Check */}
                <div className="border-t border-gray-700/50 pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-blue-300">Check Balance</h3>
                  <GetBalanceAddress 
            
                    contract={contract}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Erc20;