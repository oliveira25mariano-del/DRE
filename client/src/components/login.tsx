import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import opusLogo from "@assets/Logo-Grupo-Opus_1754948245317.png";

interface LoginProps {
  onLogin: (userData: { name: string; role: string; photo?: string; id: string; email: string }) => void;
  onSwitchToRegister?: () => void;
}

export default function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        toast({
          title: "Erro no login",
          description: "Por favor, preencha todos os campos.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Chamar API de autenticação
      const response = await apiRequest("POST", "/api/admin/authenticate", { email, password });

      const userData = {
        id: response.id,
        name: `${response.firstName} ${response.lastName}`,
        role: response.role,
        email: response.email,
        photo: undefined
      };

      toast({
        title: "Login realizado!",
        description: `Bem-vindo(a), ${userData.name}!`,
      });

      onLogin(userData);
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: error.message || "Email ou senha incorretos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={opusLogo} 
              alt="Grupo Opus" 
              className="h-16 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-2xl">Sistema DRE</CardTitle>
            <CardDescription>
              Faça login para acessar o sistema de gestão financeira
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          


        </CardContent>
      </Card>
    </div>
  );
}