import { useState } from "react"
import { X } from "lucide-react";
import BalanceCard from "./BalanceCard";

const GetBalanceAddress = ({contract}) => {
  const [getBalanceAddress, setGetBalanceAddress] = useState();
  const [balance, setBalance] = useState(null);
  const [showBalanceCard, setShowBalanceCard] = useState(false);

  const handleGetBalanceOf = async(e) => {
    e.preventDefault()
    const res = await contract?.balanceOf(getBalanceAddress);
    setBalance(res)
    // Small delay to ensure the element is rendered before animation starts
    setTimeout(() => setShowBalanceCard(true), 10);
  }

  const onChangeAddress = async(e) => {
    e.preventDefault();
    setGetBalanceAddress(e.target.value)
  }


  return (
    <div className=" space-y-3">
      <input
        type="text"
        placeholder="Enter address to check balance"
        value={getBalanceAddress || ''}
        onChange={(e) => onChangeAddress(e)}
        className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
      />
      <button 
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
        onClick={(e) => handleGetBalanceOf(e)}
      >
        Get Balance
      </button>
      
      {showBalanceCard && (
        <div className={`fixed -left-[1000px] top-80 bg-gray-800 rounded-lg shadow-lg  border border-gray-700/50 p-4 min-w-48 transition-transform duration-1000 ease-out ${
          showBalanceCard ? 'translate-x-[calc(400px+1rem)]' : ''
        }`}>
<BalanceCard balance ={balance}/>
        </div>
      )}
    </div>
  )
}

export default GetBalanceAddress