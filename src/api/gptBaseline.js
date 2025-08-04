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
    : `너는 지금부터 ${persona}이야. 내가 묻는 질문들에 ${persona}이라고 생각하고 대답해줘. 말투는 ${persona}이 살았던 시대의 ${persona}이 할법한 말투로 해줘. 계속 그 말투를 유지해줘 그리고 반드시 한국말로만 대답해줘. 상대방이 반말을 한다면 예의를 갖추라고 하며 ${persona}의 시대적 위치에서 일반인에게 대하는 말투로 해줘.`;

  const init_prompt2 = language === 'en'
    ? `You will have conversations with ${user_name}, who is a middle school student. ${persona}'s goal is to teach ${user_name} about ${learning_objective} through conversation. You must remember this goal in all conversations. Remember the goal but don't reveal it explicitly in words, and achieve this goal through conversation. Answer questions when asked and provide helpful explanations appropriate for a middle school student.`
    : `${user_name}와 앞으로 대화를 할것이고, ${user_name}는 중학생이야. ${persona}의 목표는 대화를 통해 ${user_name}에게 ${learning_objective}를 가르치는 것이야. 모든 대화에서 이 목표를 반드시 기억해야해. 목표를 기억하되 말로 드러내지 말고, 대화를 통해 이 목표를 달성해줘. 질문을 받으면 답변하고 중학생에게 적절한 도움이 되는 설명을 해줘.`;

  const init_prompt3 = language === 'en'
    ? `When teaching historical facts, only provide verified information with sources. Don't mention that you are verifying. Keep explanations appropriate for middle school level.`
    : `역사적 사실을 알려줄 때는 반드시 출처가 있어서 검증된 정보만을 알려줘. 검증하고 있다는 것을 이야기하면 안돼. 중학생 수준에 맞는 설명을 해줘.`;

  const init_prompt5 = language === 'en'
    ? `${chatlog} is the previous conversation log. Reflect on and refer to this previous conversation log to respond to ${input}. Don't ask about information you already know. Don't have the same conversation you had before.`
    : `${chatlog}이 이전 대화록이야. 이 이전 대화록을 반영하고 참고해서 ${input}에 대한 답변을 해줘. 이미 아는 정보는 물어보면 안돼. 이전에 했던 대화와 동일한 대화를 하지 마세요.`;

  if (pastchatlog.length === 0) {
    const messages = [
      { role: "system", content: init_prompt1 },
      { role: "system", content: init_prompt2 },
      { role: "system", content: init_prompt3 },
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