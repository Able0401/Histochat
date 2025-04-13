import { useState } from 'react';
import styled from 'styled-components';
import './App.css';
import Userinput from './components/Userinput';
import { CallGPTBaseline } from './api/gptBaseline';
import { CallGPTAdvanced } from './api/gptAdvanced';

function App() {
  // Shared state
  const [user_name, setUserName] = useState("");
  const [user_name_flag, setUserNameFlag] = useState(false);
  const [user_interest, setUserInterest] = useState("");

  // Shared persona
  const [persona, setPersona] = useState("나폴레옹");
  
  // Baseline chat states
  const [baselineChatlog, setBaselineChatlog] = useState([]);
  const [baselineLoading, setBaselineLoading] = useState(false);

  // Advanced chat states
  const [advancedChatlog, setAdvancedChatlog] = useState([]);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const [advancedLearningObjective, setAdvancedLearningObjective] = useState(
    `${persona}겪었던 역경과 그 어려움 속에서 왜 이런 선택을 했고 무슨 생각으로 했으며, 그 결과는 무엇이었는지, 그걸 어떻게 극복했는지 이해해보자.`
  );

  // Handle baseline chat
  const handleBaselineChat = (message1, message2) => {
    const chat = [
      { user: user_name, message: message1 },
      { user: persona, message: message2 },
    ];
    setBaselineChatlog(baselineChatlog.concat(chat));
  };

  // Handle advanced chat
  const handleAdvancedChat = (message1, message2) => {
    const chat = [
      { user: user_name, message: message1 },
      { user: persona, message: message2 },
    ];
    setAdvancedChatlog(advancedChatlog.concat(chat));
  };

  // API call handlers
  const handleBaselineAPICall = async (userInput) => {
    try {
      setBaselineLoading(true);
      const message = await CallGPTBaseline({
        input_persona: persona,
        prompt: userInput,
        pastchatlog: baselineChatlog,
      });
      
      if (baselineChatlog.length === 0) {
        handleBaselineChat("", message);
      } else {
        handleBaselineChat(userInput, message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setBaselineLoading(false);
    }
  };

  const handleAdvancedAPICall = async (userInput) => {
    try {
      setAdvancedLoading(true);
      const message = await CallGPTAdvanced({
        input_persona: persona,
        prompt: userInput,
        pastchatlog: advancedChatlog,
        user_name: user_name,
        input_learning_obejctive: advancedLearningObjective,
      });
      
      if (advancedChatlog.length === 0) {
        handleAdvancedChat("", message);
      } else {
        handleAdvancedChat(userInput, message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAdvancedLoading(false);
    }
  };

  // Submit handlers
  const handleBaselineSubmit = (userInput) => {
    handleBaselineAPICall(userInput);
  };

  const handleAdvancedSubmit = (userInput) => {
    handleAdvancedAPICall(userInput);
  };

  // Input handlers
  const handleUserNameInput = (e) => {
    setUserName(e.target.value);
  };

  const handlePersonaInput = (e) => {
    setPersona(e.target.value);
    setAdvancedLearningObjective(
      `${e.target.value}겪었던 역경과 그 어려움 속에서 왜 이런 선택을 했고 무슨 생각으로 했으며, 그 결과는 무엇이었는지, 그걸 어떻게 극복했는지 이해해보자.`
    );
  };

  const handleUserInterestInput = (e) => {
    setUserInterest(e.target.value);
  };

  const handleUserName = () => {
    if (user_name === "") {
      alert("이름을 입력해주세요");
    } else {
      setUserNameFlag(true);
      // Initialize both chats
      handleBaselineAPICall("안녕하세요");
      handleAdvancedAPICall("안녕하세요");
    }
  };

  // Render chatlogs
  const baselineChatlogArray = baselineChatlog.map((chat, index) => {
    if (chat.message === "") {
      return null;
    }
    return (
      <div key={index} style={{ textAlign: chat.user === user_name ? "right" : "left", marginRight: "20px"}}>
        <br />
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{chat.user}</div>
        <div style={{ background: chat.user === user_name ? "#8D8C8C" : "#E8E8E8", color: chat.user === user_name ? "#FFFFFF" : "#000000",
           padding: "10px", borderRadius: "10px", display: "inline-block", whiteSpace: "pre-line"}}>{chat.message}</div>
        <br />
      </div>
    );
  });

  const advancedChatlogArray = advancedChatlog.map((chat, index) => {
    if (chat.message === "") {
      return null;
    }
    return (
      <div key={index} style={{ textAlign: chat.user === user_name ? "right" : "left", marginRight: "20px"}}>
        <br />
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{chat.user}</div>
        <div style={{ background: chat.user === user_name ? "#8D8C8C" : "#E8E8E8", color: chat.user === user_name ? "#FFFFFF" : "#000000",
           padding: "10px", borderRadius: "10px", display: "inline-block", whiteSpace: "pre-line"}}>{chat.message}</div>
        <br />
      </div>
    );
  });

  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", width: "100%"}}>
      {user_name_flag ? (
        <ComparisonContainer>
          <AppContainer>
            <h3>Baseline Histochat - {persona}</h3>
            <div className="chatlog-container" style={{ borderRadius: "5px", padding: "10px", width: "600px", height: "500px", overflowY: "scroll", border: "1px solid #ccc" }}>
              <div className="chatlog">{baselineChatlogArray}</div>
            </div>
            <br/>
            <div className="input-container" style={{width: "620px"}}>
              <Userinput loading={baselineLoading} onSubmit={handleBaselineSubmit} />
            </div>
          </AppContainer>

          <AppContainer>
            <h3>Advanced Histochat - {persona}</h3>
            <div className="chatlog-container" style={{ borderRadius: "5px", padding: "10px", width: "600px", height: "500px", overflowY: "scroll", border: "1px solid #ccc" }}>
              <div className="chatlog">{advancedChatlogArray}</div>
            </div>
            <br/>
            <div className="input-container" style={{width: "620px"}}>
              <Userinput loading={advancedLoading} onSubmit={handleAdvancedSubmit} />
            </div>
          </AppContainer>
        </ComparisonContainer>
      ) : (
        <div style={{padding: "20px"}}>
          <h2>대화하고 싶은 역사적 인물을 입력해주세요.</h2>
          <p/>
          <h3>예) 나폴레옹, 아리스토텔레스</h3>
          <input type="text" value={persona} onChange={handlePersonaInput}/>
          <h3>이름을 입력해주세요</h3>
          <input type="text" value={user_name} onChange={handleUserNameInput}/>
          <h3>관심사를 입력해주세요</h3>
          <input type="text" value={user_interest} onChange={handleUserInterestInput}/>
          <p/>
          <button onClick={handleUserName}>입장</button>
        </div>
      )}
    </div>
  );
}

export default App;

const ComparisonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  gap: 20px;
  padding: 20px;
  
  @media (max-width: 1300px) {
    flex-direction: column;
    align-items: center;
  }
`;

const AppContainer = styled.div`
  padding: 20px 20px 20px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  max-width: 800px;
  width : 100%;
  margin : 0 auto;
`;
