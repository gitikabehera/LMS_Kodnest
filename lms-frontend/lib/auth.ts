import api from './apiClient';

export async function loginApi(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  sessionStorage.setItem('accessToken', data.accessToken);
  return data.user;
}

export async function registerApi(name: string, email: string, password: string) {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
}

export async function logoutApi() {
  await api.post('/auth/logout');
  sessionStorage.removeItem('accessToken');
}
