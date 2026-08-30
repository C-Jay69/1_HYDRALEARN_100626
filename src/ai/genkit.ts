import {genkit} from 'genkit';
import {openAICompatible} from '@genkit-ai/compat-oai';

const apiKey = process.env.OPENROUTER_API_KEY;

const MAX_RETRIES = 3;

/**
 * Wraps fetch with retry + timeout logic to survive OpenRouter's
 * free-tier stream truncation (ERR_STREAM_PREMATURE_CLOSE).
 */
function resilientFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const makeAttempt = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } catch (err) {
      const code = (err as { code?: string })?.code;
      const msg = (err as Error)?.message ?? '';
      const isPrematureClose =
        code === 'ERR_STREAM_PREMATURE_CLOSE' ||
        /premature close/i.test(msg) ||
        code === 'ECONNRESET' ||
        /socket hang up/i.test(msg);
      throw isPrematureClose
        ? Object.assign(new Error(msg), { code, _retryable: true })
        : err;
    } finally {
      clearTimeout(timeout);
    }
  };

  return new Promise((resolve, reject) => {
    let attempt = 0;
    const tryFetch = () => {
      makeAttempt().then(resolve).catch((err) => {
        if (err?._retryable && attempt < MAX_RETRIES) {
          attempt++;
          // exponential backoff: 500ms, 1s, 2s
          setTimeout(tryFetch, Math.pow(2, attempt - 1) * 500);
        } else {
          reject(err);
        }
      });
    };
    tryFetch();
  });
}

export const ai = genkit({
  plugins: [
    openAICompatible({
      name: 'openrouter',
      apiKey: apiKey || undefined,
      baseURL: 'https://openrouter.ai/api/v1',
      fetch: resilientFetch as any, // OpenAI SDK accepts custom fetch
    }),
  ],
  model: 'openrouter/minimax/minimax-m3:free',
});