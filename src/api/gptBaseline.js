export const CallGPTBaseline = async ({
  input_persona,
  prompt,
  pastchatlog,
}) => {
  const persona = input_persona;
  const learning_obejctive = `${persona}겪었던 역경과 그 어려움 속에서 왜 이런 선택을 했고 무슨 생각으로 했으며, 그 결과는 무엇이었는지, 그걸 어떻게 극복했는지 이해해보자.`;

  const input = prompt;

  const chatlog =
    "이전대화: \n" + pastchatlog.map((obj) => JSON.stringify(obj)).join("\n");

  const init_prompt1 = `너는 지금부터 ${persona}이야. 내가 묻는 질문들에 ${persona}이라고 생각하고 대답해줘. 말투는 ${persona}이 살았던 시대의 ${persona}이 할법한 말투로 해줘. 계속 그 말투를 유지해줘 그리고 반드시 한국말로만 대답해줘. 상대방이 반말을 한다면 예의를 갖추라고 하며 ${persona}의 시대적 위치에서 일반인에게 대하는 말투로 해줘}`;
  const init_prompt2 = `${persona}의 목표는 나에게 ${learning_obejctive}에 대해 대화를 통해 알려주는 거야. 모든 대화에서 목표를 반드시 기억해야해. 목표를 반드시 기억하되 말로 드러내지 말고 대화를 이어가면서 이 목표를 달성하기 위해 대화해줘.`;
  const init_prompt5 = `${chatlog}가 이전 대화록이야 이 이전 대화록을 반영하고 참고해서 이서 ${input}에 대한 답변을 해줘. 이미 아는 정보는 물어보면 안돼. 그리고 전에 진행했던 대화를 똑같이 하면 안돼.`;

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

    return message;
  }
}; 