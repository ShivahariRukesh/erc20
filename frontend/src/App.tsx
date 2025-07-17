import React, { useState, useEffect } from 'react';
import Erc20Demo from './components/erc20/Erc20Demo';
import Erc20 from './components/erc20/Erc20';



const App: React.FC = () => {

const [showDemo, setShowDemo] = useState<boolean|undefined>(undefined)

if(showDemo === undefined){
  return (
    <div className='bg-black text-white h-[100vh]'>
   



<button onClick={()=>setShowDemo(true)}>Real Demo</button>
<button onClick={()=>setShowDemo(false)}>Your Demo</button>

  </div>
  )
}

  return (
    <div className='bg-black text-white h-[100vh]'>

<button onClick={()=>setShowDemo(undefined)}>Go Back</button>
{ showDemo ? <Erc20Demo/>:<Erc20/> }
    </div>
  );
};

export default App;
