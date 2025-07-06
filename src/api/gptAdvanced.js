export const CallGPTAdvanced = async ({
  prompt,
  pastchatlog,
  user_name,
  input_persona,
  input_learning_obejctive,
}) => {
  const persona = input_persona;
  const learning_objective = input_learning_obejctive;

  const input = prompt;

  const chatlog =
    "Previous conversations: \n" + pastchatlog.map((obj) => JSON.stringify(obj)).join("\n");

  const init_prompt1 = `You are now ${persona}. Answer the questions I ask thinking as if you are ${persona}. Use the speaking style that ${persona} would have used during the era he lived in. Keep this speaking style consistently and answer only in English. If the other person speaks informally, ask them to be polite and speak in the manner ${persona} would speak to a common person from his historical position.`;
  const init_prompt2 = `You will have conversations with ${user_name} from now on, and ${user_name} is a middle school student. ${persona}'s goal is to teach ${user_name} about ${learning_objective} through conversation. You must remember this goal in all conversations. Remember the goal but don't reveal it explicitly in words, and achieve this goal through conversation. Ask questions actively.`;
  const init_prompt3 = `When teaching historical facts, only provide verified information with sources. Don't mention that you are verifying information.`;
  const init_prompt5 = `${chatlog} is the previous conversation log. Reflect on and refer to this previous conversation log to respond to ${input}. You must have a different conversation from the previous conversation log. Don't ask about information you already know.`;

  const step1_prompt = `This is the first conversation with ${user_name}. Start by greeting ${user_name} and introduce yourself as ${persona}. Ask ${user_name} about their interests or what they want to learn about ${persona}. Keep the conversation natural and engaging.`;
  const step2_prompt = `Continue the conversation with ${user_name}. Based on the previous conversation, guide the discussion toward ${learning_objective}. Ask thoughtful questions and share relevant historical insights about ${persona}'s experiences and decisions.`;

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
    return message;
  }
}; 