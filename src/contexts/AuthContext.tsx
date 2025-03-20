
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<string | null>(null);
  const navigate = useNavigate();

  // Ao iniciar, verifica se há uma sessão ativa
  useEffect(() => {
    const storedUser = localStorage.getItem("btg-user");
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  // Função para simular autenticação com winbind
  // Em produção, isso seria substituído por uma chamada a um backend
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Simulação de verificação - em produção, isso seria uma chamada de API
      // que verificaria as credenciais contra o Winbind
      if (username && password) {
        // Verificação de domínio BTG Pactual
        if (!username.includes("@") && !username.includes("\\")) {
          username = `${username}@pactual.net`;
        }
        
        // Simular atraso de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUser(username);
        setIsAuthenticated(true);
        localStorage.setItem("btg-user", username);
        toast.success(`Bem-vindo, ${username.split("@")[0]}`);
        return true;
      }
      
      throw new Error("Credenciais inválidas");
    } catch (error) {
      console.error("Erro de autenticação:", error);
      toast.error("Falha na autenticação. Verifique suas credenciais.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("btg-user");
    navigate("/login");
    toast.info("Você foi desconectado");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
