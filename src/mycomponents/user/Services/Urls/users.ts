// simple users service to get list of users (or adapt to your API)
import axiosClient from '@/lib/axiosClient';

export type User = {
  _id: string;
  name?: string;
  fullname?: string;
  email?: string;
  // ...other fields
};

export async function getUsersService(): Promise<User[]> {
  // Adjust endpoint if your backend uses /v1/users or /v1/account/users etc.
  const res = await axiosClient.get('/users');
  return res.data?.data?.users || res.data?.users || res.data || [];
}