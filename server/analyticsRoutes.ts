import type { Express } from "express";
import { storage } from "./storage";

export function registerAnalyticsRoutes(app: Express) {
  // Endpoint para métricas em tempo real
  app.get("/api/analytics/realtime-metrics", async (req, res) => {
    try {
      // Simular dados de métricas em tempo real
      // Em produção, estes dados viriam de consultas ao banco de dados
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      // Calcular métricas atuais (mês corrente)
      const currentMetrics = await calculateMetrics(currentYear, currentMonth);
      
      // Calcular métricas anteriores (mês anterior)
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const previousMetrics = await calculateMetrics(previousYear, previousMonth);
      
      // Calcular variações percentuais
      const metrics = {
        revenue: {
          current: currentMetrics.revenue,
          previous: previousMetrics.revenue,
          change: calculatePercentChange(previousMetrics.revenue, currentMetrics.revenue)
        },
        costs: {
          current: currentMetrics.costs,
          previous: previousMetrics.costs,
          change: calculatePercentChange(previousMetrics.costs, currentMetrics.costs)
        },
        profit: {
          current: currentMetrics.profit,
          previous: previousMetrics.profit,
          change: calculatePercentChange(previousMetrics.profit, currentMetrics.profit)
        },
        margin: {
          current: currentMetrics.margin,
          previous: previousMetrics.margin,
          change: calculatePercentChange(previousMetrics.margin, currentMetrics.margin)
        }
      };

      res.json(metrics);
    } catch (error) {
      console.error("Erro ao buscar métricas em tempo real:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Endpoint para dados dos gráficos
  app.get("/api/analytics/chart-data", async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      
      // Tendência mensal (últimos 12 meses)
      const monthlyTrend = await generateMonthlyTrend(currentYear);
      
      // Distribuição de contratos
      const contractDistribution = await generateContractDistribution();
      
      // Performance por categoria
      const categoryPerformance = await generateCategoryPerformance(currentYear);
      
      // Evolução de KPIs (últimos 6 meses)
      const kpiTrend = await generateKPITrend(currentYear);

      const chartData = {
        monthlyTrend,
        contractDistribution,
        categoryPerformance,
        kpiTrend
      };

      res.json(chartData);
    } catch (error) {
      console.error("Erro ao buscar dados dos gráficos:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
}

// Funções auxiliares
async function calculateMetrics(year: number, month: number) {
  try {
    // Em um ambiente real, estas consultas seriam feitas no banco de dados
    // Por enquanto, vamos gerar dados simulados mais realistas
    
    const baseRevenue = 450000 + Math.random() * 100000; // Entre 450k e 550k
    const baseCosts = baseRevenue * (0.65 + Math.random() * 0.15); // Entre 65% e 80% da receita
    
    const revenue = baseRevenue * (1 + (Math.random() - 0.5) * 0.2); // Variação de ±10%
    const costs = baseCosts * (1 + (Math.random() - 0.5) * 0.15); // Variação de ±7.5%
    const profit = revenue - costs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue: Math.round(revenue),
      costs: Math.round(costs),
      profit: Math.round(profit),
      margin: Math.round(margin * 100) / 100
    };
  } catch (error) {
    // Dados fallback
    return {
      revenue: 500000,
      costs: 350000,
      profit: 150000,
      margin: 30.0
    };
  }
}

function calculatePercentChange(previous: number, current: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

async function generateMonthlyTrend(year: number) {
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];
  
  const data = [];
  
  for (let i = 0; i < 12; i++) {
    const baseRevenue = 400000 + Math.random() * 200000;
    const baseCosts = baseRevenue * (0.6 + Math.random() * 0.2);
    
    data.push({
      month: months[i],
      receita: Math.round(baseRevenue),
      custos: Math.round(baseCosts),
      lucro: Math.round(baseRevenue - baseCosts)
    });
  }
  
  return data;
}

async function generateContractDistribution() {
  const contracts = [
    { name: "Shopping Curitiba", value: 180000 },
    { name: "Hospital São Lucas", value: 150000 },
    { name: "Universidade Federal", value: 120000 },
    { name: "Centro Empresarial", value: 95000 },
    { name: "Outros", value: 85000 }
  ];
  
  const total = contracts.reduce((sum, contract) => sum + contract.value, 0);
  
  return contracts.map(contract => ({
    ...contract,
    percentage: Math.round((contract.value / total) * 100 * 10) / 10
  }));
}

async function generateCategoryPerformance(year: number) {
  const categories = [
    "Limpeza", "Segurança", "Manutenção", 
    "Jardinagem", "Recepção", "TI"
  ];
  
  return categories.map(category => {
    const budget = 50000 + Math.random() * 100000;
    const actual = budget * (0.8 + Math.random() * 0.4); // Entre 80% e 120% do orçado
    
    return {
      category,
      budget: Math.round(budget),
      actual: Math.round(actual),
      variance: Math.round(((actual - budget) / budget) * 100 * 10) / 10
    };
  });
}

async function generateKPITrend(year: number) {
  const data = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 5);
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    
    data.push({
      date: date.toLocaleDateString('pt-BR', { month: 'short' }),
      margem: Math.round((25 + Math.random() * 15) * 10) / 10, // Entre 25% e 40%
      roi: Math.round((15 + Math.random() * 20) * 10) / 10, // Entre 15% e 35%
      eficiencia: Math.round((70 + Math.random() * 25) * 10) / 10 // Entre 70% e 95%
    });
  }
  
  return data;
}