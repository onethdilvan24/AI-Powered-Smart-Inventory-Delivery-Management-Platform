import { api } from '../api/client';

export const assistantService = {
  async query(message: string): Promise<{ message: string; timestamp: string }> {
    const res = await api.post<{ data: { message: string; timestamp: string } }>(
      '/assistant/query',
      { message },
    );
    return res.data;
  },
};
