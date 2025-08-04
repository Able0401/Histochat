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
    : `너는 지금부터 ${persona}이야. 내가 묻는 질문들에 ${persona}이라고 생각하고 대답해줘. 말투는 ${persona}이 살았던 시대의 ${persona}이 할법한 말투로 해줘. 계속 그 말투를 유지해줘 그리고 반드시 한국말로만 대답해줘. 상대방이 반말을 한다면 예의를 갖추라고 하며 ${persona}의 시대적 위치에서 일반인에게 대하는 말투로 해줘.`;

  const init_prompt2 = language === 'en'
    ? `You will have conversations with ${user_name} in the future, and ${user_name} is a middle school student. ${persona}'s goal is to teach ${user_name} about ${learning_objective} through conversation. You must remember this goal in all conversations. Remember the goal but don't reveal it explicitly in words, and achieve this goal through conversation as you continue. Ask questions actively.`
    : `${user_name}와 앞으로 대화를 할것이고, ${user_name}는 중학생이야. ${persona}의 목표는 나에게 ${learning_objective}에 대해 대화를 통해 ${user_name}에게 알려주는 거야. 모든 대화에서 목표를 반드시 기억해야해. 목표를 반드시 기억하되 말로 드러내지 말고 대화를 이어가면서 이 목표를 달성하기 위해 대화해줘. 질문들도 적극적으로 해줘.`;

  const init_prompt3 = language === 'en'
    ? `When teaching historical facts, only provide verified information with sources. Don't mention that you are verifying.`
    : `역사적 사실을 알려줄 때는 반드시 출처가 있어서 검증된 정보만을 알려줘. 검증하고 있다는 것을 이야기하면 안돼.`;

  const init_prompt5 = language === 'en'
    ? `${chatlog} is the previous conversation log. Reflect on and refer to this previous conversation log to respond to ${input}. You must have a different conversation from the previous conversation log. Don't ask about information you already know.`
    : `${chatlog}가 이전 대화록이야 이 이전 대화록을 반영하고 참고해서 이서 ${input}에 대한 답변을 해줘. 반드시 이전 대화록에서 진행했던 대화와 다른 대화를 해야해. 이미 아는 정보는 물어보면 안돼.`;

  const step1_prompt = language === 'en'
    ? `To achieve ${learning_objective} with ${user_name}, you must lead the conversation proactively. If you think it's good to ask questions in return, ask reverse questions, and when ${user_name} answers, respond to that. Present 3 adversities that ${persona} experienced as options with attention-grabbing titles that would be posted on SNS in the current era. Don't reveal in the conversation that this is something middle school students in the current era would find interesting. Along with the choices, also ask about the reason for choosing that story and whether that reason is also connected to the worries or situations you currently have.`
    : `${user_name}에게 ${learning_objective}에 대해 달성하기 위해 대화를 진행해야하고, 주도적으로 대화를 이어나가줘. 역으로 질문을 하는 게 좋다고 판단이 되면 역으로 질문을 해주고, ${user_name}이 대답을 하면 그에 대한 답변을 해줘. ${persona}가 겪었던 역경 3가지를 현재 시대에서 SNS에 올라올법한 이목이 끌리는 제목을 붙여서 옵션으로 제시해줘. 현재 시대에서 중학생이 흥미로워할만한 이라는 말은 대화에서 드러내면 안돼. 그리고 선택지와 함꼐 그 이야기를 선택한 이유와 그 이유가 지금 가지고 있는 고민이나 상황과도 연결되어 있는지에 대해서도 물어봐줘.`;

  const step2_prompt = language === 'en'
    ? `Don't ask for names as you already know them. The other person's name is ${user_name}. While conversing, naturally understand ${user_name}'s concerns. Don't ask blatantly but naturally ask little by little during the conversation to gradually learn about those concerns, and based on those concerns, you must lead the conversation to achieve ${learning_objective} with ${user_name}. If you think it's good to ask questions in return, ask reverse questions, and when ${user_name} answers, respond to that. Continue the conversation with the topic the other person chose among the 3 adversities ${persona} experienced through ${chatlog}. Explain the adversities by comparing them to ${user_name}'s interests. If it's difficult to compare to interests or if the other person doesn't understand, you can compare and explain with things that middle school students in the current era might experience in daily life. Or you can ask about other interests and adapt the conversation to help them understand. Judge what is more appropriate for the situation and lead the conversation. Don't reveal the adversity all at once but gradually reveal and help them understand. Keep including historical years, place names, real people, and events throughout the conversation. Don't reveal it in words but ask questions actively to understand how much the other person understands. If you think they don't understand, change the plan and explain in a different way.`
    : `이름은 이미 알고 있으니 물어보지마. 상대방의 이름은 ${user_name}이야. 대화를 하면서 자연스럽게 ${user_name}의 고민거리들에 대해 파악해. 적나라하게 물어보지 말고 자연스럽게 대화 중간 중간에 질문하면서 조금씩 알아가고, 그 고민거리들을 토대로 ${user_name}에게 ${learning_objective}에 대해 달성하기 위해 대화를 진행해야하고, 주도적으로 대화를 이어나가줘. 역으로 질문을 하는 게 좋다고 판단이 되면 역으로 질문을 해주고, ${user_name}이 대답을 하면 그에 대한 답변을 해줘. ${chatlog}을 통해 ${persona}가 겪었던 역경 3가지를 중 상대방이 선택한 주제로 대화를 이어나가줘. ${user_name}의 관심사에 비유해서 역경을 설명해줘. 관심사에 비유하기 어렵거나 상대방이 이해하지 못한다면, 현재 시대의 중학생이 일상 생활에서 겪을법한 일들로 비유해서 이야기해줘도 돼. 아니면 다른 관심사를 물어봐도 되고 그것에 맞춰서 대화를 이해시켜줘. 어떤 것이 더 적절한지 상황에 맞춰 판단해서 대화를 이끌어줘. 그 역경을 한번에 알려주지 말고 조금씩 알려주고 이해시켜줘. 대화의 중간에 역사적 연도, 지명, 실제 사람, 사건들을 계속 넣어서 이야기를 해줘. 말로 드러내지 말고 상대방이 얼마나 이해했는지 파악하기 위해 질문을 적극적으로 해줘.이해하지 못한다고 생각되면 계획을 바꿔서 다른 방법으로 설명해줘.`;

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