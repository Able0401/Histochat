import { useState } from 'react'
import {CallGPT} from "./api/gpt"
import Userinput from './components/Userinput';

function App() {
  const [chatlog, setChatlog] = useState([]);
  const [data, setData] = useState("");
  
  const [user_interest, setUserInterest] = useState("");
  const [user_knowledge, setUserKnowledge] = useState("");
  
  const [loading, setLoading] = useState(false);
  
  const handleClickAPICall = async (userInput) => {
    try {
      setLoading(true);
      const message = await CallGPT({ prompt: userInput, pastchatlog: chatlog });
      setData(message);
      setChatlog(chatlog + "\n 질문 : " + userInput + "\n 답변 : " + message + "\n" );
    } catch (error) {
      console.error(error);
    } finally { 
      setLoading(false);
    }
  };

  const handleSubmit = (userInput) => {
    console.log("user input", userInput);
    handleClickAPICall(userInput);
  };

  return (
    <div>
      <div>chatlog : {chatlog}</div>    
      <div>data : {data}</div>  
      <Userinput isloading={loading} onSubmit={handleSubmit}/>
    </div>
  )

}
export default App;
