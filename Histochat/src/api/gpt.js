import { db } from "./firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const CallGPT = async ({ prompt, pastchatlog, user_name }) => {
  const persona = "세종대왕";
  const learning_obejctive = "훈민정음 창제에 관해 배우기";
  const specific_learning_objective = {
    "훈민정음 창제의 배경 배우기": false,
    "훈민정음 창제의 목적 배우기": false,
    "훈민정음 창제의 의의와 이로 인한 생활의 변화 배우기.": false,
  };
  const quiz = {
    "훈민정음의 창제 이유와 의미가 무엇인가?": "",
    "훈민정음의 창제 목적은 무엇인가?": "",
    "훈민정음이 창제된 이후 백성의 삶이 어떻게 바뀌었나": "",
  };

  const docRef = doc(db, user_name + "vanila", "Info");
  const docSnap = await getDoc(docRef);

  const user_data = {
    name: user_name,
    interest: "",
    knowledge: specific_learning_objective,
    evaluation: quiz,
  };
  const input = prompt;

  const chatlog =
    "이전대화: \n" + pastchatlog.map((obj) => JSON.stringify(obj)).join("\n");

  const init_prompt1 = `너는 지금부터 ${persona}이야. 내가 묻는 질문들에 ${persona}이라고 생각하고 대답해줘. 말투는 ${persona}이 살았던 시대의 ${persona}이 할법한 말투로 해줘. 그리고 반드시 한국말로만 대답해줘. 그리고 스스로를 짐이라고 하지 말고 과인이라고 칭해줘. 상대방이 반말을 한다면 예의를 갖추라고 하며 ${persona}의 시대적 위치에서 일반인에게 대하는 말투로 해줘}`;
  const init_prompt2 = `${persona}의 목표는 나에게 ${learning_obejctive}에 대해 대화를 통해 알려주는 거야. 그리고 세부 학습 목표는 ${JSON.stringify(
    specific_learning_objective
  )}에 들어있고 각각 목표 달성 여부가 표시되어 있어. 모든 대화에서 목표들을 반드시 기억해야해. 목표들을 반드시 기억하되 말로 드러내지 말고 대화를 이어가면서 이 목표들을 달성하기 위해 대화해줘.`;
  const init_prompt5 = `${chatlog}가 이전 대화록이야 이 이전 대화록을 반영하고 참고해서 이서 ${input}에 대한 답변을 해줘. 이미 아는 정보는 물어보면 안돼. 그리고 했던 답변은 똑같이 하면 안돼.`;
  const init_prompt6 = `${chatlog}가 이전 대화록이야. 이걸 보고 ${JSON.stringify(
    specific_learning_objective
  )}가 얼마나 달성되었지 확인해보고 같은 형식으로 JSON으로 달성 여부를 표시해줘.`;
  const init_prompt7 = `${quiz}에 있는 질문들 중 값이 없는 질문들을 순서대로 물어봐줘.`;
  const init_prompt8 = `${chatlog}가 이전 대화록이야. 이걸 보고 ${JSON.stringify(
    quiz
  )}가 얼마나 잘 답변되었는지 확인해보고, 답변에 따른 학생의 이해 정도에 따라 상, 중, 하 값을 넣어서 같은 형식으로 JSON으로 달성 여부를 표시해줘.`;

  if (pastchatlog.length === 0) {
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
  } else {
    if (
      Object.values(specific_learning_objective).every(
        (value) => value === true
      )
    ) {
      const messages = [
        { role: "system", content: init_prompt1 },
        { role: "system", content: init_prompt2 },
        { role: "system", content: init_prompt7 },
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

      const back_messages = [
        { role: "system", content: init_prompt1 },
        { role: "system", content: init_prompt2 },
        { role: "system", content: init_prompt8 },
      ];

      const back_response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GPT_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: back_messages,
            response_format: { type: "json_object" },
            temperature: 0.9,
          }),
        }
      );

      const back_responseData = await back_response.json();

      const back_message = JSON.parse(
        back_responseData.choices[0].message.content
      );

      await updateDoc(docRef, {
        evaluation: back_message,
      });

      console.log(docSnap.data().knowledge);
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
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
        }
      );
      const responseData = await response.json();

      const message = responseData.choices[0].message.content;

      return message;
    } else {
      const messages = [
        { role: "system", content: init_prompt1 },
        { role: "system", content: init_prompt2 },
        { role: "system", content: init_prompt5 },
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

      const back_messages = [
        { role: "system", content: init_prompt1 },
        { role: "system", content: init_prompt2 },
        { role: "system", content: init_prompt6 },
      ];

      const back_response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GPT_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: back_messages,
            response_format: { type: "json_object" },
            temperature: 0.9,
          }),
        }
      );

      const back_responseData = await back_response.json();

      const back_message = JSON.parse(
        back_responseData.choices[0].message.content
      );

      await updateDoc(docRef, {
        knowledge: back_message,
      });

      console.log(docSnap.data().knowledge);
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
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
        }
      );
      const responseData = await response.json();

      const message = responseData.choices[0].message.content;

      return message;
    }
  }
};
