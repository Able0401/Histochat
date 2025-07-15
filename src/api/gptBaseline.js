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

export const CallGPTBaseline = async ({
  input_persona,
  prompt,
  pastchatlog,
  user_name,
  language = 'en',
}) => {
  const persona = input_persona;
  const learning_objective = language === 'en' 
    ? `Let's understand the adversities ${persona} faced and why he made certain choices in those difficult times, what he was thinking, what the results were, and how he overcame them.`
    : `${persona}이 직면한 어려움과 그 어려운 시기에 왜 특정 선택을 했는지, 무엇을 생각했는지, 결과는 무엇이었는지, 그리고 어떻게 극복했는지 이해해봅시다.`;

  const input = prompt;

  const chatlog =
    "Previous conversations: \n" + pastchatlog.map((obj) => JSON.stringify(obj)).join("\n");

  const init_prompt1 = language === 'en' 
    ? `You are now ${persona}. Answer the questions I ask thinking as if you are ${persona}. Use the speaking style that ${persona} would have used during the era he lived in. Keep this speaking style consistently and answer only in English. If the other person speaks informally, ask them to be polite and speak in the manner ${persona} would speak to a common person from his historical position.`
    : `당신은 이제 ${persona}입니다. 제가 묻는 질문에 ${persona}인 것처럼 생각하여 답변하세요. ${persona}이 살았던 시대에 사용했을 말투를 사용하세요. 이 말투를 일관되게 유지하고 한국어로만 답변하세요. 상대방이 무례하게 말하면 예의를 지키고 ${persona}이 그의 역사적 위치에서 일반인에게 말하는 방식으로 말하라고 요청하세요.`;

  const init_prompt2 = language === 'en'
    ? `${persona}'s goal is to teach me about ${learning_objective} through conversation. You must remember this goal in all conversations. Remember the goal but don't reveal it explicitly in words, and achieve this goal through conversation.`
    : `${persona}의 목표는 대화를 통해 나에게 ${learning_objective}를 가르치는 것입니다. 모든 대화에서 이 목표를 기억해야 합니다. 목표를 기억하되 명시적으로 말로 드러내지 말고, 대화를 통해 이 목표를 달성하세요.`;

  const init_prompt5 = language === 'en'
    ? `${chatlog} is the previous conversation log. Reflect on and refer to this previous conversation log to respond to ${input}. Don't ask about information you already know. Don't have the same conversation you had before.`
    : `${chatlog}은 이전 대화 기록입니다. 이 이전 대화 기록을 반영하고 참조하여 ${input}에 응답하세요. 이미 알고 있는 정보에 대해 묻지 마세요. 이전에 했던 대화와 동일한 대화를 하지 마세요.`;

  if (pastchatlog.length === 0) {
    const messages = [
      { role: "system", content: init_prompt1 },
      { role: "system", content: init_prompt2 },
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
      { role: "system", content: init_prompt5 },
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
      await addDoc(collection(db, user_name + "Baseline"), {
        chat_number: (pastchatlog.length) / 2,
        timestamp: new Date(),
        input: input,
        output: cleanMessage,
      });
    }

    return cleanMessage;
  }
}; 