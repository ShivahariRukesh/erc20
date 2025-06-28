import React, { useEffect, useState, useCallback } from 'react';
import ContractAbi from '../contracts/Erc20.json';
import ContractDetails from '../contracts/deployment.json';
import { BrowserProvider, Contract, ethers } from 'ethers';

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
const [getBalanceOf, setGetBalanceOf] = useState();
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

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!contract) {
      console.error('Contract not initialized');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const amount = formData.get('amount') as string;
    const address = formData.get('address') as string;

    // Validate inputs
    if (!amount || !address) {
      console.error('Amount and address are required');
      return;
    }

    // Validate Ethereum address format
    // if (!ethers.isAddress(address)) {
    //   console.error('Invalid Ethereum address format');
    //   return;
    // }

    try {
      setIsLoading(true);
      
      // Get token decimals for proper amount conversion
      const decimals = await contract.decimals();
      
      // Convert amount to proper decimal places (e.g., for 18 decimals: 1 token = 1e18 wei)
      const amountInWei = ethers.parseUnits(amount, decimals);
      
      console.log(`Transferring ${amount} tokens (${amountInWei} wei) to ${address}`);
      
      // Execute transfer - address is already validated, no ENS resolution needed
      const tx = await contract.transfer(address, amountInWei);
      
      console.log('Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Reset form
      // e.currentTarget.reset();
      
    } catch (error) {
      console.error('Transfer failed:', error);
      
      // Handle specific error types
      if (error.code === 'INSUFFICIENT_FUNDS') {
        console.error('Insufficient funds for this transaction');
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        console.error('Cannot estimate gas, transaction may fail');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetBalanceOf = async(e:React.FormEvent<HTMLFormElement>)=>{

    e.preventDefault()
    const address = new FormData(e.currentTarget).get('address') as string;
const res =await contract?.balanceOf(address);
    setGetBalanceOf(res)
  }

  return (
    <div className='bg-black h-[100vh] text-white'>
      <div className='flex flex-row-reverse'>
        <nav className='p-6'>
          <ul>
            <li 
              onClick={handleConnectWallet} 
              className='cursor-pointer bg-blue-600 px-4 py-2 rounded hover:bg-blue-700'
            >
              Connect Wallet
            </li>
          </ul>
        </nav>
      </div>

      <div className='bg-gray-400 text-gray-800 p-4'>
        {connectedAccount ? (
          <span>Connected: {connectedAccount}</span>
        ) : (
          <span>Not connected</span>
        )}
      </div>

      <div className='p-6'>


        {/* Transfer Form */}
        <div className='flex justify-between'>

        <div className='border-2 border-red-400 w-full max-w-md p-4 rounded'>
          <h2 className='text-xl mb-4'>Transfer Tokens</h2>
          
          <form onSubmit={handleTransfer} className='space-y-4'>
            <div>
              <label htmlFor="amount" className='block mb-2'>Amount:</label>
              <input 
                type="number" 
                id='amount' 
                name='amount'
                step="any"
                min="0"
                required
                className='w-full p-2 text-black rounded'
                placeholder='Enter amount (e.g., 1.5)'
              />
            </div>

            <div>
              <label htmlFor="address" className='block mb-2'>To Address:</label>
              <input 
                type="text" 
                id='address' 
                name='address'
                required
                className='w-full p-2 text-black rounded'
                placeholder='0x...'
                pattern="^0x[a-fA-F0-9]{40}$"
                title="Please enter a valid Ethereum address (0x followed by 40 hex characters)"
              />
            </div>

            <button 
              type='submit' 
              disabled={isLoading || !contract || !connectedAccount}
              className='w-full bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
            >
              {isLoading ? 'Processing...' : 'Transfer'}
            </button>
          </form>
        </div>

        <div className='border-2 border-green-400 w-full max-w-md p-4 rounded'>
Read from the blockchain

<div className='flex flex-col'>

        {/* Token Info Section */}
        <div className='mb-6'>
          <button 
            onClick={handleGetInfo} 
            disabled={isLoading || !contract}
            className='bg-green-600 px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50'
          >
            {isLoading ? 'Loading...' : 'Get Token Info'}
          </button>
          
          {tokenInfo.name && (
            <div className='mt-4 p-4 bg-gray-800 rounded'>
              <h3 className='text-lg font-bold'>Token Information:</h3>
              <p>Name: {tokenInfo.name}</p>
              <p>Symbol: {tokenInfo.symbol}</p>
              <p>Decimals: {tokenInfo.decimals}</p>
            </div>
          )}
        </div>


        <div>
         <form onSubmit={(e)=>handleGetBalanceOf(e)}>
          <label htmlFor="get-balance-of">Get The Balance of</label>
          <input type="text" id='get-balance-of' name='address' />
          <button type='submit'>Get Balance</button>
         </form>

         {getBalanceOf && <span>

           {getBalanceOf}
         </span>
         }
        </div>
</div>

        </div>
      </div>
      </div>

    </div>
  );
};

export default Erc20;