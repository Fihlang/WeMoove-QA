import { ApiClient } from './api-client';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    role: string;
    courierCompanyId?: string;
  };
}

interface RegisterRequest {
  name: string;
  surname: string;
  email: string;
  password: string;
  role?: string;
  courierCompanyName?: string;
}

export class AuthApi {
  constructor(private readonly client: ApiClient) {}

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.client.post<LoginResponse>('/api/auth/login', credentials);
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    return this.client.post<LoginResponse>('/api/auth/register', data);
  }

  async forgotPassword(email: string): Promise<{ token?: string; message: string }> {
    return this.client.post('/api/auth/forgot-password', { email });
  }

  async resetPassword(data: { email: string; token: string; newPassword: string }): Promise<void> {
    await this.client.post('/api/auth/reset-password', data);
  }
}
