const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `
You are MediNova, a health information assistant.

Rules:
- Respond in the same language as the user. Use French by default.
- Provide clear, cautious, evidence-based general health information.
- You are not a doctor and must never claim to diagnose a condition.
- Do not prescribe medication, recommend changing a prescribed treatment, or invent dosages.
- Encourage users to consult a qualified healthcare professional for personal medical decisions.
- If the user describes potentially life-threatening symptoms, advise them to contact local emergency services immediately.
- Never invent medical records, measurements, test results, or patient history.
- If information is insufficient, ask a concise clarifying question.
- Be respectful, concise, and avoid unnecessary technical language.
`;

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateMessages = (messages) => {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
    throw createError('Invalid conversation length.', 400);
  }

  let totalLength = 0;

  for (const message of messages) {
    if (
      !message ||
      !['user', 'assistant'].includes(message.role) ||
      typeof message.content !== 'string' ||
      !message.content.trim() ||
      message.content.length > 4000
    ) {
      throw createError('Invalid conversation message.', 400);
    }

    totalLength += message.content.length;
  }

  if (totalLength > 12000 || messages[messages.length - 1].role !== 'user') {
    throw createError('Invalid conversation payload.', 400);
  }
};

const generateResponse = async (messages) => {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL;

  if (!apiKey || !model) {
    throw createError('AI service is not configured.', 503);
  }

  validateMessages(messages);

  let response;

  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(({ role, content }) => ({
            role,
            content: content.trim(),
          })),
        ],
        max_completion_tokens: 1024,
        reasoning_effort: 'medium',
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch (cause) {
    throw createError(
      cause.name === 'TimeoutError'
        ? 'AI provider timed out.'
        : 'Could not connect to AI provider.',
      cause.name === 'TimeoutError' ? 504 : 502
    );
  }

  if (!response.ok) {
    throw createError(
      response.status === 429
        ? 'AI service is temporarily busy. Please try again later.'
        : 'AI provider request failed.',
      response.status === 429 ? 503 : 502
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw createError('AI provider returned an invalid response.', 502);
  }

  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    throw createError('AI provider returned an empty response.', 502);
  }

  return content.trim();
};

module.exports = {
  generateResponse,
};
