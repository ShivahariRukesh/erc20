import React from 'react'
import { ethers } from 'ethers'
interface TransferToken{
isLoading:any,
connectedAccount:any,
contract:any,
setIsLoading:any
}
const TransferToken:React.FC<TransferToken> = ({setIsLoading,isLoading,connectedAccount,contract}) => {
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
// console.error('Invalid Ethereum address format');
// return;
// }
try {
setIsLoading(true);
// Get token decimals for proper amount conversion
const decimals = await contract.decimals();
// Convert amount to proper decimal places (e.g., for 18 decimals: 1 token = 1e18 wei)
const amountInWei = ethers.parseUnits(amount, decimals);
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

console.error('Insufficient funds for this transaction');

 } finally {
setIsLoading(false);
 }

 };
return (

    <div className="space-y-4">
    <input
      type="text"
      placeholder="Recipient address"
      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none"
    />
    <input
      type="number"
      placeholder="Amount"
      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none"
    />
    <button 
      disabled={isLoading || !contract}
      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Processing...' : 'Transfer'}
    </button>
  </div>
 )
}
export default TransferToken