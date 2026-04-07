import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, User } from '@/src/lib/firebase';
import { api } from '@/src/lib/api';

interface Profile {
  uid: string;
  email: string;
  display_name: string;
  phone_number: string;
  photo_url: string;
  bio: string;
  location: string;
  joined: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  refreshProfile: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    console.log(`[AuthProvider] Attempting to fetch profile for UID: ${uid}`);
    try {
      // First, ensure the server is actually ready to handle requests
      const isReady = await api.ping();
      if (!isReady) {
        console.warn(`[AuthProvider] Server not ready after pings, profile fetch might fail for UID: ${uid}`);
      }
      
      const data = await api.getProfile(uid);
      console.log(`[AuthProvider] Profile fetch successful for UID: ${uid}`);
      setProfile(data);
    } catch (err) {
      console.error(`[AuthProvider] Error fetching profile for UID: ${uid}:`, err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch profile in background, don't block loading state
        fetchProfile(user.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {loading ? (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/50 font-mono text-xs uppercase tracking-widest animate-pulse">
              Initializing Session...
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
