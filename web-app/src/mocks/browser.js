import { setupWorker } from 'msw/browser';
import { handlersWithCatchAll } from './handlers';

export const worker = setupWorker(...handlersWithCatchAll);
