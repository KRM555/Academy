import type { ProgramCourse, Student, TeacherPayout, UserAuth, RegisteredLead, ContactInquiry } from '../types';

export class ApiError extends Error {
  status: number;
  data?: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'same-origin', // Sends and receives httpOnly cookie nb_session
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errorMsg = data?.message || `فشل الطلب (${res.status})`;
    throw new ApiError(errorMsg, res.status, data);
  }

  return data as T;
}

export const api = {
  auth: {
    async login(email: string, password: string): Promise<{ success: boolean; user: UserAuth; message: string }> {
      return request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    async getMe(): Promise<{ success: boolean; user: UserAuth | null }> {
      return request('/api/auth/me', { method: 'GET' });
    },
    async logout(): Promise<{ success: boolean; message: string }> {
      return request('/api/auth/logout', { method: 'POST' });
    },
  },

  courses: {
    async list(): Promise<{ success: boolean; courses: ProgramCourse[] }> {
      return request('/api/courses', { method: 'GET' });
    },
    async create(course: Omit<ProgramCourse, 'id'>): Promise<{ success: boolean; course: ProgramCourse; message: string }> {
      return request('/api/courses', {
        method: 'POST',
        body: JSON.stringify(course),
      });
    },
    async update(id: string, updates: Partial<ProgramCourse>): Promise<{ success: boolean; course: ProgramCourse; message: string }> {
      return request(`/api/courses/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    async delete(id: string): Promise<{ success: boolean; message: string }> {
      return request(`/api/courses/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },
  },

  students: {
    async list(): Promise<{ success: boolean; students: Student[] }> {
      return request('/api/students', { method: 'GET' });
    },
    async updateProgress(
      id: string,
      newSurah?: string,
      teacherNotes?: string
    ): Promise<{ success: boolean; student: Student; message: string }> {
      return request(`/api/students/${encodeURIComponent(id)}/progress`, {
        method: 'POST',
        body: JSON.stringify({ newSurah, teacherNotes }),
      });
    },
  },

  payouts: {
    async list(): Promise<{ success: boolean; payouts: TeacherPayout[] }> {
      return request('/api/payouts', { method: 'GET' });
    },
    async updateBankDetails(
      bankName: string,
      accountHolderName: string,
      iban: string
    ): Promise<{ success: boolean; payout: TeacherPayout; message: string }> {
      return request('/api/payouts/update-iban', {
        method: 'POST',
        body: JSON.stringify({ bankName, accountHolderName, iban }),
      });
    },
  },

  leads: {
    async register(lead: Omit<RegisteredLead, 'id' | 'createdAt' | 'status'> & { hp_website?: string }): Promise<{
      success: boolean;
      message: string;
      leadId: string;
    }> {
      return request('/api/leads/register', {
        method: 'POST',
        body: JSON.stringify(lead),
      });
    },
    async list(): Promise<{ success: boolean; leads: RegisteredLead[] }> {
      return request('/api/leads', { method: 'GET' });
    },
  },

  contact: {
    async submit(inquiry: Omit<ContactInquiry, 'id' | 'createdAt'> & { hp_website?: string }): Promise<{
      success: boolean;
      message: string;
      ticketId: string;
    }> {
      return request('/api/contact/submit', {
        method: 'POST',
        body: JSON.stringify(inquiry),
      });
    },
    async list(): Promise<{ success: boolean; inquiries: ContactInquiry[] }> {
      return request('/api/contact/inquiries', { method: 'GET' });
    },
  },

  settings: {
    async get(): Promise<{ success: boolean; [key: string]: any }> {
      return request('/api/settings', { method: 'GET' });
    },
  },
};
