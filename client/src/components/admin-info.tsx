import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Eye, Info } from "lucide-react";

export default function AdminInfo() {
  return (
    <Card className="glass-effect border-blue-200/20 mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Como Acessar o Painel Administrativo
        </CardTitle>
        <CardDescription className="text-gray-300">
          Instruções para acesso seguro ao sistema de gerenciamento de usuários
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-800/30 p-4 rounded-lg border border-blue-600/30">
          <h3 className="text-white font-medium mb-2 flex items-center">
            <Key className="w-4 h-4 mr-2 text-yellow-400" />
            Atalho Secreto
          </h3>
          <p className="text-blue-100 text-sm">
            Pressione <Badge variant="secondary" className="mx-1">Ctrl</Badge> + 
            <Badge variant="secondary" className="mx-1">Alt</Badge> + 
            <Badge variant="secondary" className="mx-1">A</Badge> em qualquer tela do sistema
          </p>
          <p className="text-blue-100 text-xs mt-1 opacity-75">
            (Verifique o console do navegador se não funcionar)
          </p>
        </div>

        <div className="bg-green-800/30 p-4 rounded-lg border border-green-600/30">
          <h3 className="text-white font-medium mb-2 flex items-center">
            <Shield className="w-4 h-4 mr-2 text-green-400" />
            URL Direta (Oculta)
          </h3>
          <p className="text-green-100 text-sm">
            Acesse diretamente: <code className="bg-green-900/50 px-2 py-1 rounded text-green-200">/admin-panel-secreto</code>
          </p>
        </div>

        <div className="bg-yellow-800/30 p-4 rounded-lg border border-yellow-600/30">
          <h3 className="text-white font-medium mb-2 flex items-center">
            <Eye className="w-4 h-4 mr-2 text-yellow-400" />
            Tipos de Permissão
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">Edição Completa</Badge>
              <span className="text-yellow-100">Pode criar, editar e excluir dados</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-600">Somente Visualização</Badge>
              <span className="text-yellow-100">Apenas visualizar dados, sem edição</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 mt-4 p-3 bg-slate-800/50 rounded border">
          <strong>Nota de Segurança:</strong> O painel administrativo é oculto por questões de segurança. 
          Apenas administradores com conhecimento específico devem ter acesso a estas funcionalidades.
        </div>
      </CardContent>
    </Card>
  );
}