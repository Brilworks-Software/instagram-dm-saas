const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

console.log('[Gemini Init] API Key present:', !!GEMINI_API_KEY);
console.log('[Gemini Init] API Key length:', GEMINI_API_KEY?.length || 0);

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing from environment variables');
    throw new Error('GEMINI_API_KEY is not configured');
  }

  console.log('[Gemini] Making API call to:', GEMINI_API_URL);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Gemini] API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('[Gemini] No candidates in response');
      throw new Error('No response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('[Gemini] ✅ Successfully generated response');
    return generatedText;
  } catch (error) {
    console.error('[Gemini] Error:', error);
    throw error;
  }
}

// Specific tool functions
export async function generateCaptions(topic: string, style?: string): Promise<string[]> {
  const stylePrompt = style ? `Style: ${style}. ` : '';
  const prompt = `Generate 10 creative Instagram captions for: "${topic}". ${stylePrompt}Make them engaging, use emojis, and keep them under 150 characters each. Return only the captions, one per line, no numbering or bullet points.`;
  
  const response = await callGemini(prompt);
  return response
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && 
             !trimmed.match(/^\d+[\.\)]/) && 
             !trimmed.startsWith('-') &&
             !trimmed.startsWith('•');
    })
    .slice(0, 10);
}

export async function generateHashtags(topic: string, count: number = 30): Promise<string[]> {
  const prompt = `Generate ${count} relevant Instagram hashtags for: "${topic}". Include mix of popular and niche hashtags. Return only hashtags, one per line, with # symbol. No numbering or bullet points.`;
  
  const response = await callGemini(prompt);
  return response
    .split('\n')
    .map(line => {
      let trimmed = line.trim();
      // Remove numbering and bullets
      trimmed = trimmed.replace(/^\d+[\.\)]\s*/, '');
      trimmed = trimmed.replace(/^[-•]\s*/, '');
      // Ensure it starts with #
      if (!trimmed.startsWith('#')) {
        trimmed = '#' + trimmed;
      }
      return trimmed;
    })
    .filter(line => line.startsWith('#') && line.length > 1 && line.length < 50)
    .slice(0, count);
}

export async function generateContentIdeas(niche: string, count: number = 15): Promise<string[]> {
  const prompt = `Generate ${count} SHORT and SWEET Instagram content ideas for "${niche}". 

RULES:
- Keep each idea under 10 words
- Be specific and actionable
- Mix of Posts, Stories, and Reels ideas
- Use engaging language
- No fluff or unnecessary words
- Return ONLY the ideas, one per line
- NO numbering, NO bullet points, NO explanations

Examples:
Behind-the-scenes of [specific process]
Quick 30-second tutorial on [topic]
Before/After transformation showcase
Day in the life vlog
Q&A session with your audience

Now generate ${count} ideas for: ${niche}`;
  
  const response = await callGemini(prompt);
  return response
    .split('\n')
    .map(line => {
      let trimmed = line.trim();
      // Remove numbering, bullets, and common prefixes
      trimmed = trimmed.replace(/^\d+[\.\)]\s*/, '');
      trimmed = trimmed.replace(/^[-•*]\s*/, '');
      trimmed = trimmed.replace(/^(Idea|Post|Story|Reel):\s*/i, '');
      return trimmed;
    })
    .filter(line => line.length > 0 && line.length <= 100) // Max 100 chars for short & sweet
    .slice(0, count);
}

