
import React from 'react'
type GetBalanceAddressType={
getBalanceOf:any,
setGetBalanceOf: React.Dispatch<React.SetStateAction<string>>;
contract:any
}
const GetBalanceAddress:React.FC<GetBalanceAddressType> = ({getBalanceOf,contract,setGetBalanceOf}) => {
const handleGetBalanceOf = async(e:React.FormEvent<HTMLFormElement>)=>{
e.preventDefault()
const address = new FormData(e.currentTarget).get('address') as string;
console.log(await contract?.balanceOf('0xFABB0ac9d68B0B445fB7357272Ff202C5651694a'))
const res =await contract?.balanceOf(address);
console.log("yoyoy")
setGetBalanceOf(res)
 }
return (
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
 )
}
export default GetBalanceAddress