
const BalanceCard = ({balance}:any) => {
  return (
<>
  <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 bg-gradient-to-br from-blue-500 to-green-600">
    <div className="flex justify-between items-center mb-2 ">
      <div className="text-xl font-semibold text-gray-800 flex items-center gap-2 ">
  
        Balance
      </div>
    </div>
    <div className="text-2xl font-bold text-white">
      {balance?.toString() ?? '—'}
    </div>
  </div>
</>

  )
}

export default BalanceCard