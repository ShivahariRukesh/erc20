import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Erc20 = () => {
  const [accounts, setAccounts] = useState<string[] | undefined>();
  const [connectedAccount, setConnectedAccount] = useState<string | undefined>();

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return;

    const accountLists = await window.ethereum.request({ method: 'eth_accounts' });
    if (  accountLists.length) {
      setConnectedAccount(accountLists[0]);
      setAccounts(accountLists);
    }
    console.log(accountLists[0])
  };

  const handleConnectWallet = async () => {
    checkIfWalletIsConnected()
  };

  useEffect(() => {
    checkIfWalletIsConnected();



    window.ethereum?.on('accountsChanged', checkIfWalletIsConnected);

    // 👇 Cleanup listener on unmount
    return () => {
      window.ethereum?.removeListener('accountsChanged', checkIfWalletIsConnected);
    };
  }, []);

  return (
    <div>
      <div className='flex flex-row-reverse bg-white text-black'>
        <nav className='p-6'>
          <ul>
            <li onClick={handleConnectWallet} className='cursor-pointer'>
              Connect
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
    </div>
  );
};

export default Erc20;
