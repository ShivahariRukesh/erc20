import React, { useState, useEffect } from 'react';
import Erc20Demo from './pages/Erc20Demo';
import Erc20 from './pages/Erc20';



const App: React.FC = () => {

const [showDemo, setShowDemo] = useState<boolean|undefined>(undefined)


  return (
  <div className='bg-black text-white h-[100vh]'>
Choose your po(t)i(s)on

<button onClick={()=>setShowDemo(true)}>Real Demo</button>
<button onClick={()=>setShowDemo(false)}>Your Demo</button>

{
 showDemo === undefined ?(
  <div>
    Choose
  </div>
 ):
 (showDemo ? <Erc20Demo/>:(

   <Erc20/>
  )
  
  )
}

  </div>
  );
};

export default App;
