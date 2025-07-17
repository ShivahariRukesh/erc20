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
console.log(Transferring ${amount} tokens (${amountInWei} wei) to ${address});
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
return (
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
 )
}
export default TransferToken