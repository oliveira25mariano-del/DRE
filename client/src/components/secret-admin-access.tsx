import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function SecretAdminAccess() {
  const [keys, setKeys] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Sequência secreta para acessar painel administrativo
  const secretSequence = ["Control", "Shift", "a", "d", "m", "i", "n"];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      
      // Adicionar tecla pressionada à sequência
      setKeys(prev => {
        const newKeys = [...prev, key].slice(-7); // Manter apenas as últimas 7 teclas
        
        // Verificar se a sequência secreta foi digitada
        const isMatch = secretSequence.every((secretKey, index) => 
          newKeys[index] === secretKey
        );

        if (isMatch && newKeys.length === secretSequence.length) {
          // Acesso liberado - redirecionar para painel administrativo
          toast({
            title: "🔐 Acesso Administrativo Autorizado",
            description: "Redirecionando para painel secreto...",
            duration: 2000,
          });

          setTimeout(() => {
            setLocation("/admin-panel-secreto");
          }, 1000);

          return []; // Resetar sequência
        }

        return newKeys;
      });

      // Reset da sequência após 3 segundos de inatividade
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setKeys([]);
      }, 3000);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeout);
    };
  }, [setLocation, toast]);

  // Componente invisível - apenas escuta as teclas
  return null;
}

// Hook alternativo para acesso via combinação simples
export function useAdminShortcut() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Windows + M = Painel Administrativo
      if (event.metaKey && event.key === 'm') {
        event.preventDefault();
        
        toast({
          title: "🔐 Painel Administrativo",
          description: "Acesso secreto autorizado",
          duration: 1500,
        });

        setTimeout(() => {
          setLocation("/admin-panel-secreto");
        }, 500);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setLocation, toast]);
}