import { config } from 'dotenv';
config();

import '@/ai/flows/event-description-generator-flow.ts';
import '@/ai/flows/issue-triage-flow.ts';
import '@/ai/flows/lost-found-matcher-flow.ts';