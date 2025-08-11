# 📝 Guia Prático: Como Cadastrar Informações no Sistema DRE

## 🎯 Visão Geral
Este guia mostra como adicionar dados no sistema, passo a passo, de forma simples e prática.

---

## 📄 1. CADASTRAR CONTRATOS

### Passo a Passo:
1. **Clique na aba "Contratos"** no menu lateral azul
2. **Clique no botão "Novo Contrato"** (botão azul com ícone +)
3. **Preencha os campos obrigatórios:**

#### Campos Principais:
- **Nome do Contrato**: Ex: "Desenvolvimento Sistema ABC"
- **Cliente**: Ex: "Empresa XYZ Ltda"
- **Categoria**: Escolha entre:
  - Desenvolvimento
  - Consultoria  
  - Suporte
- **Valor Mensal**: Ex: "15000" (sem pontos ou vírgulas)
- **Valor Total**: Ex: "180000"
- **Data de Início**: Selecione no calendário
- **Data de Fim**: Selecione no calendário

#### Campos Opcionais:
- **Contato**: Ex: "João Silva - joao@empresa.com"
- **Descrição**: Ex: "Sistema de gestão financeira com módulos de contratos e relatórios"
- **Status**: Ativo (já vem selecionado)
- **Tags**: Ex: "desenvolvimento, web, sistema" (separadas por vírgula)

4. **Clique em "Salvar"**
5. ✅ **Contrato criado com sucesso!**

---

## ⚠️ 2. CADASTRAR GLOSAS

### Pré-requisito:
- Já ter pelo menos 1 contrato cadastrado

### Passo a Passo:
1. **Vá na aba "Glosas"**
2. **Clique em "Nova Glosa"**
3. **Preencha os dados:**

#### Informações da Glosa:
- **Contrato**: Selecione da lista de contratos
- **Data**: Quando a glosa foi identificada
- **Valor**: Ex: "2500" (valor rejeitado)
- **Status**: Escolha entre:
  - Pendente
  - Resolvido
  - Cancelado
- **Motivo**: Ex: "Documentação incompleta entregue"

4. **Clique em "Salvar"**
5. ✅ **Glosa registrada!**

### Exemplo Prático:
```
Contrato: Desenvolvimento Sistema ABC
Data: 15/08/2025
Valor: 2500
Status: Pendente
Motivo: Cliente rejeitou entrega por falta de documentação técnica
```

---

## 👥 3. CADASTRAR FUNCIONÁRIOS (MOE)

### Pré-requisito:
- Já ter pelo menos 1 contrato cadastrado

### Passo a Passo:
1. **Vá na aba "MOE"**
2. **Clique em "Novo Funcionário"**
3. **Preencha os dados pessoais:**

#### Informações Básicas:
- **Nome**: Ex: "Maria Santos"
- **Email**: Ex: "maria@empresa.com"
- **Cargo**: Ex: "Desenvolvedora Senior"
- **Contrato**: Selecione da lista

#### Informações Financeiras:
- **Salário Base**: Ex: "8000" (valor mensal)
- **Taxa de Fringe**: Ex: "30" (porcentagem de benefícios)
- **Horas Trabalhadas**: Ex: "160" (horas mensais)
- **Taxa Horária**: Ex: "50" (se trabalha por hora)

#### Status:
- **Ativo**: Marque se funcionário está trabalhando

4. **Clique em "Salvar"**
5. ✅ **Funcionário cadastrado!**

### Exemplo Prático:
```
Nome: Maria Santos
Email: maria@empresa.com
Cargo: Desenvolvedora Senior
Contrato: Desenvolvimento Sistema ABC
Salário Base: 8000
Taxa de Fringe: 30%
Status: Ativo
```

---

## 💰 4. VISUALIZAR FRINGE BENEFITS

### Como Funciona:
- O sistema **calcula automaticamente** os fringe benefits
- Baseado no salário + taxa de fringe de cada funcionário
- Não precisa cadastrar manualmente

### Para Visualizar:
1. **Vá na aba "Fringe Benefits"**
2. **Veja os cálculos automáticos:**
   - Salário base do funcionário
   - Taxa de fringe aplicada
   - Valor total dos benefícios
   - Total por contrato

### Exemplo de Cálculo:
```
Funcionário: Maria Santos
Salário Base: R$ 8.000
Taxa Fringe: 30%
Fringe Benefits: R$ 2.400 (8000 × 0,30)
Total Custo: R$ 10.400
```

---

## 🤖 5. PREVISÕES COM INTELIGÊNCIA ARTIFICIAL

### Como Usar:
1. **Vá na aba "Previsões ML"**
2. **Clique em "Nova Previsão"**
3. **Configure:**

#### Parâmetros:
- **Mês**: Selecione o mês para previsão
- **Ano**: Ex: 2025
- **Categoria**: Escolha o tipo:
  - Receita
  - Custos
  - Lucro
- **Métrica**: Ex: "receita_mensal"
- **Contrato**: Selecione específico ou deixe em branco para geral

4. **Clique em "Gerar Previsão"**
5. ✅ **Sistema criará previsão automática!**

---

## 🔔 6. CRIAR ALERTAS PERSONALIZADOS

### Passo a Passo:
1. **Vá na aba "Alertas"**
2. **Clique em "Novo Alerta"**
3. **Configure:**

#### Informações do Alerta:
- **Título**: Ex: "Glosa Pendente - Cliente XYZ"
- **Mensagem**: Ex: "Glosa de R$ 2.500 aguardando resolução há 15 dias"
- **Severidade**: Escolha:
  - Info (azul)
  - Aviso (amarelo)  
  - Crítico (vermelho)
  - Sucesso (verde)
- **Contrato**: Opcional, para alertas específicos

4. **Clique em "Criar Alerta"**
5. ✅ **Alerta criado!**

---

## 📋 7. GERAR RELATÓRIOS AUTOMÁTICOS

### Passo a Passo:
1. **Vá na aba "Relatórios"**
2. **Clique em "Novo Relatório"**
3. **Configure nas 3 abas:**

#### Aba "Básico":
- **Nome**: Ex: "DRE Mensal - Agosto 2025"
- **Tipo**: Escolha:
  - DRE
  - Contratos
  - Glosas
  - MOE
  - Fringe Benefits
- **Destinatários**: Ex: "diretor@empresa.com, gestor@empresa.com"

#### Aba "Agendamento":
- **Frequência**: Escolha:
  - Manual
  - Diário
  - Semanal
  - Mensal
  - Trimestral

#### Aba "Entrega":
- **Formato**: Excel ou PDF
- **Envio**: Email e/ou WhatsApp

4. **Clique em "Criar Relatório"**
5. ✅ **Relatório configurado!**

---

## 🔍 8. ACOMPANHAR AUDITORIA

### Como Funciona:
- **Sistema grava automaticamente** todas as mudanças
- Não precisa cadastrar nada manualmente
- Apenas consulte quando necessário

### Para Consultar:
1. **Vá na aba "Auditoria"**
2. **Use os filtros:**
   - Buscar por texto
   - Filtrar por tabela
   - Filtrar por operação (Criação, Edição, Exclusão)
   - Filtrar por usuário

3. **Clique no ícone "olho" para ver detalhes**
4. ✅ **Veja histórico completo de mudanças!**

---

## 🎯 9. SEQUÊNCIA RECOMENDADA DE CADASTRO

### Para começar do zero:

#### 1º Passo: **Contratos**
- Cadastre todos os seus contratos principais
- Defina valores e datas corretos

#### 2º Passo: **Funcionários (MOE)**  
- Adicione funcionários em cada contrato
- Configure salários e fringe corretos

#### 3º Passo: **Glosas** (se houver)
- Registre glosas pendentes ou resolvidas
- Mantenha histórico atualizado

#### 4º Passo: **Alertas**
- Configure alertas para situações críticas
- Monitore glosas e prazos

#### 5º Passo: **Relatórios**
- Configure relatórios automáticos
- Defina frequência de envio

#### 6º Passo: **Previsões**
- Gere previsões baseadas nos dados
- Acompanhe tendências futuras

---

## ✅ 10. DICAS IMPORTANTES

### Valores Monetários:
- **Digite apenas números**: Ex: "15000" ao invés de "R$ 15.000,00"
- **Sistema formata automaticamente** na tela
- **Use ponto para decimais**: Ex: "15000.50"

### Datas:
- **Use o calendário** sempre que possível
- **Sistema aceita formato brasileiro**: dd/mm/aaaa
- **Data de início** deve ser anterior à data fim

### Campos Obrigatórios:
- Campos com **asterisco (*)** são obrigatórios
- Sistema **não permite salvar** sem preencher
- **Mensagem de erro** aparece em vermelho

### Filtros e Buscas:
- **Todos os filtros se combinam** (busca + categoria + status)
- **"Todas as categorias"** mostra todos os registros
- **Campo de busca** procura em nome e cliente

---

## 🚀 Exemplos Práticos Completos

### Exemplo 1: Empresa de Desenvolvimento
```
CONTRATO:
Nome: Desenvolvimento E-commerce
Cliente: Loja ABC Ltda
Categoria: Desenvolvimento
Valor Mensal: 25000
Valor Total: 300000
Início: 01/01/2025
Fim: 31/12/2025

FUNCIONÁRIO:
Nome: Pedro Silva
Email: pedro@empresa.com
Cargo: Desenvolvedor Full Stack
Salário: 9000
Fringe: 35%
Horas: 160

GLOSA (se houver):
Data: 15/08/2025
Valor: 3000
Motivo: Atraso na entrega do módulo de pagamentos
Status: Pendente
```

### Exemplo 2: Consultoria Empresarial
```
CONTRATO:
Nome: Consultoria Financeira
Cliente: Indústria DEF S.A.
Categoria: Consultoria
Valor Mensal: 12000
Valor Total: 144000
Início: 01/03/2025
Fim: 28/02/2026

FUNCIONÁRIO:
Nome: Ana Costa
Email: ana@empresa.com  
Cargo: Consultora Senior
Salário: 7500
Fringe: 25%
Horas: 120
```

---

## 🎉 Pronto para Começar!

Agora você sabe exatamente como cadastrar todas as informações no Sistema DRE:

✅ **Contratos** - Base do sistema
✅ **Funcionários** - Custos de pessoal  
✅ **Glosas** - Controle de rejeições
✅ **Alertas** - Monitoramento ativo
✅ **Relatórios** - Documentação automática
✅ **Previsões** - Planejamento futuro

**Comece cadastrando seus contratos e vá adicionando os demais dados aos poucos!**

**Dúvidas?** Consulte a seção de Auditoria para ver o histórico de tudo que foi cadastrado.