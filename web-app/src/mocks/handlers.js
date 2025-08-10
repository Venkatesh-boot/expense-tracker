
import { http, passthrough } from 'msw';

const handlers = [
  http.get('http://localhost:9001/expenses', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(Array.from({ length: 50 }, (_, i) => ({
        id: String(i + 1),
        date: `2025-07-${String((i % 30) + 1).padStart(2, '0')}`,
        category: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Travel', 'Education', 'Other'][i % 9],
        amount: Math.floor(Math.random() * 2000) + 100,
        description: `Mock expense #${i + 1}`,
      })))
    );
  }),
  // Add more handlers for POST, PUT, DELETE as needed

// Catch-all handler to suppress MSW warnings for unhandled requests (including WebSocket)
export const handlersWithCatchAll = [
  ...handlers,
  passthrough(),
];

export const handlers = handlers;
];
