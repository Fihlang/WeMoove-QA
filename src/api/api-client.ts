import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ENV } from '../support/env';

export class ApiClient {
  private readonly http: AxiosInstance;
  private authToken?: string;

  constructor(baseURL: string = ENV.apiBaseUrl) {
    this.http = axios.create({
      baseURL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true, // handle all statuses manually
    });

    this.http.interceptors.request.use(config => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });
  }

  setToken(token: string): void {
    this.authToken = token;
  }

  clearToken(): void {
    this.authToken = undefined;
  }

  async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.http.get<T>(path, config);
    this.assertSuccess(res.status, 'GET', path);
    return res.data;
  }

  async post<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.http.post<T>(path, body, config);
    this.assertSuccess(res.status, 'POST', path, res.data);
    return res.data;
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await this.http.put<T>(path, body);
    this.assertSuccess(res.status, 'PUT', path);
    return res.data;
  }

  async delete(path: string): Promise<void> {
    const res = await this.http.delete(path);
    if (res.status !== 204 && res.status !== 200 && res.status !== 404) {
      throw new Error(`DELETE ${path} returned unexpected status ${res.status}`);
    }
  }

  private assertSuccess(status: number, method: string, path: string, body?: unknown): void {
    if (status >= 400) {
      throw new Error(
        `API ${method} ${path} failed with status ${status}.\nBody: ${JSON.stringify(body, null, 2)}`
      );
    }
  }
}
