import { supabase } from "../config/supabase.config.js";
import type { User, SignUpPayload, LoginPayload } from "../models/user.model.js";

export class AuthService {
  /**
   * Sign up a new user with Supabase Auth
   */
  async signUp(payload: SignUpPayload): Promise<{ user: User; session: any }> {
    const { email, password, firstName, lastName } = payload;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
        },
      },
    });

    console.log(payload)
    console.log("AuthService.signUp - authData:", authData , authError);
    
    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("User creation failed");
    }

    const user: User = {
      id: authData.user.id,
      email: authData.user.email || "",
      firstName: authData.user.user_metadata?.firstName as string | undefined,
      lastName: authData.user.user_metadata?.lastName as string | undefined,
      createdAt: new Date(authData.user.created_at || new Date()),
      updatedAt: new Date(authData.user.updated_at || new Date()),
    };

    return {
      user,
      session: authData.session,
    };
  }

  /**
   * Login user with email and password
   */
  async login(payload: LoginPayload): Promise<{ user: User; session: any }> {
    const { email, password } = payload;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error("Login failed");
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || "",
      firstName: data.user.user_metadata?.firstName as string | undefined,
      lastName: data.user.user_metadata?.lastName as string | undefined,
      createdAt: new Date(data.user.created_at || new Date()),
      updatedAt: new Date(data.user.updated_at || new Date()),
    };

    return {
      user,
      session: data.session,
    };
  }

  /**
   * Logout user (sign out from Supabase)
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("User not found");
    }

    return {
      id: data.user.id,
      email: data.user.email || "",
      firstName: data.user.user_metadata?.firstName as string | undefined,
      lastName: data.user.user_metadata?.lastName as string | undefined,
      createdAt: new Date(data.user.created_at || new Date()),
      updatedAt: new Date(data.user.updated_at || new Date()),
    };
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<any> {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  }
}

export default new AuthService();
