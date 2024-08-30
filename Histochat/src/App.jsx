import { useEffect, useState } from 'react'
import {CallGPT} from "./api/gpt"
import Userinput from './components/Userinput';
import styled from 'styled-components';
import {db} from './api/firebase'
import { doc, addDoc, setDoc, collection} from "firebase/firestore";

function App() {
  const persona = "나폴레옹";
  const [chatlog, setChatlog] = useState([]);
  
  const [user_name, setUserName] = useState("");
  const [user_interest, setUserInterest] = useState("");
  const [user_knowledge, setUserKnowledge] = useState("");
  const [user_name_flag, setUserNameFlag] = useState(false);

  const handleChat = (message1, message2) => {
    const chat = [
      { user: user_name, message: message1 },
      { user: persona, message: message2 },
    ];
    setChatlog(chatlog.concat(chat));
  };

  const [loading, setLoading] = useState(false);

  const handleClickAPICall = async (userInput) => {
    try {
      setLoading(true);
      const message = await CallGPT({ input_persona : persona, prompt: userInput, pastchatlog: chatlog, user_name : user_name });
      if (chatlog.length === 0) {
        handleChat("", message);
      } else {
        handleChat(userInput, message);
        addDoc(collection(db, user_name+"vanila"), {
        chat_number : (chatlog.length)/2,
        timestamp : new Date(),
        input: userInput,
        output: message,
      });
      }
      
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

  const handleUserNameInput = (e) => {
    setUserName(e.target.value);
  }

  const handleUserName = () => {
    if (user_name === "") {
      alert("이름을 입력해주세요");
      
    } else {
      setUserNameFlag(true);
      setDoc(doc(db, user_name + "vanila", "Info"), {
        name: user_name,
        interest: user_interest,
        knowledge: user_knowledge, 
        evaluation : {}
      })
      handleClickAPICall("안녕하세요");
    }
  };


  const chatlogArray = chatlog.map((chat, index) => {
    if (chat.message === "") {
      return null;
    }
    return (
      <div key={index} style={{ textAlign: chat.user === user_name ? "right" : "left", marginRight: "20px"}}>
        <br />
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{chat.user}</div>
        <div style={{ background: chat.user === user_name ? "#8D8C8C" : "#C3C1C1", color : chat.user === user_name ? "#FFFFFF" : "#000000"
           ,padding: "10px", borderRadius: "10px", display: "inline-block", whiteSpace: "pre-line"}}>{chat.message}</div>
        <br />
      </div>
    );
  });
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
      {user_name_flag ? (
          <AppConatiner>
          <div className="chatlog-container" style={{ borderRadius: "5px", padding: "10px", width : "600px", overflowY: "scroll" }}>
            <div className="chatlog">{chatlogArray}</div>  
          </div>
          <br/>
          <div className="input-container" style={{width : "620px"}}>
            <Userinput isloading={loading} onSubmit={handleSubmit} />
          </div>
        </AppConatiner>
      ) : (
        <div>
          <h3>이름을 입력해주세요</h3>
          <input type="text" value={user_name} onChange={handleUserNameInput}/>
          <button onClick={handleUserName}>입장</button>
        </div>
      )}
    </div>
  )

}
export default App;

const AppConatiner = styled.div`
  padding: 20px 20px 20px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  max-width: 800px;
  width : 100%
  margin : 0 auto;
`;
