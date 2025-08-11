import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContractSchema, type InsertContract } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CalendarIcon, ChevronDown, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Função para formatar valor monetário
const formatCurrency = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')
  
  // Se vazio, retorna vazio
  if (!numbers) return ''
  
  // Converte para centavos
  const cents = parseInt(numbers)
  
  // Formata o valor
  const reais = Math.floor(cents / 100)
  const centavos = cents % 100
  
  // Adiciona pontos para separar milhares
  const formattedReais = reais.toLocaleString('pt-BR')
  
  // Retorna com vírgula para centavos
  return `${formattedReais},${centavos.toString().padStart(2, '0')}`
}

// Função para converter valor formatado para número
const parseCurrency = (value: string): number => {
  if (!value) return 0
  // Remove pontos (separadores de milhares) e substitui vírgula por ponto
  const cleanValue = value.replace(/\./g, '').replace(',', '.')
  return parseFloat(cleanValue) || 0
}

interface ContractFormProps {
  onSubmit: (data: InsertContract) => void;
  onCancel?: () => void;
  defaultValues?: Partial<InsertContract>;
  isLoading?: boolean;
}

export default function ContractForm({ onSubmit, onCancel, defaultValues, isLoading }: ContractFormProps) {
  const [showAdditionalContract, setShowAdditionalContract] = useState(false);
  const [monthlyValueFormatted, setMonthlyValueFormatted] = useState("");
  const [totalValueFormatted, setTotalValueFormatted] = useState("");
  const [monthlyValue2Formatted, setMonthlyValue2Formatted] = useState("");
  const [totalValue2Formatted, setTotalValue2Formatted] = useState("");
  
  const form = useForm<InsertContract>({
    resolver: zodResolver(insertContractSchema),
    defaultValues: {
      name: "",
      description: "",
      client: "",
      contact: "",
      category: "",
      status: "active",
      monthlyValue: "0",
      totalValue: "0",
      startDate: new Date(),
      tags: [],
      categories: [],
      monthlyValues: {},
      totalValues: {},
      ...defaultValues,
    },
  });

  const handleFormSubmit = (data: InsertContract) => {
    // Combinar valores principais com valores adicionais se existirem
    const processedData = { ...data };
    
    if (showAdditionalContract) {
      const category2 = form.getValues("category2" as any);
      const monthlyValue2 = form.getValues("monthlyValue2" as any);
      const totalValue2 = form.getValues("totalValue2" as any);
      
      if (category2 && monthlyValue2 && totalValue2) {
        processedData.categories = [data.category, category2];
        processedData.monthlyValues = {
          [data.category]: data.monthlyValue,
          [category2]: monthlyValue2
        };
        processedData.totalValues = {
          [data.category]: data.totalValue,
          [category2]: totalValue2
        };
      }
    }
    
    onSubmit(processedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Nome do Contrato</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: PROJ-2024-001" 
                    className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Cliente</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nome da empresa cliente" 
                    className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Contato</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nome do contato principal" 
                    className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                      <SelectValue placeholder="Selecione uma categoria" className="text-white" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                    <SelectItem value="Consultoria">Consultoria</SelectItem>
                    <SelectItem value="Suporte">Suporte</SelectItem>
                    <SelectItem value="Manutenção e Facilities">Manutenção e Facilities</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="PMOC">PMOC</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Valor Mensal (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="text"
                    placeholder="0,00" 
                    className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                    value={monthlyValueFormatted}
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      setMonthlyValueFormatted(formatted);
                      const numericValue = parseCurrency(formatted);
                      field.onChange(numericValue.toString());
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Valor Total (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="text"
                    placeholder="0,00" 
                    className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                    value={totalValueFormatted}
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      setTotalValueFormatted(formatted);
                      const numericValue = parseCurrency(formatted);
                      field.onChange(numericValue.toString());
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-white">Data de Início</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal bg-blue-800 border-blue-600 text-white",
                          !field.value && "text-blue-300"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-white">Data de Término</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal bg-blue-800 border-blue-600 text-white",
                          !field.value && "text-blue-300"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição detalhada do contrato" 
                  className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                  rows={3}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Seção para Segundo Contrato */}
        <Collapsible open={showAdditionalContract} onOpenChange={setShowAdditionalContract}>
          <CollapsibleTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-blue-400/30 text-white hover:bg-blue-600/30 flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showAdditionalContract ? "Remover Segundo Contrato" : "Adicionar Segundo Contrato/Categoria"}
              <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform", showAdditionalContract && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-6 mt-6">
            <div className="p-4 bg-blue-600/10 rounded-lg border border-blue-400/20">
              <h3 className="text-white font-medium mb-4">Segundo Contrato/Categoria</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-white text-sm font-medium block mb-2">Segunda Categoria</label>
                  <Select onValueChange={(value) => form.setValue("category2" as any, value)}>
                    <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                      <SelectValue placeholder="Selecione categoria" className="text-white" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                      <SelectItem value="Consultoria">Consultoria</SelectItem>
                      <SelectItem value="Suporte">Suporte</SelectItem>
                      <SelectItem value="Manutenção e Facilities">Manutenção e Facilities</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="PMOC">PMOC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm font-medium block mb-2">Valor Mensal 2 (R$)</label>
                  <Input 
                    type="text"
                    placeholder="0,00"
                    className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                    value={monthlyValue2Formatted}
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      setMonthlyValue2Formatted(formatted);
                      const numericValue = parseCurrency(formatted);
                      form.setValue("monthlyValue2" as any, numericValue.toString());
                    }}
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium block mb-2">Valor Total 2 (R$)</label>
                  <Input 
                    type="text"
                    placeholder="0,00"
                    className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                    value={totalValue2Formatted}
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      setTotalValue2Formatted(formatted);
                      const numericValue = parseCurrency(formatted);
                      form.setValue("totalValue2" as any, numericValue.toString());
                    }}
                  />
                </div>
              </div>
              
              <p className="text-blue-200 text-sm mt-3">
                Use esta seção quando tiver dois tipos de contrato ou categorias diferentes para o mesmo cliente.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            className="border-blue-400/30 text-white hover:bg-blue-600/30"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? "Salvando..." : "Salvar Contrato"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
