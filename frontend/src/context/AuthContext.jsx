import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    // Load state from local storage for persistence
    const storedUser = localStorage.getItem('user');
    const storedCompany = localStorage.getItem('company');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCompany) setCompany(JSON.parse(storedCompany));
  }, []);

  const login = (email, password) => {
    // Mocking an admin user login if nothing in localStorage
    const savedCompany = localStorage.getItem('company');
    
    // Create new admin if no company exists
    if (!savedCompany && email.includes('admin')) {
      return { err: "Company not found. Please sign up." };
    }

    const mUser = {
      id: 1,
      email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'Admin' : (email.includes('manager') ? 'Manager' : 'Employee')
    };

    setUser(mUser);
    localStorage.setItem('user', JSON.stringify(mUser));
    return true;
  };

  const signup = async (email, password, companyName, country) => {
    try {
      // Fetch country details to get currency
      let baseCurrency = "USD"; // Default
      if (country) {
        const res = await fetch(`https://restcountries.com/v3.1/name/${country}?fullText=true&fields=name,currencies`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0 && data[0].currencies) {
            baseCurrency = Object.keys(data[0].currencies)[0];
          }
        }
      }

      const newCompany = {
        name: companyName,
        baseCurrency,
        country
      };
      
      const adminUser = {
        id: 1,
        email,
        name: email.split('@')[0],
        role: 'Admin'
      };

      setCompany(newCompany);
      setUser(adminUser);

      localStorage.setItem('company', JSON.stringify(newCompany));
      localStorage.setItem('user', JSON.stringify(adminUser));
      
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { err: "Failed to fetch country details." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, company, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
