// components/ai/providers.ts
export type GenParams = { prompt: string; model?: string };

export interface Provider {
  name: string;
  supportsImages?: boolean;
  generate(params: GenParams, opt: { apiKey?: string }): Promise<string>;
}

export const registry: Record<string, Provider> = {
  openai: {
    name: 'OpenAI',
    async generate({ prompt, model = 'gpt-4o-mini' }, { apiKey }) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      // Avoid sending "Bearer undefined"
      if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

      try {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!r.ok) {
          // Include response body for easier debugging
          const bodyText = await r.text().catch(() => '');
          throw new Error(
            `OpenAI API error ${r.status} ${r.statusText}${bodyText ? `: ${bodyText}` : ''}`
          );
        }

        const j = await r.json().catch(() => ({}));
        return (j as any)?.choices?.[0]?.message?.content ?? '';
      } catch (err) {
        throw new Error(
          `Failed to fetch OpenAI completion: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    },
  },
  // add more providers (higgsfield, local, etc.) behind the same interface
};
