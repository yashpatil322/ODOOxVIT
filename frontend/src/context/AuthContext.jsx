import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedTokens = localStorage.getItem('tokens');
    
    if (storedUser && storedTokens) {
      setUser(JSON.parse(storedUser));
      setTokens(JSON.parse(storedTokens));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        return { err: "Invalid credentials." };
      }

      const data = await res.json();
      
      // We need to fetch user details using token if not provided.
      // But our default simplejwt doesn't return user details. 
      // We will perform a quick /api/users/ fetch to set user
      const userRes = await fetch('http://127.0.0.1:8000/api/users/', {
        headers: { 'Authorization': `Bearer ${data.access}` }
      });
      
      if (userRes.ok) {
        const users = await userRes.json();
        const activeUser = users.find(u => u.email === email);
        
        if (activeUser) {
          setUser(activeUser);
          setTokens(data);
          localStorage.setItem('user', JSON.stringify(activeUser));
          localStorage.setItem('tokens', JSON.stringify(data));
          return true;
        }
      }
      return { err: "User data fetch failed." };
    } catch (e) {
      console.error(e);
      return { err: "Server connection failed." };
    }
  };

  const signup = async (email, password, companyName, country) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, company_name: companyName, country })
      });

      if (!res.ok) {
        const errData = await res.json();
        return { err: errData.error || "Signup failed." };
      }

      const data = await res.json();
      setUser(data.user);
      setTokens({ access: data.access, refresh: data.refresh });
      
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('tokens', JSON.stringify({ access: data.access, refresh: data.refresh }));
      
      return { success: true };
    } catch (error) {
      console.error(error);
      return { err: "Server connection failed." };
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
  };

  return (
    <AuthContext.Provider value={{ user, tokens, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
