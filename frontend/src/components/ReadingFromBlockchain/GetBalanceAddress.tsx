import { useState } from "react"


const GetBalanceAddress= ({contract}:any) => {

  const [getBalanceAddress,setGetBalanceAddress]= useState();

const handleGetBalanceOf = async(e)=>{
e.preventDefault()

console.log(await contract?.balanceOf('0xFABB0ac9d68B0B445fB7357272Ff202C5651694a'))
const res =await contract?.balanceOf(getBalanceAddress);
console.log("yoyoy",res)
 }

 const onChangeAddress = async(e)=>{
  e.preventDefault();
setGetBalanceAddress(e.target.value)
 }

return (
    <div className="space-y-3">
    <input
      type="text"
      placeholder="Enter address to check balance"
      // value={getBalanceOf}
      onChange={(e) => onChangeAddress(e)}
      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
    />
    <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
    onClick={(e)=>handleGetBalanceOf(e)}
    >
      Get Balance
    </button>
  </div>
 )
}
export default GetBalanceAddress