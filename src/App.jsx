import { useState } from 'react';
import './App.css';
import Userinput from './components/Userinput';
import { CallGPTBaseline } from './api/gptBaseline';
import { CallGPTAdvanced } from './api/gptAdvanced';

function App() {
  // Language state
  const [language, setLanguage] = useState('en'); // 'en' for English, 'ko' for Korean
  
  // Language texts
  const texts = {
    en: {
      title: "HistoChat: AI-Powered Historical Personas for Transforming Middle School History Education",
      abstract1: "This paper explores the **potential of AI-powered historical personas, specifically through a system called HistoChat, to transform middle school history education** by fostering personalized engagement and cultivating historical empathy. Based on a formative study that identified challenges in traditional history learning and user expectations for AI, two versions of HistoChat were developed: a **Baseline version** that passively responded to student queries, and an **Experimental version** designed for active, personalized, and proactive engagement.",
      abstract2: "A subsequent user study with middle school students demonstrated that these AI interactions fostered deeper inquiry, curiosity, and emotional engagement. Students reported that AI historical figures facilitated **self-directed learning**, provided **comprehensive and personalized explanations** beyond textbooks, supported **perspective-taking** through immersive dialogue, and evoked **internal motivation** by connecting historical content to personal interests.",
      abstract3: "While acknowledging benefits like enhanced engagement and personalized learning, the study also surfaced limitations such as the risk of over-reliance on AI, potential for misinformation, and challenges in promoting systemic historical reasoning beyond biographical narratives. The research expands the role of AI from a mere task assistant to an **epistemic and relational partner**, highlighting the need for careful design that balances student autonomy with pedagogical structure for effective and ethically responsible integration in real-world classrooms.",
      baselineTitle: "Baseline HistoChat",
      baselineDesc: "Passive response model with traditional Q&A format. Provides direct historical information when asked.",
      experimentalTitle: "Experimental HistoChat",
      experimentalDesc: "Proactive engagement with three-challenge framework. Actively guides conversations and builds personal connections.",
      chooseHistorical: "Choose a Historical Figure",
      exampleText: "Examples: Napoleon, Aristotle, Leonardo da Vinci, Cleopatra",
      enterName: "Enter your name",
      startChat: "Start Conversation",
      nameAlert: "Please enter your name"
    },
    ko: {
      title: "HistoChat: 중학생 역사교육 변화를 위한 AI 기반 역사적 인물 시스템",
      abstract1: "이 연구는 **개인화된 참여와 역사적 공감 능력 함양을 통해 중학생 역사교육을 변화시키기 위한 AI 기반 역사적 인물 시스템인 HistoChat의 잠재력**을 탐구합니다. 전통적인 역사 학습의 문제점과 AI에 대한 사용자 기대를 파악한 형성 연구를 바탕으로, 학생 질문에 수동적으로 응답하는 **기본 버전**과 능동적이고 개인화된 상호작용을 위해 설계된 **실험 버전**의 두 가지 HistoChat 버전을 개발했습니다.",
      abstract2: "중학생들과의 후속 사용자 연구에서 이러한 AI 상호작용이 더 깊은 탐구, 호기심, 정서적 참여를 촉진한다는 것이 입증되었습니다. 학생들은 AI 역사적 인물이 **자기주도적 학습**을 촉진하고, 교과서를 넘어선 **포괄적이고 개인화된 설명**을 제공하며, 몰입형 대화를 통한 **관점 수용**을 지원하고, 역사적 내용을 개인적 관심사와 연결하여 **내적 동기**를 유발한다고 보고했습니다.",
      abstract3: "참여도 향상과 개인화 학습 같은 이점을 인정하면서도, 연구는 AI에 대한 과도한 의존 위험, 잘못된 정보 전달 가능성, 전기적 서사를 넘어선 체계적 역사적 추론 촉진의 어려움 같은 한계점도 드러냈습니다. 이 연구는 AI의 역할을 단순한 과업 보조자에서 **인식적이고 관계적인 파트너**로 확장하며, 실제 교실에서 효과적이고 윤리적으로 책임감 있는 통합을 위해 학생 자율성과 교육학적 구조의 균형을 맞춘 신중한 설계의 필요성을 강조합니다.",
      baselineTitle: "Baseline HistoChat",
      baselineDesc: "학생이 질문하면 답변하는 기본적인 방식. 역사적 인물이 질문에 대해 직접적으로 답변해줍니다.",
      experimentalTitle: "Experimental HistoChat",
      experimentalDesc: "역사적 인물이 먼저 흥미로운 이야기를 제안하고, 학생의 관심사와 연결해서 적극적으로 대화를 이끌어갑니다.",
      chooseHistorical: "역사적 인물 선택",
      exampleText: "예시: 나폴레옹, 아리스토텔레스, 레오나르도 다 빈치, 클레오파트라",
      enterName: "이름을 입력하세요",
      startChat: "대화 시작",
      nameAlert: "이름을 입력해주세요"
    }
  };

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

  // Language toggle function
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ko' : 'en');
  };

  // Function to render text with bold formatting
  const renderTextWithBold = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

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
        language: language,
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
        language: language,
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
    const objective = language === 'en' 
      ? `Let's understand the adversities ${e.target.value} faced and why he made certain choices in those difficult times, what he was thinking, what the results were, and how he overcame them.`
      : `${e.target.value}이 직면한 어려움과 그 어려운 시기에 왜 특정 선택을 했는지, 무엇을 생각했는지, 결과는 무엇이었는지, 그리고 어떻게 극복했는지 이해해봅시다.`;
    setAdvancedLearningObjective(objective);
  };

  const handleUserName = () => {
    if (user_name === "") {
      alert(texts[language].nameAlert);
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
              <h3 style={{ margin: 0, color: "#1976d2" }}>{texts[language].baselineTitle} - {persona}</h3>
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
              <h3 style={{ margin: 0, color: "#f57c00" }}>{texts[language].experimentalTitle} - {persona}</h3>
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
            gap: "30px",
            position: "relative"
          }}>
            {/* Language Toggle Button */}
            <button 
              onClick={toggleLanguage}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                padding: "8px 16px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.3s ease",
                zIndex: 1000
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#1565c0";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#1976d2";
                e.target.style.transform = "scale(1)";
              }}
            >
              {language === 'en' ? '한국어' : 'English'}
            </button>
            
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
                {texts[language].title}
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
                  {renderTextWithBold(texts[language].abstract1)}
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
                  {renderTextWithBold(texts[language].abstract2)}
                </p>
                <p style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#555",
                  textAlign: "left",
                  maxWidth: "950px",
                  margin: "0 auto"
                }}>
                  {renderTextWithBold(texts[language].abstract3)}
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
                    {texts[language].baselineTitle}
                  </h3>
                  <p style={{
                    fontSize: "16px",
                    color: "#333",
                    lineHeight: "1.5",
                    margin: 0,
                    textAlign: "center",
                    fontWeight: "500"
                  }}>
                    {texts[language].baselineDesc}
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
                    {texts[language].experimentalTitle}
                  </h3>
                  <p style={{
                    fontSize: "16px",
                    color: "#333",
                    lineHeight: "1.5",
                    margin: 0,
                    textAlign: "center",
                    fontWeight: "500"
                  }}>
                    {texts[language].experimentalDesc}
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
                    {texts[language].chooseHistorical}
                  </h3>
                  <p style={{ 
                    marginBottom: "8px", 
                    color: "#888", 
                    fontSize: "12px",
                    textAlign: "left"
                  }}>
                    {texts[language].exampleText}
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
                    {texts[language].enterName}
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
                  {texts[language].startChat}
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
