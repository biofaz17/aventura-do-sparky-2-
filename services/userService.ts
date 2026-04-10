
import { UserProfile } from '../types';

/**
 * Service to handle user-related API calls to the backend.
 * This replaces direct Supabase calls in the frontend for better security.
 */
export const userService = {
  /**
   * Fetches all users (Admin only)
   */
  async getAllUsers(): Promise<any[]> {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return data.users || [];
  },

  /**
   * Fetches a single user by username (for login)
   */
  async getUserByUsername(username: string): Promise<any | null> {
    const response = await fetch(`/api/users`);
    if (!response.ok) throw new Error('Failed to fetch users for login');
    const data = await response.json();
    const users = data.users || [];
    return users.find((u: any) => u.username === username) || null;
  },

  /**
   * Updates a user's profile data
   */
  async updateUser(userId: string, updates: any): Promise<any> {
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, ...updates }), // Spread updates to match API expectation
    });
    if (!response.ok) throw new Error('Failed to update user');
    return await response.json();
  },

  /**
   * Creates a new user
   */
  async createUser(userData: any): Promise<any> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create user');
    }
    return await response.json();
  },

  /**
   * Deletes a user
   */
  async deleteUser(userId: string): Promise<any> {
    const response = await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId }),
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return await response.json();
  },

  /**
   * Checks subscription status for a user
   */
  async checkSubscription(userId: string): Promise<string> {
    const response = await fetch(`/api/users`);
    if (!response.ok) throw new Error('Failed to check subscription');
    const data = await response.json();
    const user = (data.users || []).find((u: any) => u.id === userId);
    
    // Check if subscription was passed in base record or inside profile_data
    if (user?.profile_data?.subscription) return user.profile_data.subscription;
    return user?.subscription || 'FREE';
  }
};
