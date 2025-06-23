import React, { useEffect, useState } from 'react';
import ContractAbi from "../contracts/Erc20.json"
import ContractDetails from "../contracts/deployment.json"
import { BrowserProvider, Contract, ethers } from 'ethers';


declare global {
  interface Window {
    ethereum?: any;
  }
}

const ABI = ContractAbi.abi;
 

const Erc20 = () => {
  const [accounts, setAccounts] = useState<string[] | undefined>();
  const [connectedAccount, setConnectedAccount] = useState<string | undefined>();
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
const [contract,setContract] = useState<Contract | null>(null)

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

  useEffect (()=>{
    const initiateContract =async()=>{
      if(window.ethereum){
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        const contractInstance = new ethers.Contract(
          ContractDetails.address,
          ABI,
          web3Provider
        )

        setContract(contractInstance)
      }
    }
    initiateContract();
  })

  return (
    <div className=' bg-black h-[100vh]'>
      <div className='flex flex-row-reverse'>
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

      <div className='h-[50%]'>
        <div className='border-2 border-red-400 w-[30%] h-[50%]'>

        </div>
        <div>

        </div>
      </div>
    </div>
  );
};

export default Erc20;
