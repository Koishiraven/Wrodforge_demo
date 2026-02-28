const API_KEY = 'sk-23b34f03dbdc4f438371d0fac2741073';
const BASE_URL = 'https://api.deepseek.com/v1'; // 默认使用 DeepSeek 接口，兼容 OpenAI

export interface AIResponse {
  title: string;
  content: string;
  timeHint?: string;
  placeHint?: string;
}

export async function generatePlot(
  basketCards: any[],
  instruction: string
): Promise<AIResponse> {
  const context = basketCards
    .map(
      (c) =>
        `${c.data.type === 'role' ? '角色' : c.data.type === 'event' ? '事件' : '设定'}: ${
          c.data.title
        } (${c.data.content || '暂无详细描述'})`
    )
    .join('\n');

  const systemPrompt = `你是一个资深的创意写作助手。请根据用户提供的素材（角色、事件、设定）以及微调指令，生成一段精彩的故事细节或情节。
输出必须是纯 JSON 格式，包含以下字段：
- title: 情节标题（吸引人且简短）
- content: 具体情节正文（200-300字，叙述感强）
- timeHint: 发生的时间暗示（如：清晨、深夜、三年后）
- placeHint: 发生的地点暗示（如：破庙、繁忙的街道、记忆深处）

素材上下文：
${context}

约束：
1. 严格遵守 JSON 格式。
2. 情节要符合素材设定。
3. 如果指令中有具体要求，请优先满足。`;

  const userPrompt = instruction || "请基于以上素材生成一个新的情节。";

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
    }

    const data = await response.json();
    const resultString = data.choices[0].message.content;
    
    // 解析 JSON
    try {
      return JSON.parse(resultString) as AIResponse;
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', resultString);
      // 降级处理：如果解析失败，将整个文本作为内容
      return {
        title: '新情节',
        content: resultString,
      };
    }
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
}
