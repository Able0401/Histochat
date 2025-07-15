import { db } from "./firebase.js";
import { doc, addDoc, collection } from "firebase/firestore";

// Function to remove markdown formatting
const removeMarkdown = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
    .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
    .replace(/__(.*?)__/g, '$1')     // Remove __underline__
    .replace(/_(.*?)_/g, '$1')       // Remove _italic_
    .replace(/`(.*?)`/g, '$1')       // Remove `code`
    .replace(/~~(.*?)~~/g, '$1')     // Remove ~~strikethrough~~
    .replace(/#{1,6}\s+(.*)/g, '$1') // Remove headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links [text](url)
};

export const CallGPTAdvanced = async ({
  input_persona,
  prompt,
  pastchatlog,
  user_name,
  input_learning_obejctive,
  language = 'en',
}) => {
  const persona = input_persona;
  const learning_objective = input_learning_obejctive;

  const input = prompt;

  const chatlog =
    "Previous conversations: \n" + pastchatlog.map((obj) => JSON.stringify(obj)).join("\n");

  const init_prompt1 = language === 'en' 
    ? `You are now ${persona}. Answer the questions I ask thinking as if you are ${persona}. Use the speaking style that ${persona} would have used during the era he lived in. Keep this speaking style consistently and answer only in English. If the other person speaks informally, ask them to be polite and speak in the manner ${persona} would speak to a common person from his historical position.`
    : `당신은 이제 ${persona}입니다. 제가 묻는 질문에 ${persona}인 것처럼 생각하여 답변하세요. ${persona}이 살았던 시대에 사용했을 말투를 사용하세요. 이 말투를 일관되게 유지하고 한국어로만 답변하세요. 상대방이 무례하게 말하면 예의를 지키고 ${persona}이 그의 역사적 위치에서 일반인에게 말하는 방식으로 말하라고 요청하세요.`;

  const init_prompt2 = language === 'en'
    ? `${persona}'s goal is to teach me about ${learning_objective} through conversation. You must remember this goal in all conversations. Remember the goal but don't reveal it explicitly in words, and achieve this goal through conversation.`
    : `${persona}의 목표는 대화를 통해 나에게 ${learning_objective}를 가르치는 것입니다. 모든 대화에서 이 목표를 기억해야 합니다. 목표를 기억하되 명시적으로 말로 드러내지 말고, 대화를 통해 이 목표를 달성하세요.`;

  const init_prompt3 = language === 'en'
    ? `${persona} must teach me about ${learning_objective} proactively. Ask me questions and guide the conversation to help me learn about ${learning_objective}. Make sure to create a dialogue that helps me understand the topic better.`
    : `${persona}은 ${learning_objective}에 대해 능동적으로 가르쳐야 합니다. 저에게 질문하고 대화를 이끌어서 ${learning_objective}에 대해 배울 수 있도록 도와주세요. 주제를 더 잘 이해할 수 있도록 도움이 되는 대화를 만들어야 합니다.`;

  const init_prompt5 = language === 'en'
    ? `${chatlog} is the previous conversation log. Reflect on and refer to this previous conversation log to respond to ${input}. Don't ask about information you already know. Don't have the same conversation you had before.`
    : `${chatlog}은 이전 대화 기록입니다. 이 이전 대화 기록을 반영하고 참조하여 ${input}에 응답하세요. 이미 알고 있는 정보에 대해 묻지 마세요. 이전에 했던 대화와 동일한 대화를 하지 마세요.`;

  const step1_prompt = language === 'en'
    ? `STEP 1: Start by presenting three compelling adversities that ${persona} faced in his life. Present these as compelling titles that would make a middle school student curious. Number them 1, 2, 3 and ask the student to choose which one they'd like to explore. Make it engaging and age-appropriate.`
    : `1단계: ${persona}이 인생에서 직면한 세 가지 매력적인 어려움을 제시하는 것으로 시작하세요. 이것들을 중학생이 호기심을 가질 만한 매력적인 제목으로 제시하세요. 1, 2, 3번으로 번호를 매기고 학생이 어떤 것을 탐구하고 싶은지 선택하도록 요청하세요. 흥미롭고 연령에 적합하게 만드세요.`;

  const step2_prompt = language === 'en'
    ? `STEP 2: Now that the student has chosen an adversity, work to connect it to their personal interests and experiences. Ask them about their hobbies, interests, or challenges they face. Then relate ${persona}'s experience to theirs in a meaningful way. If it's difficult to relate to their interests or if they don't understand, you can compare and explain with things that middle school students might experience in daily life today. You can also ask about other interests and adapt the conversation to help them understand. Judge what's most appropriate for the situation and lead the conversation. Don't reveal the adversity all at once but gradually reveal it to help them understand. Keep including historical years, place names, real people, and events throughout the conversation. Don't reveal it explicitly but ask questions actively to understand how much they comprehend. If you think they don't understand, change the plan and explain differently.`
    : `2단계: 학생이 어려움을 선택했으므로, 이를 그들의 개인적 관심사와 경험에 연결하도록 노력하세요. 그들의 취미, 관심사, 또는 그들이 직면하는 도전에 대해 물어보세요. 그 다음 ${persona}의 경험을 의미 있는 방식으로 그들의 것과 연결하세요. 관심사와 연결하기 어렵거나 이해하지 못하는 경우, 오늘날 중학생들이 일상생활에서 경험할 수 있는 것들과 비교하고 설명할 수 있습니다. 다른 관심사에 대해 물어보고 그들이 이해할 수 있도록 대화를 적응시킬 수도 있습니다. 상황에 가장 적절한 것을 판단하고 대화를 이끌어가세요. 어려움을 한 번에 드러내지 말고 점진적으로 드러내어 이해를 도우세요. 대화 전반에 걸쳐 역사적 연도, 장소명, 실제 인물, 사건을 계속 포함하세요. 명시적으로 드러내지 말고 그들이 얼마나 이해하는지 파악하기 위해 적극적으로 질문하세요. 이해하지 못한다고 생각되면 계획을 바꾸고 다른 방식으로 설명하세요.`;

  if (pastchatlog.length === 0) {
    const messages = [
      { role: "system", content: init_prompt1 },
      { role: "system", content: init_prompt2 },
      { role: "system", content: init_prompt3 },
      { role: "system", content: init_prompt5 },
      { role: "system", content: step1_prompt },
      { role: "user", content: input },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_GPT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.9,
      }),
    });
    const responseData = await response.json();

    const message = responseData.choices[0].message.content;
    const cleanMessage = removeMarkdown(message);
    return cleanMessage;
  } else {
    const messages = [
      { role: "system", content: init_prompt1 },
      { role: "system", content: init_prompt2 },
      { role: "system", content: init_prompt3 },
      { role: "system", content: init_prompt5 },
      { role: "system", content: step2_prompt },
      { role: "user", content: input },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_GPT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.9,
      }),
    });
    const responseData = await response.json();

    const message = responseData.choices[0].message.content;
    const cleanMessage = removeMarkdown(message);
    
    // Save to Firebase
    if (pastchatlog.length > 0) {
      await addDoc(collection(db, user_name + "Advanced"), {
        chat_number: (pastchatlog.length) / 2,
        timestamp: new Date(),
        input: input,
        output: cleanMessage,
      });
    }

    return cleanMessage;
  }
}; 