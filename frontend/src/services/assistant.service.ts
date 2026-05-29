import { api } from '../api/client';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export const assistantService = {
  async query(
    message: string,
    history: ChatTurn[] = [],
  ): Promise<{ message: string; source?: string; timestamp: string }> {
    const res = await api.post<{ data: { message: string; source?: string; timestamp: string } }>(
      '/assistant/query',
      { message, history },
    );
    return res.data;
  },
};
