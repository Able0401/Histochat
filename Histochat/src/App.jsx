import { useState } from 'react'
import {CallGPT} from "./api/gpt"

function App() {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const handleClickAPICall = async () => {
    try {
      setLoading(true);
      const message = await CallGPT();
      setData(message);
    } catch (error) {
      console.error(error);
    } finally { 
      setLoading(false);
    }
    
    await CallGPT();
  };

  return (
    <>
      <button onClick={handleClickAPICall}> GPT API call</button>    
      <div>data : {data}</div>  
      <div> loading : {loading ? "loading..." : "loading finished!"}</div>
    </>
  )

}
export default App;
