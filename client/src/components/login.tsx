import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Lock } from "lucide-react";
import opusLogo from "@assets/Logo-Grupo-Opus_1754948245317.png";

interface LoginProps {
  onLogin: (userData: { name: string; role: string; photo?: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular autenticação
    setTimeout(() => {
      if (email && password) {
        // Determinar dados do usuário baseado no email
        let userData;
        if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('joao')) {
          userData = {
            name: "João Silva",
            role: "Administrador",
            photo: null
          };
        } else if (email.toLowerCase().includes('maria')) {
          userData = {
            name: "Maria Santos",
            role: "Administradora",
            photo: null
          };
        } else if (email.toLowerCase().includes('pedro')) {
          userData = {
            name: "Pedro Oliveira",
            role: "Administrador",
            photo: null
          };
        } else if (email.toLowerCase().includes('ana')) {
          userData = {
            name: "Ana Costa",
            role: "Administradora",
            photo: null
          };
        } else if (email.toLowerCase().includes('carlos')) {
          userData = {
            name: "Carlos Mendes",
            role: "Administrador",
            photo: null
          };
        } else {
          // Extrair nome do email e criar nome completo
          const emailName = email.split('@')[0];
          const firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          const lastName = "Silva"; // Sobrenome padrão
          userData = {
            name: `${firstName} ${lastName}`,
            role: "Administrador",
            photo: null
          };
        }
        
        // Garantir que os dados estão corretos
        console.log('Dados do usuário no login:', userData);
        
        onLogin(userData);
        toast({
          title: "Login realizado",
          description: `Bem-vindo, ${userData.name}!`,
        });
      } else {
        toast({
          title: "Erro no login",
          description: "Por favor, preencha todos os campos.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
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
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              Demo - Use qualquer email e senha
            </p>
            <div className="text-xs text-blue-600 dark:text-blue-300 mt-2 space-y-1">
              <p><strong>Exemplos:</strong></p>
              <p>• admin@opus.com → João Silva (Administrador)</p>
              <p>• maria@opus.com → Maria Santos (Administradora)</p>
              <p>• pedro@opus.com → Pedro Oliveira (Administrador)</p>
              <p>• ana@opus.com → Ana Costa (Administradora)</p>
              <p>• carlos@opus.com → Carlos Mendes (Administrador)</p>
              <p className="mt-2">Nome e foto aparecem automaticamente no header após login</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}