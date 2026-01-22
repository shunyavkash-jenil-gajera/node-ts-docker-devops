export interface User {
  id: string;
  email: string;
  password?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignUpPayload {
  email: string;
  password: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    user?: User;
    token?: string;
    refreshToken?: string;
  };
}
