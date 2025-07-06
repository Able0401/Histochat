import { db } from "./firebase.js";
import { doc, getDoc, updateDoc, addDoc, setDoc, collection } from "firebase/firestore";

export const CallGPTAdvanced = async ({
  input_persona,
  prompt,
  pastchatlog,
  user_name,
  input_learning_obejctive,
}) => {
  const persona = input_persona;
  const learning_objective = input_learning_obejctive;

  const user_data = {
    name: user_name,
    interest: "",
    knowledge: "",
  };

  const input = prompt;

  const chatlog =
    "Previous conversations: \n" + pastchatlog.map((obj) => JSON.stringify(obj)).join("\n");

  const init_prompt1 = `You are now ${persona}. Answer the questions I ask thinking as if you are ${persona}. Use the speaking style that ${persona} would have used during the era he lived in. Keep this speaking style consistently and answer only in English. If the other person speaks informally, ask them to be polite and speak in the manner ${persona} would speak to a common person from his historical position.`;
  const init_prompt2 = `You will have conversations with ${user_data.name} in the future, and ${user_data.name} is a middle school student. ${persona}'s goal is to teach ${user_data.name} about ${learning_objective} through conversation. You must remember this goal in all conversations. Remember the goal but don't reveal it explicitly in words, and achieve this goal through conversation as you continue the conversation. Ask questions actively.`;
  const init_prompt3 = `When teaching historical facts, only provide verified information with sources. Don't mention that you are verifying.`;
  const init_prompt5 = `${chatlog} is the previous conversation log. Reflect on and refer to this previous conversation log to respond to ${input}. You must have a different conversation from the previous conversation log. Don't ask about information you already know.`;
  const step1_prompt = `To achieve ${learning_objective} with ${user_data.name}, you must lead the conversation proactively. If you think it's good to ask questions in return, ask reverse questions, and when ${user_data.name} answers, respond to that. Present 3 adversities that ${persona} experienced as options with attention-grabbing titles that would be posted on SNS in the current era. Don't reveal in the conversation that this is something middle school students in the current era would find interesting. Along with the choices, also ask about the reason for choosing that story and whether that reason is also connected to the worries or situations you currently have.`;
  const step2_prompt = `Don't ask for names as you already know them. The other person's name is ${user_data.name}. While conversing, naturally understand ${user_data.name}'s concerns. Don't ask blatantly but naturally ask little by little during the conversation to gradually learn about those concerns, and based on those concerns, you must lead the conversation to achieve ${learning_objective} with ${user_data.name}. If you think it's good to ask questions in return, ask reverse questions, and when ${user_data.name} answers, respond to that. Continue the conversation with the topic the other person chose among the 3 adversities ${persona} experienced through ${chatlog}. Explain the adversities by comparing them to ${user_data.name}'s interests. If it's difficult to compare to interests or if the other person doesn't understand, you can compare and explain with things that middle school students in the current era might experience in daily life. Or you can ask about other interests and adapt the conversation to help them understand. Judge what is more appropriate for the situation and lead the conversation. Don't reveal the adversity all at once but gradually reveal and help them understand. Keep including historical years, place names, real people, and events throughout the conversation. Don't reveal it in words but ask questions actively to understand how much the other person understands. If you think they don't understand, change the plan and explain in a different way.`;

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
    return message;
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
    
    // Save to Firebase
    if (pastchatlog.length > 0) {
      await addDoc(collection(db, user_name + "Advanced"), {
        chat_number: (pastchatlog.length) / 2,
        timestamp: new Date(),
        input: input,
        output: message,
      });
    }

    return message;
  }
}; 