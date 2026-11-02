import {genkit} from 'genkit';
import {openAICompatible} from '@genkit-ai/compat-oai';

const apiKey = process.env.OPENROUTER_API_KEY;

const MAX_RETRIES = 4; // up to 5 attempts total
const ATTEMPT_TIMEOUT_MS = 120_000;
const TOTAL_BUDGET_MS = 240_000; // stop retrying after ~4 minutes overall
// 408 = timeout, 429 = rate limited. 5xx includes the Cloudflare 52x errors
// that OpenRouter's free tier surfaces during provider incidents.
const RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524];
const RETRYABLE_NETWORK_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ETIMEDOUT',
  'EPIPE',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_SOCKET',
  'ERR_STREAM_PREMATURE_CLOSE',
]);

/** Exponential backoff with jitter so retries don't hit in lockstep. */
function backoffDelay(attempt: number): number {
  const base = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s, 8s
  return base + Math.floor(Math.random() * 500);
}

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
        // Capture the provider's error body so the real reason reaches the UI
        // instead of a bare "HTTP 502".
        let bodyText = '';
        try {
          bodyText = (await res.text()).slice(0, 500);
        } catch {
          await res.body?.cancel().catch(() => {});
        }
        throw Object.assign(
          new Error(`OpenRouter returned HTTP ${res.status}${bodyText ? `: ${bodyText}` : ''}`),
          {
            code: String(res.status),
            _retryable: true,
          }
        );
      }
      return res;
    } catch (err) {
      const code = (err as { code?: string })?.code;
      const msg = (err as Error)?.message ?? '';
      const isNetworkError =
        RETRYABLE_NETWORK_CODES.has(code ?? '') ||
        /premature close|socket hang up|fetch failed|network error|terminated/i.test(msg);
      const isTimeout = (err as Error)?.name === 'AbortError';
      throw isNetworkError || isTimeout
        ? Object.assign(new Error(msg || 'Request timed out'), { code, _retryable: true })
        : err;
    } finally {
      clearTimeout(timeout);
    }
  };

  return new Promise((resolve, reject) => {
    let attempt = 0;
    const startedAt = Date.now();
    const tryFetch = () => {
      makeAttempt().then(resolve).catch((err) => {
        const withinBudget = Date.now() - startedAt < TOTAL_BUDGET_MS;
        if (err?._retryable && attempt < MAX_RETRIES && withinBudget) {
          attempt++;
          const delay = backoffDelay(attempt);
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

/**
 * Retries an AI call when the model emits JSON that fails the output schema
 * (free models occasionally omit required fields) or when the provider reports
 * a transient/overloaded condition. Transport-level retries already happen in
 * resilientFetch; this covers generation-time failures.
 */
export async function withAiRetry<T>(
  label: string,
  fn: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      // Only retry malformed/empty model output. Transport-level failures are
      // already retried inside resilientFetch, so retrying them here would
      // multiply the wait time without adding resilience.
      const retryable =
        /schema validation|must have required property|failed to parse|no valid JSON|empty (?:strategy|lesson plan)/i.test(
          msg
        );
      if (!retryable || attempt === maxAttempts) throw err;
      const delay = backoffDelay(attempt);
      console.warn(
        `[genkit] ${label} attempt ${attempt}/${maxAttempts} failed (${msg.slice(0, 200)}); retrying in ${delay}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastErr;
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