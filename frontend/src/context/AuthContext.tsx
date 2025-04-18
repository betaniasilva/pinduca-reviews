'use client';

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback
} from 'react';
import { useRouter } from 'next/navigation';
import { UsuarioRelacionado } from '@/types';
import { toast } from 'sonner'; 

interface AuthContextType {
  isLoggedIn: boolean;
  user: UsuarioRelacionado | null; 
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: UsuarioRelacionado) => void; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UsuarioRelacionado | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');
      if (storedToken && storedUser) {
        console.log('AuthProvider: Encontrado token/user no localStorage.');
        const parsedUser: UsuarioRelacionado = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser.id === 'number' && typeof parsedUser.nome === 'string') {
             setUser(parsedUser);
             setToken(storedToken);
        } else {
             console.warn('AuthProvider: Dados de usuário no localStorage parecem inválidos.');
             localStorage.removeItem('authToken');
             localStorage.removeItem('authUser');
        }
      } else {
         console.log('AuthProvider: Nenhum token/user no localStorage.');
      }
    } catch (error) {
      console.error('AuthProvider: Erro ao carregar dados do localStorage', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    } finally {
       setIsLoading(false);
    }
  }, []);


  const login = useCallback((newToken: string, userData: UsuarioRelacionado) => {
    if (!userData || typeof userData.id !== 'number' || typeof userData.nome !== 'string') {
        console.error("AuthProvider: Tentativa de login com dados de usuário inválidos", userData);
        toast.error("Erro interno: Dados de usuário inválidos recebidos."); 
        return;
    }
    console.log('AuthProvider: Efetuando login', userData);
    setToken(newToken);
    setUser(userData); 
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    console.log('AuthProvider: Efetuando logout');
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    router.push('/');
  }, [router]);

  const isLoggedIn = !!token && !!user;
  console.log('[AuthProvider] Renderizando Provider com State:', { isLoggedIn, user: user ? {id: user.id, nome: user.nome} : null, token: token ? '...' : null, isLoading }); 

  const value = { isLoggedIn, user, token, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};