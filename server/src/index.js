import { startStandalone } from './standalone.js';

const port = Number(process.env.PORT) || 5000;
const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
startStandalone(port, { apiKey });
