import {genkit} from 'genkit';
import {openAICompatible} from '@genkit-ai/compat-oai';

const apiKey = process.env.OPENROUTER_API_KEY;

const MAX_RETRIES = 3;
const ATTEMPT_TIMEOUT_MS = 120_000;
const RETRYABLE_STATUSES = [429, 500, 502, 503, 504];

/**
 * Wraps fetch with retry + timeout logic to survive OpenRouter's
 * free-tier flakiness: slow queues, 429 rate limits, and stream
 * truncation (ERR_STREAM_PREMATURE_CLOSE).
 */
function resilientFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const makeAttempt = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      if (RETRYABLE_STATUSES.includes(res.status)) {
        await res.body?.cancel().catch(() => {});
        throw Object.assign(new Error(`OpenRouter returned HTTP ${res.status}`), {
          code: String(res.status),
          _retryable: true,
        });
      }
      return res;
    } catch (err) {
      const code = (err as { code?: string })?.code;
      const msg = (err as Error)?.message ?? '';
      const isPrematureClose =
        code === 'ERR_STREAM_PREMATURE_CLOSE' ||
        /premature close/i.test(msg) ||
        code === 'ECONNRESET' ||
        /socket hang up/i.test(msg);
      const isTimeout = (err as Error)?.name === 'AbortError';
      throw isPrematureClose || isTimeout
        ? Object.assign(new Error(msg || 'Request timed out'), { code, _retryable: true })
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
          // exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.warn(
            `[genkit] OpenRouter attempt ${attempt} failed (${err.message}); retrying in ${delay}ms`
          );
          setTimeout(tryFetch, delay);
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
  model: process.env.OPENROUTER_MODEL || 'openrouter/google/gemma-4-26b-a4b-it:free',
});