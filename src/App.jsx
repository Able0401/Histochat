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
      overflow: "hidden",
      backgroundColor: "#f5f5f5"
    }}>
      {user_name_flag ? (
        <div style={{ 
          display: "flex", 
          flexDirection: "row", 
          height: "100%",
          gap: "20px",
          padding: "20px",
          boxSizing: "border-box",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%"
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
            minWidth: "0",
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <div style={{ 
              padding: "15px", 
              backgroundColor: "#e3f2fd", 
              borderBottom: "1px solid #ccc",
              textAlign: "center",
              flexShrink: 0
            }}>
              <h3 style={{ margin: 0, color: "#1976d2" }}>Baseline Histochat - {persona}</h3>
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
            minWidth: "0",
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <div style={{ 
              padding: "15px", 
              backgroundColor: "#fff3e0", 
              borderBottom: "1px solid #ccc",
              textAlign: "center",
              flexShrink: 0
            }}>
              <h3 style={{ margin: 0, color: "#f57c00" }}>Experimental Histochat - {persona}</h3>
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
          flexDirection: "column",
          height: "100vh",
          backgroundColor: "#f5f5f5",
          overflow: "auto",
          padding: "20px"
        }}>
          <div style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
            backgroundColor: "white",
            borderRadius: "20px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "30px"
          }}>
            {/* Paper Introduction Section */}
            <div style={{
              textAlign: "center"
            }}>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1976d2",
                marginBottom: "20px",
                lineHeight: "1.2"
              }}>
                HistoChat: AI-Powered Historical Personas for Transforming Middle School History Education
              </h1>
              
              <div style={{
                padding: "20px",
                marginBottom: "20px"
              }}>
                <p style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#555",
                  textAlign: "left",
                  maxWidth: "950px",
                  margin: "0 auto",
                  marginBottom: "16px"
                }}>
                  This paper explores the <strong>potential of AI-powered historical personas, specifically through a system called HistoChat, to transform middle school history education</strong> by fostering personalized engagement and cultivating historical empathy. Based on a formative study that identified challenges in traditional history learning and user expectations for AI, two versions of HistoChat were developed: a <strong>Baseline version</strong> that passively responded to student queries, and an <strong>Experimental version</strong> designed for active, personalized, and proactive engagement.
                </p>
                <p style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#555",
                  textAlign: "left",
                  maxWidth: "950px",
                  margin: "0 auto",
                  marginBottom: "16px"
                }}>
                  A subsequent user study with middle school students demonstrated that these AI interactions fostered deeper inquiry, curiosity, and emotional engagement. Students reported that AI historical figures facilitated <strong>self-directed learning</strong>, provided <strong>comprehensive and personalized explanations</strong> beyond textbooks, supported <strong>perspective-taking</strong> through immersive dialogue, and evoked <strong>internal motivation</strong> by connecting historical content to personal interests.
                </p>
                <p style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#555",
                  textAlign: "left",
                  maxWidth: "950px",
                  margin: "0 auto"
                }}>
                  While acknowledging benefits like enhanced engagement and personalized learning, the study also surfaced limitations such as the risk of over-reliance on AI, potential for misinformation, and challenges in promoting systemic historical reasoning beyond biographical narratives. The research expands the role of AI from a mere task assistant to an <strong>epistemic and relational partner</strong>, highlighting the need for careful design that balances student autonomy with pedagogical structure for effective and ethically responsible integration in real-world classrooms.
                </p>
              </div>

              {/* System Comparison Cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "25px",
                maxWidth: "1000px",
                margin: "0 auto 25px auto"
              }}>
                <div style={{
                  backgroundColor: "#e3f2fd",
                  padding: "30px 25px",
                  borderRadius: "15px",
                  border: "2px solid #bbdefb",
                  minHeight: "140px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                  <h3 style={{
                    color: "#1976d2",
                    marginBottom: "15px",
                    fontSize: "22px",
                    fontWeight: "700",
                    textAlign: "center"
                  }}>
                    Baseline HistoChat
                  </h3>
                  <p style={{
                    fontSize: "16px",
                    color: "#333",
                    lineHeight: "1.5",
                    margin: 0,
                    textAlign: "center",
                    fontWeight: "500"
                  }}>
                    Passive response model with traditional Q&A format. Provides direct historical information when asked.
                  </p>
                </div>

                <div style={{
                  backgroundColor: "#fff3e0",
                  padding: "30px 25px",
                  borderRadius: "15px",
                  border: "2px solid #ffcc02",
                  minHeight: "140px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                  <h3 style={{
                    color: "#f57c00",
                    marginBottom: "15px",
                    fontSize: "22px",
                    fontWeight: "700",
                    textAlign: "center"
                  }}>
                    Experimental HistoChat
                  </h3>
                  <p style={{
                    fontSize: "16px",
                    color: "#333",
                    lineHeight: "1.5",
                    margin: 0,
                    textAlign: "center",
                    fontWeight: "500"
                  }}>
                    Proactive engagement with three-challenge framework. Actively guides conversations and builds personal connections.
                  </p>
                </div>
              </div>
            </div>

            {/* Input Form Section */}
            <div style={{
              display: "flex",
              justifyContent: "center"
            }}>
              <div style={{ 
                maxWidth: "400px",
                width: "100%",
                textAlign: "center"
              }}>
                <div style={{ marginBottom: "15px" }}>
                  <h3 style={{ 
                    marginBottom: "8px", 
                    color: "#333", 
                    fontSize: "16px",
                    fontWeight: "600",
                    textAlign: "left"
                  }}>
                    Choose a Historical Figure
                  </h3>
                  <p style={{ 
                    marginBottom: "8px", 
                    color: "#888", 
                    fontSize: "12px",
                    textAlign: "left"
                  }}>
                    Examples: Napoleon, Aristotle, Leonardo da Vinci, Cleopatra
                  </p>
                  <input 
                    type="text" 
                    value={persona} 
                    onChange={handlePersonaInput}
                    placeholder="Enter historical figure name..."
                    style={{
                      padding: "12px",
                      fontSize: "15px",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      width: "100%",
                      outline: "none",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#4CAF50";
                      e.target.style.boxShadow = "0 0 0 2px rgba(76, 175, 80, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e0e0e0";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ 
                    marginBottom: "8px", 
                    color: "#333", 
                    fontSize: "16px",
                    fontWeight: "600",
                    textAlign: "left"
                  }}>
                    Enter Your Name
                  </h3>
                  <input 
                    type="text" 
                    value={user_name} 
                    onChange={handleUserNameInput}
                    placeholder="Your name..."
                    style={{
                      padding: "12px",
                      fontSize: "15px",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      width: "100%",
                      outline: "none",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#4CAF50";
                      e.target.style.boxShadow = "0 0 0 2px rgba(76, 175, 80, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e0e0e0";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                
                <button 
                  onClick={handleUserName}
                  style={{
                    padding: "15px 35px",
                    fontSize: "16px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                    fontWeight: "600",
                    letterSpacing: "0.5px"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#45a049";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(76, 175, 80, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#4CAF50";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.3)";
                  }}
                >
                  Start Conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
