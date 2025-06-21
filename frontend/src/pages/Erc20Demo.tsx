import React, { useState, useEffect } from 'react';
import { ethers, BrowserProvider, Contract } from 'ethers';
import { Wallet, Send, Coins, RefreshCw, AlertCircle, CheckCircle, Copy } from 'lucide-react';

import DeploymentDetail from "../contracts/deployment.json";
import ABI from "../contracts/Erc20.json";

const CONTRACT_ABI = ABI.abi;
const MOCK_CONTRACT_ADDRESS = (DeploymentDetail as { address: string }).address;

type MessageType = 'success' | 'error' | 'info' | '';

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
}

const Erc20Demo: React.FC = () => {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [totalSupply, setTotalSupply] = useState<string>('0');
  const [feeRecipient, setFeeRecipient] = useState<string>('');
  const [transferTo, setTransferTo] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<MessageType>('');
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({ name: '', symbol: '', decimals: 18 });
  const [calculatedFee, setCalculatedFee] = useState<string>('0');
  const [netTransfer, setNetTransfer] = useState<string>('0');

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (transferAmount && contract) {
      calculateTransferDetails();
    }
  }, [transferAmount, contract]);

  const initializeApp = async () => {
    try {
      if ((window as any).ethereum) {
        const web3Provider = new ethers.BrowserProvider((window as any).ethereum);
        setProvider(web3Provider);

        const contractInstance = new ethers.Contract(
          MOCK_CONTRACT_ADDRESS,
          CONTRACT_ABI,
          web3Provider
        );

        setContract(contractInstance);

        const name = await contractInstance.name();
        const symbol = await contractInstance.symbol();
        const decimals = await contractInstance.decimals();
        const supply = await contractInstance.totalSupply();
        const recipient = await contractInstance.feeRecipient();

        setTokenInfo({ name, symbol, decimals });
        setTotalSupply(ethers.formatUnits(supply, decimals));
        setFeeRecipient(recipient);

        showMessage('Contract connected successfully!', 'success');
      } else {
        showMessage('Please install MetaMask to use this app', 'error');
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      showMessage('Error connecting to contract.', 'error');
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const accounts: string[] = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
      await updateBalance(accounts[0]);
      showMessage('Wallet connected successfully!', 'success');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      showMessage('Error connecting wallet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateBalance = async (address: string = account) => {
    if (!contract || !address) return;
    try {
      const balanceBN = await contract.balanceOf(address);
      setBalance(ethers.formatUnits(balanceBN, tokenInfo.decimals));
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const calculateTransferDetails = async () => {
    if (!contract || !transferAmount) return;
    try {
      const amount = ethers.parseUnits(transferAmount, tokenInfo.decimals);
      const fee = await contract.calculateFee(amount);
      const net = await contract.calculateNetTransfer(amount);

      setCalculatedFee(ethers.formatUnits(fee, tokenInfo.decimals));
      setNetTransfer(ethers.formatUnits(net, tokenInfo.decimals));
    } catch (error) {
      console.error('Error calculating transfer details:', error);
    }
  };

  const handleTransfer = async () => {
    if (!contract || !account || !transferTo || !transferAmount) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const signer = await provider!.getSigner();
      const contractWithSigner = contract.connect(signer);
      const amount = ethers.parseUnits(transferAmount, tokenInfo.decimals);
      const tx = await contractWithSigner.transfer(transferTo, amount);
      showMessage('Transaction submitted!', 'info');
      await tx.wait();
      showMessage('Transfer successful!', 'success');
      await updateBalance();
      setTransferTo('');
      setTransferAmount('');
      setCalculatedFee('0');
      setNetTransfer('0');
    } catch (error: any) {
      console.error('Transfer error:', error);
      showMessage(`Transfer failed: ${error.reason || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetTokens = async () => {
    if (!contract || !account) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    // try {
    //   setIsLoading(true);
    //   const signer = await provider!.getSigner();
    //   const contractWithSigner = contract.connect(signer);
    //   const tx = await contractWithSigner.giveMeOneFullToken();
    //   showMessage('Requesting token...', 'info');
    //   await tx.wait();
    //   showMessage('Received 1 token!', 'success');
    //   await updateBalance();
    // } catch (error: any) {
    //   console.error('Get tokens error:', error);
    //   showMessage(`Failed to get tokens: ${error.reason || error.message}`, 'error');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const showMessage = (msg: string, type: MessageType) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showMessage('Copied to clipboard!', 'success');
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            ERC-20 Token with Transfer Fee
          </h1>
          <p className="text-blue-200">
            A demonstration of ERC-20 token with 1% transfer fee
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            messageType === 'success' ? 'bg-green-600 text-white' :
            messageType === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white'
          }`}>
            {messageType === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message}</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Wallet Connection & Token Info */}
          <div className="space-y-6">
            
            {/* Wallet Connection Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Wallet className="mr-2" size={20} />
                Wallet Connection
              </h2>
              
              {!account ? (
                <button
                  onClick={connectWallet}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin mr-2" size={20} />
                      Connecting...
                    </div>
                  ) : (
                    'Connect MetaMask'
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Address:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono">{formatAddress(account)}</span>
                      <button
                        onClick={() => copyToClipboard(account)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Balance:</span>
                    <span className="text-white font-semibold">
                      {parseFloat(balance).toFixed(4)} {tokenInfo.symbol}
                    </span>
                  </div>
                  <button
                    onClick={() => updateBalance()}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    <RefreshCw className="inline mr-2" size={16} />
                    Refresh Balance
                  </button>
                </div>
              )}
            </div>

            {/* Token Information Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Coins className="mr-2" size={20} />
                Token Information
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Name:</span>
                  <span className="text-white font-semibold">{tokenInfo.name}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Symbol:</span>
                  <span className="text-white font-semibold">{tokenInfo.symbol}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Total Supply:</span>
                  <span className="text-white font-semibold">
                    {parseFloat(totalSupply).toLocaleString()} {tokenInfo.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Fee Recipient:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono">{formatAddress(feeRecipient)}</span>
                    <button
                      onClick={() => copyToClipboard(feeRecipient)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center text-yellow-300 mb-1">
                    <AlertCircle size={16} className="mr-2" />
                    <span className="font-semibold">Transfer Fee: 1%</span>
                  </div>
                  <p className="text-yellow-200 text-sm">
                    All transfers will deduct 1% fee sent to the fee recipient
                  </p>
                </div>
              </div>
            </div>

            {/* Get Tokens Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Get Test Tokens</h2>
              <p className="text-gray-300 mb-4">
                Get 1 free token for testing transfers and fees.
              </p>
              <button
                onClick={handleGetTokens}
                disabled={isLoading || !account}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="animate-spin mr-2" size={20} />
                    Processing...
                  </div>
                ) : (
                  <>
                    <Coins className="inline mr-2" size={20} />
                    Get 1 Free Token
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Transfer */}
          <div className="space-y-6">
            
            {/* Transfer Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Send className="mr-2" size={20} />
                Send Tokens (with 1% Fee)
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Recipient Address</label>
                  <input
                    type="text"
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    placeholder="0x..."
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.001"
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                  <div className="mt-2 text-sm text-gray-400">
                    Available: {parseFloat(balance).toFixed(4)} {tokenInfo.symbol}
                  </div>
                </div>

                {/* Transfer Details */}
                {transferAmount && parseFloat(transferAmount) > 0 && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/20">
                    <h4 className="text-white font-semibold mb-3">Transfer Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Amount to send:</span>
                        <span className="text-white">{transferAmount} {tokenInfo.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Fee (1%):</span>
                        <span className="text-red-400">-{calculatedFee} {tokenInfo.symbol}</span>
                      </div>
                      <div className="border-t border-white/20 pt-2">
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-300">Recipient receives:</span>
                          <span className="text-green-400">{netTransfer} {tokenInfo.symbol}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleTransfer}
                  disabled={isLoading || !account || !transferTo || !transferAmount || parseFloat(transferAmount) <= 0}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin mr-2" size={20} />
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="inline mr-2" size={20} />
                      Send Tokens
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Contract Information */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Contract Details</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Contract Address:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono">{formatAddress(MOCK_CONTRACT_ADDRESS)}</span>
                    <button
                      onClick={() => copyToClipboard(MOCK_CONTRACT_ADDRESS)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <p className="text-blue-200 text-sm">
                    <strong>Note:</strong> This contract is deployed on Hardhat local network. 
                    Make sure you're connected to localhost:8545 (Chain ID: 31337).
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">How to Use</h2>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-xs">1</div>
                  <p>Connect your MetaMask wallet to the Hardhat local network</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-xs">2</div>
                  <p>Get free test tokens using the "Get 1 Free Token" button</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-xs">3</div>
                  <p>Send tokens to any address and observe the 1% fee deduction</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-xs">4</div>
                  <p>Check that the fee recipient receives 1% of every transfer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Erc20Demo;
