
export const authService = {
  getStoredUser: jest.fn().mockReturnValue(null),
  getAccessToken: jest.fn().mockReturnValue(null),
  getCurrentUser: jest.fn().mockResolvedValue(null),
  login: jest.fn().mockResolvedValue({ user: { id: 1, email: 'test@example.com' } }),
  cibnLogin: jest.fn().mockResolvedValue({ user: { id: 1, email: 'test@example.com' } }),
  register: jest.fn().mockResolvedValue({}),
  logout: jest.fn().mockImplementation(() => {}),
}

export interface User {
  id: number
  email: string
  role: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface CIBNLoginCredentials {
  cibn_employee_id: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
}
