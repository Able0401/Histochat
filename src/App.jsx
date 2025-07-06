import { useState } from 'react';
import './App.css';
import Userinput from './components/Userinput';
import { CallGPTBaseline } from './api/gptBaseline';
import { CallGPTAdvanced } from './api/gptAdvanced';

function App() {
  // Shared state
  const [user_name, setUserName] = useState("");
  const [user_name_flag, setUserNameFlag] = useState(false);

  // Shared persona
  const [persona, setPersona] = useState("Napoleon");
  
  // Baseline chat states
  const [baselineChatlog, setBaselineChatlog] = useState([]);
  const [baselineLoading, setBaselineLoading] = useState(false);

  // Advanced chat states
  const [advancedChatlog, setAdvancedChatlog] = useState([]);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const [advancedLearningObjective, setAdvancedLearningObjective] = useState(
    `Let's understand the adversities ${persona} faced and why he made certain choices in those difficult times, what he was thinking, what the results were, and how he overcame them.`
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
        user_name: user_name,
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
      `Let's understand the adversities ${e.target.value} faced and why he made certain choices in those difficult times, what he was thinking, what the results were, and how he overcame them.`
    );
  };

  const handleUserName = () => {
    if (user_name === "") {
      alert("Please enter your name");
    } else {
      setUserNameFlag(true);
      // Initialize both chats
      handleBaselineAPICall("Hello");
      handleAdvancedAPICall("Hello");
    }
  };

  // Render chatlogs
  const baselineChatlogArray = baselineChatlog.map((chat, index) => {
    if (chat.message === "") {
      return null;
    }
    return (
      <div key={index} style={{ textAlign: chat.user === user_name ? "right" : "left", marginBottom: "15px"}}>
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{chat.user}</div>
        <div style={{ 
          background: chat.user === user_name ? "#8D8C8C" : "#E8E8E8", 
          color: chat.user === user_name ? "#FFFFFF" : "#000000",
          padding: "10px", 
          borderRadius: "10px", 
          display: "inline-block", 
          whiteSpace: "pre-line",
          maxWidth: "80%",
          wordWrap: "break-word"
        }}>
          {chat.message}
        </div>
      </div>
    );
  });

  const advancedChatlogArray = advancedChatlog.map((chat, index) => {
    if (chat.message === "") {
      return null;
    }
    return (
      <div key={index} style={{ textAlign: chat.user === user_name ? "right" : "left", marginBottom: "15px"}}>
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{chat.user}</div>
        <div style={{ 
          background: chat.user === user_name ? "#8D8C8C" : "#E8E8E8", 
          color: chat.user === user_name ? "#FFFFFF" : "#000000",
          padding: "10px", 
          borderRadius: "10px", 
          display: "inline-block", 
          whiteSpace: "pre-line",
          maxWidth: "80%",
          wordWrap: "break-word"
        }}>
          {chat.message}
        </div>
      </div>
    );
  });

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh", 
      width: "100%",
      overflow: "hidden"
    }}>
      {user_name_flag ? (
        <div style={{ 
          display: "flex", 
          flexDirection: "row", 
          height: "100%",
          gap: "20px",
          padding: "20px",
          boxSizing: "border-box"
        }}>
          {/* Left Chat Container - Baseline */}
          <div style={{ 
            width: "calc(50% - 10px)",
            display: "flex", 
            flexDirection: "column", 
            border: "1px solid #ccc",
            borderRadius: "10px",
            overflow: "hidden",
            height: "100%",
            minWidth: "0"
          }}>
            <div style={{ 
              padding: "15px", 
              backgroundColor: "#f8f9fa", 
              borderBottom: "1px solid #ccc",
              textAlign: "center",
              flexShrink: 0
            }}>
              <h3 style={{ margin: 0 }}>Baseline Histochat - {persona}</h3>
            </div>
            
            <div style={{ 
              flex: 1, 
              padding: "15px", 
              overflowY: "auto",
              backgroundColor: "white",
              minHeight: "0"
            }}>
              {baselineChatlogArray}
            </div>
            
            <div style={{ 
              padding: "15px", 
              backgroundColor: "#f8f9fa", 
              borderTop: "1px solid #ccc",
              flexShrink: 0
            }}>
              <Userinput loading={baselineLoading} onSubmit={handleBaselineSubmit} />
            </div>
          </div>

          {/* Right Chat Container - Experimental */}
          <div style={{ 
            width: "calc(50% - 10px)",
            display: "flex", 
            flexDirection: "column", 
            border: "1px solid #ccc",
            borderRadius: "10px",
            overflow: "hidden",
            height: "100%",
            minWidth: "0"
          }}>
            <div style={{ 
              padding: "15px", 
              backgroundColor: "#f8f9fa", 
              borderBottom: "1px solid #ccc",
              textAlign: "center",
              flexShrink: 0
            }}>
              <h3 style={{ margin: 0 }}>Experimental Histochat - {persona}</h3>
            </div>
            
            <div style={{ 
              flex: 1, 
              padding: "15px", 
              overflowY: "auto",
              backgroundColor: "white",
              minHeight: "0"
            }}>
              {advancedChatlogArray}
            </div>
            
            <div style={{ 
              padding: "15px", 
              backgroundColor: "#f8f9fa", 
              borderTop: "1px solid #ccc",
              flexShrink: 0
            }}>
              <Userinput loading={advancedLoading} onSubmit={handleAdvancedSubmit} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100%",
          padding: "20px"
        }}>
          <div style={{ textAlign: "center", maxWidth: "500px" }}>
            <h2 style={{ marginBottom: "20px" }}>Please enter a historical figure you want to chat with.</h2>
            <h3 style={{ marginBottom: "20px", color: "#666" }}>Examples: Napoleon, Aristotle, Leonardo da Vinci</h3>
            <input 
              type="text" 
              value={persona} 
              onChange={handlePersonaInput}
              style={{
                padding: "12px",
                fontSize: "16px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                width: "100%",
                marginBottom: "20px",
                outline: "none",
                transition: "border-color 0.3s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#4CAF50"}
              onBlur={(e) => e.target.style.borderColor = "#ddd"}
            />
            <h3 style={{ marginBottom: "10px" }}>Please enter your name</h3>
            <input 
              type="text" 
              value={user_name} 
              onChange={handleUserNameInput}
              style={{
                padding: "12px",
                fontSize: "16px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                width: "100%",
                marginBottom: "30px",
                outline: "none",
                transition: "border-color 0.3s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#4CAF50"}
              onBlur={(e) => e.target.style.borderColor = "#ddd"}
            />
            <button 
              onClick={handleUserName}
              style={{
                padding: "15px 30px",
                fontSize: "18px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.3s, transform 0.2s",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#45a049";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#4CAF50";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Enter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
