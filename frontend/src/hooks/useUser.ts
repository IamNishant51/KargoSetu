import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

export interface User {
  id: string;
  email: string;
  name: string | null;
  googleId: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useUser() {
  // Read once per render so the query key tracks the active session —
  // a different token after re-login can never reuse the old user's cache.
  const token = typeof window !== "undefined" ? Cookies.get("auth_token") : undefined;
  return useQuery<User>({
    queryKey: ["user", token ?? null],
    queryFn: async () => {
      const token = Cookies.get("auth_token");
      if (!token) {
        throw new Error("No token found");
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      
      return res.json();
    },
    // Don't retry if it fails (e.g., due to invalid token)
    retry: false,
    // Only run this query if the token actually exists in cookies
    enabled: !!token,
  });
}
