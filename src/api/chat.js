const post = async (body) => {
  const r = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`chat ${r.status}`);
  return (await r.json()).message;
};

export const CallGPTBaseline = ({ input_persona, prompt, pastchatlog, user_name, language }) =>
  post({ variant: 'baseline', persona: input_persona, prompt, pastchatlog, user_name, language });

export const CallGPTAdvanced = ({ input_persona, prompt, pastchatlog, user_name, input_learning_obejctive, language }) =>
  post({ variant: 'experimental', persona: input_persona, prompt, pastchatlog, user_name, learning_objective: input_learning_obejctive, language });
