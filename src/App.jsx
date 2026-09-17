import { useState, useEffect, useRef } from 'react';
import './App.css';
import Userinput from './components/Userinput';
import { CallGPTBaseline, CallGPTAdvanced } from './api/chat';

const PAPER_URL = "https://dl.acm.org/doi/10.1145/3757534";

const AUTHORS = [
  { name: "Yeon Soo Kim", url: "https://orcid.org/0000-0002-8316-8954", equal: true },
  { name: "Hyun Seung Moon", url: "https://hyunseungmoon.net/", equal: true },
  { name: "Sangsu Lee", url: "https://orcid.org/0000-0002-3793-6801" },
  { name: "Tak Yeon Lee", url: "https://orcid.org/0000-0002-9235-9947" },
];

const EXAMPLES = ["Napoleon", "Cleopatra", "Leonardo da Vinci", "King Sejong"];

const texts = {
  en: {
    title: "HistoChat: Leveraging AI-Driven Historical Personas for Personalized and Engaging Middle School History Education",
    venue: "CSCW 2025 · Proceedings of the ACM on Human-Computer Interaction",
    equal: "Equal contribution",
    paper: "Paper",
    demo: "Try the demo",
    demoLead: "Pick a historical figure and talk to two versions of it at once. The left one answers your questions. The right one leads the conversation.",
    figureLabel: "Historical figure",
    nameLabel: "Your name",
    namePlaceholder: "What should they call you?",
    startChat: "Start conversation",
    nameAlert: "Please enter your name",
    abstractHeading: "Abstract",
    abstract: [
      "History classes often struggle to build historical empathy: the curriculum is fixed and there is little room for personal engagement. We examine whether conversations with LLM-based historical personas can help. We built two versions of HistoChat that differ only in how they are prompted. Baseline HistoChat answers questions as they come. Experimental HistoChat takes the lead, offering choices and tying the figure's story to the student's own life.",
      "In a user study with middle school students, talking with these personas in real time led to deeper questions, more curiosity, and stronger emotional engagement. The work argues for treating AI in education as an epistemic partner rather than a task assistant, and offers design lessons for dialogue systems that support personalized, co-constructed learning.",
    ],
    conditionsHeading: "Two personas, one figure",
    baselineTitle: "Baseline",
    baselineDesc: "Waits for the student. Answers each question directly, like a knowledgeable Q&A partner.",
    experimentalTitle: "Experimental",
    experimentalDesc: "Opens with three challenges the figure faced, asks the student to pick one, links it to their own situation, and tells the story step by step.",
    caption: "Example conversations with Alexander the Great. Annotations (0)–(4) mark the prompting strategies that differ between the two versions.",
    back: "Back",
    chattingWith: "Talking with",
    apiError: "The model could not be reached. Please try again later.",
  },
  ko: {
    title: "HistoChat: 중학생 역사교육을 위한 AI 역사 인물 페르소나",
    venue: "CSCW 2025 · Proceedings of the ACM on Human-Computer Interaction",
    equal: "공동 1저자",
    paper: "논문",
    demo: "데모 체험",
    demoLead: "역사 인물을 고르면 두 버전과 동시에 대화할 수 있습니다. 왼쪽은 질문에 답하고, 오른쪽은 먼저 대화를 이끕니다.",
    figureLabel: "역사 인물",
    nameLabel: "이름",
    namePlaceholder: "인물이 부를 이름",
    startChat: "대화 시작",
    nameAlert: "이름을 입력해주세요",
    abstractHeading: "초록",
    abstract: [
      "역사 수업은 정해진 교육과정 때문에 학생 개개인의 관심을 살리기 어렵고, 역사적 공감을 기르기도 쉽지 않습니다. 이 연구는 LLM 기반 역사 인물과의 대화가 여기에 도움이 되는지 살펴봅니다. 프롬프트만 다른 두 버전을 만들었습니다. 기본 버전은 학생이 묻는 대로 답하고, 실험 버전은 먼저 선택지를 제시하며 인물의 이야기를 학생의 삶과 연결합니다.",
      "중학생 대상 사용자 연구에서 역사 인물과 실시간으로 대화한 학생들은 더 깊이 질문하고, 더 궁금해하고, 감정적으로 더 몰입했습니다. 이 연구는 교육용 AI를 과업 보조 도구가 아닌 함께 생각하는 파트너로 보자고 제안하고, 개인화된 대화형 학습 시스템 설계에 필요한 점을 정리합니다.",
    ],
    conditionsHeading: "같은 인물, 두 가지 페르소나",
    baselineTitle: "Baseline",
    baselineDesc: "학생이 질문하기를 기다렸다가 바로 답합니다.",
    experimentalTitle: "Experimental",
    experimentalDesc: "인물이 겪은 시련 세 가지를 먼저 제시해 고르게 하고, 학생의 상황과 연결해 이야기를 조금씩 풀어갑니다.",
    caption: "알렉산드로스 대왕과의 대화 예시. (0)–(4)는 두 버전의 프롬프트 전략 차이를 표시합니다.",
    back: "뒤로",
    chattingWith: "대화 상대",
    apiError: "모델에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.",
  },
};

const objectiveFor = (name, language) =>
  language === 'en'
    ? `Let's understand the adversities ${name} faced, why they made certain choices in those difficult times, what they were thinking, what the results were, and how they overcame them.`
    : `${name}이(가) 직면한 어려움과 그 시기에 왜 그런 선택을 했는지, 무엇을 생각했는지, 결과는 어땠는지, 어떻게 극복했는지 이해해봅시다.`;

function ChatPanel({ tag, title, desc, persona, userName, chatlog, loading, error, onSubmit, variant }) {
  const listRef = useRef(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [chatlog, loading, error]);

  return (
    <section className={`chat-panel ${variant}`}>
      <header className="chat-panel-header">
        <span className="chat-tag">{tag}</span>
        <div>
          <h2 className="chat-panel-title">{title}</h2>
          <p className="chat-panel-desc">{desc}</p>
        </div>
      </header>

      <div className="chat-messages" ref={listRef}>
        {chatlog.map((chat, index) => {
          if (chat.message === "") return null;
          const isUser = chat.user === userName;
          return (
            <div key={index} className={`message ${isUser ? "user" : "ai"}`}>
              {!isUser && <div className="avatar" aria-hidden="true">{persona.trim().charAt(0).toUpperCase()}</div>}
              <div className="message-body">
                <div className="message-sender">{chat.user}</div>
                <div className="message-bubble">{chat.message}</div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="message ai">
            <div className="avatar" aria-hidden="true">{persona.trim().charAt(0).toUpperCase()}</div>
            <div className="message-body">
              <div className="message-bubble typing" aria-label="Typing"><span /><span /><span /></div>
            </div>
          </div>
        )}
        {error && <p className="chat-error">{error}</p>}
      </div>

      <div className="chat-input-area">
        <Userinput loading={loading} onSubmit={onSubmit} />
      </div>
    </section>
  );
}

function App() {
  const [language, setLanguage] = useState('en');
  const t = texts[language];

  const [user_name, setUserName] = useState("");
  const [user_name_flag, setUserNameFlag] = useState(false);
  const [persona, setPersona] = useState("Napoleon");

  const [baselineChatlog, setBaselineChatlog] = useState([]);
  const [baselineLoading, setBaselineLoading] = useState(false);
  const [baselineError, setBaselineError] = useState("");

  const [advancedChatlog, setAdvancedChatlog] = useState([]);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const [advancedError, setAdvancedError] = useState("");
  const [advancedLearningObjective, setAdvancedLearningObjective] = useState(objectiveFor("Napoleon", 'en'));

  const toggleLanguage = () => {
    const next = language === 'en' ? 'ko' : 'en';
    setLanguage(next);
    setAdvancedLearningObjective(objectiveFor(persona, next));
  };

  const handleBaselineAPICall = async (userInput) => {
    try {
      setBaselineLoading(true);
      setBaselineError("");
      if (baselineChatlog.length > 0) setBaselineChatlog((log) => log.concat([{ user: user_name, message: userInput }]));
      const message = await CallGPTBaseline({
        input_persona: persona,
        prompt: userInput,
        pastchatlog: baselineChatlog,
        user_name: user_name,
        language: language,
      });
      setBaselineChatlog((log) => log.concat([{ user: persona, message }]));
    } catch (error) {
      console.error(error);
      setBaselineError(t.apiError);
    } finally {
      setBaselineLoading(false);
    }
  };

  const handleAdvancedAPICall = async (userInput) => {
    try {
      setAdvancedLoading(true);
      setAdvancedError("");
      if (advancedChatlog.length > 0) setAdvancedChatlog((log) => log.concat([{ user: user_name, message: userInput }]));
      const message = await CallGPTAdvanced({
        input_persona: persona,
        prompt: userInput,
        pastchatlog: advancedChatlog,
        user_name: user_name,
        input_learning_obejctive: advancedLearningObjective,
        language: language,
      });
      setAdvancedChatlog((log) => log.concat([{ user: persona, message }]));
    } catch (error) {
      console.error(error);
      setAdvancedError(t.apiError);
    } finally {
      setAdvancedLoading(false);
    }
  };

  const handlePersonaInput = (value) => {
    setPersona(value);
    setAdvancedLearningObjective(objectiveFor(value, language));
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (user_name.trim() === "" || persona.trim() === "") {
      alert(t.nameAlert);
      return;
    }
    setUserNameFlag(true);
    handleBaselineAPICall("Hello");
    handleAdvancedAPICall("Hello");
  };

  const handleBackToHome = () => {
    setUserNameFlag(false);
    setBaselineChatlog([]);
    setAdvancedChatlog([]);
    setBaselineError("");
    setAdvancedError("");
  };

  const topbar = (
    <nav className="topbar">
      <div className="topbar-inner">
        {user_name_flag ? (
          <button onClick={handleBackToHome} className="text-button">← {t.back}</button>
        ) : (
          <span className="wordmark">HistoChat</span>
        )}
        {user_name_flag && (
          <span className="topbar-center">{t.chattingWith} <strong>{persona}</strong></span>
        )}
        <div className="topbar-right">
          <a href={PAPER_URL} target="_blank" rel="noopener noreferrer" className="text-button">{t.paper}</a>
          <button onClick={toggleLanguage} className="lang-toggle" disabled={user_name_flag}>
            <span className={language === 'en' ? 'on' : ''}>EN</span>
            <span className={language === 'ko' ? 'on' : ''}>한</span>
          </button>
        </div>
      </div>
    </nav>
  );

  if (user_name_flag) {
    return (
      <div className="app chat-mode">
        {topbar}
        <main className="chat-layout">
          <ChatPanel
            tag="A" variant="baseline"
            title={t.baselineTitle} desc={t.baselineDesc}
            persona={persona} userName={user_name}
            chatlog={baselineChatlog} loading={baselineLoading} error={baselineError}
            onSubmit={handleBaselineAPICall}
          />
          <ChatPanel
            tag="B" variant="experimental"
            title={t.experimentalTitle} desc={t.experimentalDesc}
            persona={persona} userName={user_name}
            chatlog={advancedChatlog} loading={advancedLoading} error={advancedError}
            onSubmit={handleAdvancedAPICall}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {topbar}
      <main className="page">
        <header className="hero">
          <p className="venue">{t.venue}</p>
          <h1 className="title">{t.title}</h1>
          <p className="authors">
            {AUTHORS.map((a, i) => (
              <span key={a.name}>
                <a href={a.url} target="_blank" rel="noopener noreferrer">{a.name}</a>
                {a.equal && <sup>*</sup>}
                {i < AUTHORS.length - 1 && ", "}
              </span>
            ))}
          </p>
          <p className="equal-note"><sup>*</sup> {t.equal}</p>
          <div className="links">
            <a href={PAPER_URL} target="_blank" rel="noopener noreferrer" className="link-button">{t.paper} ↗</a>
            <a href="#demo" className="link-button primary">{t.demo}</a>
          </div>
        </header>

        <figure className="teaser">
          <img src="/teaser.jpg" alt="Side-by-side conversations with Baseline and Experimental HistoChat" />
          <figcaption>{t.caption}</figcaption>
        </figure>

        <section className="section" id="demo">
          <h2 className="section-heading">{t.demo}</h2>
          <p className="section-lead">{t.demoLead}</p>
          <form className="demo-form" onSubmit={handleStart}>
            <label className="field">
              <span className="field-label">{t.figureLabel}</span>
              <input
                type="text" value={persona}
                onChange={(e) => handlePersonaInput(e.target.value)}
                className="text-input"
              />
            </label>
            <div className="chips">
              {EXAMPLES.map((name) => (
                <button type="button" key={name}
                  className={`chip ${persona === name ? 'on' : ''}`}
                  onClick={() => handlePersonaInput(name)}>
                  {name}
                </button>
              ))}
            </div>
            <label className="field">
              <span className="field-label">{t.nameLabel}</span>
              <input
                type="text" value={user_name}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="text-input"
              />
            </label>
            <button type="submit" className="start-button">{t.startChat}</button>
          </form>
        </section>

        <section className="section">
          <h2 className="section-heading">{t.conditionsHeading}</h2>
          <div className="conditions">
            <div className="condition baseline">
              <span className="chat-tag">A</span>
              <div>
                <h3>{t.baselineTitle}</h3>
                <p>{t.baselineDesc}</p>
              </div>
            </div>
            <div className="condition experimental">
              <span className="chat-tag">B</span>
              <div>
                <h3>{t.experimentalTitle}</h3>
                <p>{t.experimentalDesc}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-heading">{t.abstractHeading}</h2>
          {t.abstract.map((p, i) => <p key={i} className="prose">{p}</p>)}
        </section>
      </main>

      <footer className="footer">
        <span>© 2025 the authors</span>
        <a href={PAPER_URL} target="_blank" rel="noopener noreferrer">doi.org/10.1145/3757534</a>
      </footer>
    </div>
  );
}

export default App;
