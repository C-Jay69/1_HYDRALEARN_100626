import {genkit} from 'genkit';
import {openAICompatible} from '@genkit-ai/compat-oai';

const apiKey = process.env.OPENROUTER_API_KEY;

export const ai = genkit({
  plugins: [
    openAICompatible({
      name: 'openrouter',
      apiKey: apiKey || undefined,
      baseURL: 'https://openrouter.ai/api/v1',
    }),
  ],
  model: 'openrouter/google/gemma-4-31b-it:free',
});