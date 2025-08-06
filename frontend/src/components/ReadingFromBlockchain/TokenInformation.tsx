import { BadgeInfo, CircleDollarSign, Hash } from "lucide-react"

const TokenInformation = ({tokenInfo}:any) => {
  return (
    <div className="space-y-4 p-4 rounded-lg border border-gray-200 bg-gradient-to-r from-cyan-600 to-blue-600 shadow-sm">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 text-black">
        <BadgeInfo size={18} color="black" />
        <span className="text-lg">Name</span>
      </div>
      <span className="font-semibold text-white">{tokenInfo.name}</span>
    </div>

    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 text-black">
        <CircleDollarSign size={18} />
        <span className="text-lg">Symbol</span>
      </div>
      <span className="font-semibold text-white">{tokenInfo.symbol}</span>
    </div>

    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 text-black">
        <Hash size={18} />
        <span className="text-lg">Decimals</span>
      </div>
      <span className="font-semibold text-white">{tokenInfo.decimals}</span>
    </div>
  </div>
  )
}

export default TokenInformation