import { db } from "./firebase.js";
import { doc, addDoc, collection } from "firebase/firestore";

export const CallGPTBaseline = async ({
  input_persona,
  prompt,
  pastchatlog,
  user_name,
}) => {
  const persona = input_persona;
  const learning_objective = `Let's understand the adversities ${persona} faced and why he made certain choices in those difficult times, what he was thinking, what the results were, and how he overcame them.`;

  const input = prompt;

  const chatlog =
    "Previous conversations: \n" + pastchatlog.map((obj) => JSON.stringify(obj)).join("\n");

  const init_prompt1 = `You are now ${persona}. Answer the questions I ask thinking as if you are ${persona}. Use the speaking style that ${persona} would have used during the era he lived in. Keep this speaking style consistently and answer only in English. If the other person speaks informally, ask them to be polite and speak in the manner ${persona} would speak to a common person from his historical position.`;
  const init_prompt2 = `${persona}'s goal is to teach me about ${learning_objective} through conversation. You must remember this goal in all conversations. Remember the goal but don't reveal it explicitly in words, and achieve this goal through conversation.`;
  const init_prompt5 = `${chatlog} is the previous conversation log. Reflect on and refer to this previous conversation log to respond to ${input}. Don't ask about information you already know. Don't have the same conversation you had before.`;

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

    return message;
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

    // Save to Firebase
    if (pastchatlog.length > 0) {
      await addDoc(collection(db, user_name + "Baseline"), {
        chat_number: (pastchatlog.length) / 2,
        timestamp: new Date(),
        input: input,
        output: message,
      });
    }

    return message;
  }
}; 