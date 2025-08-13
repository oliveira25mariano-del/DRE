import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bot, Sparkles, Target, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

interface ResultadoCategorizacao {
  categoria: string;
  confianca: number;
  justificativa: string;
  sugestaoMelhoria?: string;
  processadoEm: string;
}

export default function IACategorizacao() {
  const { toast } = useToast();
  const [despesaForm, setDespesaForm] = useState({
    descricao: '',
    valor: '',
    fornecedor: ''
  });
  const [resultado, setResultado] = useState<ResultadoCategorizacao | null>(null);

  // Query para buscar categorias disponíveis
  const { data: categoriasData } = useQuery({
    queryKey: ['/api/ai/categorias'],
  });

  // Mutation para categorizar despesa única
  const categorizarMutation = useMutation({
    mutationFn: async (dados: any) => {
      const response = await fetch('/api/ai/categorizar-despesa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      if (!response.ok) throw new Error('Erro na categorização');
      return response.json();
    },
    onSuccess: (data) => {
      setResultado(data);
      toast({
        title: "✨ Categorização Concluída!",
        description: `Categoria sugerida: ${data.categoria} (${data.confianca}% de confiança)`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Categorização",
        description: error.message || "Falha no serviço de IA",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!despesaForm.descricao) {
      toast({
        title: "Campo Obrigatório",
        description: "Digite a descrição da despesa",
        variant: "destructive",
      });
      return;
    }

    categorizarMutation.mutate({
      descricao: despesaForm.descricao,
      valor: despesaForm.valor ? parseFloat(despesaForm.valor) : undefined,
      fornecedor: despesaForm.fornecedor || undefined
    });
  };

  const getCorConfianca = (confianca: number) => {
    if (confianca >= 90) return "bg-green-500";
    if (confianca >= 70) return "bg-blue-500";
    if (confianca >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getIconeConfianca = (confianca: number) => {
    if (confianca >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (confianca >= 70) return <Target className="w-5 h-5 text-blue-600" />;
    if (confianca >= 50) return <TrendingUp className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            IA Categorização Automática
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Classificação inteligente de despesas usando inteligência artificial
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Categorização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Testar Categorização
            </CardTitle>
            <CardDescription>
              Digite os dados da despesa para ver a sugestão da IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="descricao" className="text-sm font-medium">
                  Descrição da Despesa *
                </Label>
                <Textarea
                  id="descricao"
                  placeholder="Ex: Compra de material de escritório na Kalunga"
                  value={despesaForm.descricao}
                  onChange={(e) => setDespesaForm(prev => ({
                    ...prev,
                    descricao: e.target.value
                  }))}
                  className="mt-1"
                  data-testid="input-descricao"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor" className="text-sm font-medium">
                    Valor (opcional)
                  </Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={despesaForm.valor}
                    onChange={(e) => setDespesaForm(prev => ({
                      ...prev,
                      valor: e.target.value
                    }))}
                    className="mt-1"
                    data-testid="input-valor"
                  />
                </div>

                <div>
                  <Label htmlFor="fornecedor" className="text-sm font-medium">
                    Fornecedor (opcional)
                  </Label>
                  <Input
                    id="fornecedor"
                    placeholder="Ex: Kalunga"
                    value={despesaForm.fornecedor}
                    onChange={(e) => setDespesaForm(prev => ({
                      ...prev,
                      fornecedor: e.target.value
                    }))}
                    className="mt-1"
                    data-testid="input-fornecedor"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={categorizarMutation.isPending}
                className="w-full"
                data-testid="button-categorizar"
              >
                {categorizarMutation.isPending ? (
                  <>
                    <Bot className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Categorizar com IA
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resultado da Categorização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Resultado da Análise
            </CardTitle>
            <CardDescription>
              {resultado ? 
                `Processado em ${new Date(resultado.processadoEm).toLocaleString('pt-BR')}` :
                "Execute uma categorização para ver o resultado"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resultado ? (
              <div className="space-y-4">
                {/* Categoria e Confiança */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getIconeConfianca(resultado.confianca)}
                    <div>
                      <div className="font-semibold text-lg">
                        {resultado.categoria}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Categoria sugerida
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {resultado.confianca}% confiança
                  </Badge>
                </div>

                {/* Barra de Confiança */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Nível de Confiança</span>
                    <span className="font-medium">{resultado.confianca}%</span>
                  </div>
                  <Progress 
                    value={resultado.confianca} 
                    className="h-3"
                  />
                  <div className="text-xs text-gray-500">
                    {resultado.confianca >= 90 && "Muito alta - Recomendada automática"}
                    {resultado.confianca >= 70 && resultado.confianca < 90 && "Alta - Provável acerto"}
                    {resultado.confianca >= 50 && resultado.confianca < 70 && "Média - Revisar sugestão"}
                    {resultado.confianca < 50 && "Baixa - Categorização manual recomendada"}
                  </div>
                </div>

                {/* Justificativa */}
                <div>
                  <Label className="text-sm font-medium">Justificativa da IA:</Label>
                  <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                    {resultado.justificativa}
                  </div>
                </div>

                {/* Sugestão de Melhoria */}
                {resultado.sugestaoMelhoria && (
                  <div>
                    <Label className="text-sm font-medium">Sugestão de Melhoria:</Label>
                    <div className="mt-1 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
                      {resultado.sugestaoMelhoria}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Digite uma descrição de despesa para começar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações das Categorias */}
      {categoriasData && (categoriasData as any).total && (
        <Card>
          <CardHeader>
            <CardTitle>Categorias Disponíveis</CardTitle>
            <CardDescription>
              {(categoriasData as any).total} categorias reconhecidas pelo sistema de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(categoriasData as any).categorias?.map((categoria: string) => (
                <Badge 
                  key={categoria} 
                  variant="outline" 
                  className="text-sm"
                >
                  {categoria}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}