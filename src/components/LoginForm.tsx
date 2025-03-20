
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitBranch, User, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", username);
      const success = await login(username, password);
      if (success) {
        navigate("/");
      } else {
        toast.error("Falha no login. Verifique suas credenciais.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro ao tentar fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/lovable-uploads/f245d207-cc2a-4754-a764-386822375a3e.png" 
            alt="BTG Pactual Logo" 
            className="h-20 w-auto"
          />
        </div>
        <h1 className="text-2xl font-semibold">Autenticação de Domínio</h1>
        <p className="text-muted-foreground mt-2">
          Utilize suas credenciais do domínio BTG Pactual
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Usuário</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              placeholder="nome.sobrenome ou nome.sobrenome@pactual.net"
              className="pl-10"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Utilize seu nome de usuário do domínio
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Sua senha de domínio"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full gap-2" disabled={isLoading}>
          {isLoading ? "Autenticando..." : "Entrar"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>
      
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <GitBranch className="h-4 w-4" />
          <span>Autenticação integrada com Winbind</span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
