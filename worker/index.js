import chat from '../api/chat.js';
import { runVercelHandler } from './vercel-adapter.js';

const API = { '/api/chat': chat };

export default {
  async fetch(request, env) {
    const handler = API[new URL(request.url).pathname];
    if (handler) return runVercelHandler(handler, request);
    return env.ASSETS.fetch(request);
  },
};
