import { useState } from 'react'
import {CallGPT} from "./api/gpt"
import Userinput from './components/Userinput';
import styled from 'styled-components';

function App() {
  const [chatlog, setChatlog] = useState([]);
  const [data, setData] = useState("");
  
  const [user_interest, setUserInterest] = useState("");
  const [user_knowledge, setUserKnowledge] = useState("");
  const handleChat = (user1, user2) => {
    const chat = [
      { user: "유저", message: user1 },
      { user: "세종대왕", message: user2 },
    ];
    setChatlog(chatlog.concat(chat));
  };

  const [loading, setLoading] = useState(false);
  
  const handleClickAPICall = async (userInput) => {
    try {
      setLoading(true);
      const message = await CallGPT({ prompt: userInput, pastchatlog: chatlog });
      setData(message);
      handleChat(userInput, message);
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


  const chatlogArray = chatlog.map((chat, index) => {
    return (
      <div key={index} style={{ textAlign: chat.user === "유저" ? "left" : "right" }}>
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{chat.user}</div>
        <div style={{ background: chat.user === "유저" ? "#e6e6e6" : "#f2f2f2", padding: "10px", borderRadius: "10px", display: "inline-block" }}>{chat.message}</div>
        <br />
      </div>
    );
  });
  return (
    <AppConatiner>
      <h1>Histochat</h1>
      <div className="chatlog-container" style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "10px", maxHeight: "1000px", overflowY: "scroll" }}>
        <div className="chatlog">{chatlogArray}</div>  
      </div>
      <br/>
      <div className="input-container">
       <Userinput isloading={loading} onSubmit={handleSubmit}/>
      </div>
    </AppConatiner>
  )

}
export default App;

const AppConatiner = styled.div`
  padding: 20px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  width : 100%
  margin : 0 auto;
`;