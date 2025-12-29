const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const response = await fetch(GEMINI_API_URL, {
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
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

export async function generateContentIdeas(niche: string, count: number = 20): Promise<string[]> {
  const prompt = `Generate ${count} creative Instagram content ideas for niche: "${niche}". Include ideas for posts, stories, and reels. Make them specific and actionable. Return only the ideas, one per line, no numbering or bullet points.`;
  
  const response = await callGemini(prompt);
  return response
    .split('\n')
    .map(line => {
      let trimmed = line.trim();
      // Remove numbering and bullets
      trimmed = trimmed.replace(/^\d+[\.\)]\s*/, '');
      trimmed = trimmed.replace(/^[-•]\s*/, '');
      return trimmed;
    })
    .filter(line => line.length > 0)
    .slice(0, count);
}

