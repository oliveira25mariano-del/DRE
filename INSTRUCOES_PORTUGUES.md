# Sistema DRE - Instruções em Português

## Como usar o Replit em Português

### 1. Configuração do Idioma
Para configurar o Replit em português:
1. Clique no seu avatar (foto de perfil) no canto superior direito
2. Vá em "Account" (Conta)  
3. Em "Settings" (Configurações), procure "Language" (Idioma)
4. Selecione "Português (Brasil)" se disponível

### 2. Navegação Principal do Sistema DRE

#### Abas Disponíveis:
- **Dashboard** - Painel Principal com métricas e KPIs
- **Contratos** - Gestão de contratos por cliente
- **Glosas** - Gestão de glosas médicas e rejeições
- **Mão de obra extra** - Gestão de pessoal adicional (funcionários por contrato)
- **Fringe** - Benefícios adicionais dos funcionários
- **Previsões ML** - Análises preditivas com Machine Learning
- **Auditoria** - Trilha de mudanças e logs do sistema
- **Alertas** - Central de notificações e avisos
- **Relatórios** - Geração e aprovação de relatórios

### 3. Funcionalidades Principais

#### Dashboard
- Visualização de receitas totais
- Custos mensais por contrato
- Margem de lucro em tempo real
- Contratos ativos
- Gráficos DRE interativos

#### Contratos
- Cadastro de novos contratos
- Edição de valores mensais
- Categorização por tipo de serviço
- Status de contratos (Ativo, Suspenso, Finalizado)
- Tags personalizáveis

#### Glosas
- Registro de glosas por contrato
- Valores rejeitados
- Status de resolução
- Motivos de glosa
- Histórico completo

#### MOE (Mão de Obra Efetiva)
- Cadastro de funcionários por contrato
- Salário base e taxa de fringe
- Horas trabalhadas vs. taxa horária
- Cálculos automáticos de custos
- Status ativo/inativo

#### Fringe Benefits
- Cálculo automático de benefícios
- Visualização por funcionário
- Totais por contrato
- Análise de custos adicionais

### 4. Comandos Úteis no Replit

#### Terminal (Console)
- `npm run dev` - Iniciar o servidor de desenvolvimento
- `Ctrl + C` - Parar o servidor
- `clear` - Limpar o terminal

#### Atalhos de Teclado
- `Ctrl + S` - Salvar arquivo
- `Ctrl + F` - Buscar no arquivo
- `Ctrl + Shift + P` - Abrir paleta de comandos
- `Ctrl + \`` - Abrir/fechar terminal

### 5. Estrutura do Projeto

```
Sistema DRE/
├── client/           # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── hooks/       # Hooks personalizados
│   │   └── lib/         # Utilitários
├── server/           # Backend (Express + TypeScript)
├── shared/           # Tipos compartilhados
└── package.json      # Dependências do projeto
```

### 6. Como Adicionar Novos Dados

#### Novo Contrato:
1. Vá na aba "Contratos"
2. Clique em "Novo Contrato"
3. Preencha os campos obrigatórios:
   - Nome do contrato
   - Cliente
   - Categoria
   - Valor mensal
   - Data de início
4. Clique em "Salvar"

#### Nova Glosa:
1. Vá na aba "Glosas"
2. Clique em "Nova Glosa"
3. Selecione o contrato
4. Informe valor e motivo
5. Clique em "Salvar"

#### Novo Funcionário (MOE):
1. Vá na aba "MOE"
2. Clique em "Novo Funcionário"
3. Preencha os dados pessoais
4. Selecione o contrato
5. Informe salário e taxa de fringe
6. Clique em "Salvar"

### 7. Troubleshooting (Resolução de Problemas)

#### Se a aplicação não carregar:
1. Verifique se o servidor está rodando (`npm run dev`)
2. Atualize a página (F5)
3. Limpe o cache do navegador (Ctrl + Shift + R)

#### Se aparecerem erros:
1. Verifique o Console do navegador (F12)
2. Olhe os logs no terminal do Replit
3. Reinicie o servidor (Ctrl + C e depois `npm run dev`)

### 8. Características do Fundo Azul

O sistema utiliza um tema azul profissional com:
- **Cor principal**: Azul escuro (#1e3a8a)
- **Efeito vidro**: Transparência sutil nos cards
- **Gradientes**: Transições suaves entre tons
- **Contraste**: Texto branco sobre fundo azul
- **Sombras**: Efeitos de profundidade nos elementos

### 9. Recursos Avançados

#### Machine Learning:
- Previsões automáticas de receita
- Análise de tendências
- Alertas inteligentes baseados em padrões

#### Sistema de Auditoria:
- Rastreamento completo de mudanças
- Log de usuários e operações
- Histórico detalhado com timestamps

#### Relatórios Automáticos:
- Geração programada
- Aprovação em workflow
- Envio por email e WhatsApp

### 10. Suporte

Para dúvidas ou problemas:
- Consulte os logs de auditoria para rastrear mudanças
- Use o sistema de alertas para monitorar problemas
- Verifique os relatórios gerados automaticamente

---

## Glossário de Termos

- **DRE**: Demonstrativo do Resultado do Exercício
- **Glosa**: Valor rejeitado ou não pago pelo cliente
- **MOE**: Mão de Obra Efetiva
- **Fringe**: Benefícios adicionais aos salários
- **KPI**: Indicadores-chave de Performance
- **ML**: Machine Learning (Aprendizado de Máquina)