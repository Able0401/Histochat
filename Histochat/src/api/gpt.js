export const CallGPT = async ({ prompt, pastchatlog }) => {
  const persona = "세종대왕";
  const learning_obejctive = "한글 창제 과정 배우기";
  const specific_learning_objective = {
    "한글 창제의 역사적 배경 이해하기": false,
    "세종대왕이 한글을 창제하게 된 배경과 그 당시의 사회적, 문화적 상황을 설명할 수 있다.": false,
    "한자 사용의 어려움과 그로 인한 일반 백성들의 생활 속 불편함을 설명할 수 있다.": false,
    "한글 창제를 위한 집현전 학자들의 역할과 활동을 설명할 수 있다.": false,
    "한글 창제 과정과 원리 분석하기": false,
    "한글의 자음과 모음이 어떻게 만들어졌는지 그 원리를 이해하고 설명할 수 있다.": false,
    "한글 창제 과정에서 겪었던 어려움과 그에 대한 해결책을 논의할 수 있다.": false,
    "훈민정음 해례본의 주요 내용을 읽고 해석할 수 있다.": false,
    "한글 창제의 역사적 의의와 현대적 중요성 평가하기": false,
    "한글 창제가 당시와 현재 사회에 미친 영향을 분석할 수 있다.": false,
    "한글 창제가 한국 문화와 정체성 형성에 어떤 기여를 했는지 설명할 수 있다.": false,
    "한글의 과학적 원리를 현대적인 시각에서 재평가하고 그 중요성을 논의할 수 있다.": false,
  };

  const user_data = {
    name: "",
    interest: "",
    knowledge: "",
  };
  const input = prompt;

  const chatlog = "이전대화: \n" + pastchatlog;

  const init_prompt1 = `너는 지금부터 ${persona}이야. 내가 묻는 질문들에 ${persona}이라고 생각하고 대답해줘. 말투는 ${persona}이 살았던 시대의 ${persona}이 할법한 말투로 해줘. 그리고 반드시 한국말로만 대답해줘. 그리고 스스로를 짐이라고 하지 말고 과인이라고 칭해줘.`;
  const init_prompt2 = `${persona}의 목표는 나에게 ${learning_obejctive}에 대해 대화를 통해 알려주는 거야. 그리고 세부 학습 목표는 ${specific_learning_objective}에 들어있고 각각 목표 달성 여부가 표시되어 있어. 모든 대화에서 목표들을 반드시 기억해야해. 목표들을 반드시 기억하되 말로 드러내지 말고 대화를 이어가면서 이 목표들을 달성하기 위해 대화해줘.`;

  const messages = [
    { role: "system", content: init_prompt1 },
    { role: "system", content: init_prompt2 },
    {
      role: "system",
      content:
        user_data +
        "\n 위에 제공한 유저 정보와" +
        chatlog +
        "\n 이 이전 대화록에 이어서 " +
        input +
        "에 대한 답변을 해줘.",
    },
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
};
