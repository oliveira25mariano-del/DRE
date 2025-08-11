import { 
  type Contract, type InsertContract,
  type Budget, type InsertBudget,
  type Actual, type InsertActual,
  type Employee, type InsertEmployee,
  type Glosa, type InsertGlosa,
  type Prediction, type InsertPrediction,
  type AuditLog, type InsertAuditLog,
  type Alert, type InsertAlert,
  type Report, type InsertReport,
  type Category, type InsertCategory
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Contracts
  getContracts(): Promise<Contract[]>;
  getContract(id: string): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract>;
  deleteContract(id: string): Promise<void>;

  // Budgets
  getBudgets(contractId?: string): Promise<Budget[]>;
  getBudget(id: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget>;
  deleteBudget(id: string): Promise<void>;

  // Actuals
  getActuals(contractId?: string): Promise<Actual[]>;
  getActual(id: string): Promise<Actual | undefined>;
  createActual(actual: InsertActual): Promise<Actual>;
  updateActual(id: string, actual: Partial<InsertActual>): Promise<Actual>;
  deleteActual(id: string): Promise<void>;

  // Employees
  getEmployees(contractId?: string): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;

  // Glosas
  getGlosas(contractId?: string): Promise<Glosa[]>;
  getGlosa(id: string): Promise<Glosa | undefined>;
  createGlosa(glosa: InsertGlosa): Promise<Glosa>;
  updateGlosa(id: string, glosa: Partial<InsertGlosa>): Promise<Glosa>;
  deleteGlosa(id: string): Promise<void>;

  // Predictions
  getPredictions(contractId?: string): Promise<Prediction[]>;
  getPrediction(id: string): Promise<Prediction | undefined>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  updatePrediction(id: string, prediction: Partial<InsertPrediction>): Promise<Prediction>;
  deletePrediction(id: string): Promise<void>;

  // Audit Logs
  getAuditLogs(tableName?: string, recordId?: string): Promise<AuditLog[]>;
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;

  // Alerts
  getAlerts(): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, alert: Partial<InsertAlert>): Promise<Alert>;
  deleteAlert(id: string): Promise<void>;

  // Reports
  getReports(): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, report: Partial<InsertReport>): Promise<Report>;
  deleteReport(id: string): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Analytics
  getDREData(year: number, month: number): Promise<any>;
  getKPIData(): Promise<any>;
}

export class MemStorage implements IStorage {
  private contracts: Map<string, Contract> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private actuals: Map<string, Actual> = new Map();
  private employees: Map<string, Employee> = new Map();
  private glosas: Map<string, Glosa> = new Map();
  private predictions: Map<string, Prediction> = new Map();
  private auditLogs: Map<string, AuditLog> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private reports: Map<string, Report> = new Map();
  private categories: Map<string, Category> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default categories
    const defaultCategories = [
      { name: "Desenvolvimento", description: "Projetos de desenvolvimento de software", color: "#3B82F6" },
      { name: "Consultoria", description: "Serviços de consultoria especializada", color: "#8B5CF6" },
      { name: "Suporte", description: "Suporte técnico e manutenção", color: "#F59E0B" },
      { name: "Manutenção e Facilities", description: "Serviços de manutenção e gestão de facilities", color: "#10B981" },
      { name: "Manutenção", description: "Serviços gerais de manutenção", color: "#14B8A6" },
      { name: "PMOC", description: "Plano de Manutenção, Operação e Controle", color: "#06B6D4" },
    ];

    defaultCategories.forEach(cat => {
      const id = randomUUID();
      this.categories.set(id, {
        id,
        ...cat,
        createdAt: new Date(),
      });
    });
  }

  // Contracts
  async getContracts(): Promise<Contract[]> {
    return Array.from(this.contracts.values());
  }

  async getContract(id: string): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = randomUUID();
    const contract: Contract = {
      ...insertContract,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contracts.set(id, contract);
    return contract;
  }

  async updateContract(id: string, insertContract: Partial<InsertContract>): Promise<Contract> {
    const existing = this.contracts.get(id);
    if (!existing) throw new Error("Contract not found");
    
    const updated: Contract = {
      ...existing,
      ...insertContract,
      updatedAt: new Date(),
    };
    this.contracts.set(id, updated);
    return updated;
  }

  async deleteContract(id: string): Promise<void> {
    this.contracts.delete(id);
  }

  // Budgets
  async getBudgets(contractId?: string): Promise<Budget[]> {
    const budgets = Array.from(this.budgets.values());
    return contractId ? budgets.filter(b => b.contractId === contractId) : budgets;
  }

  async getBudget(id: string): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = randomUUID();
    const budget: Budget = {
      ...insertBudget,
      id,
      createdAt: new Date(),
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: string, insertBudget: Partial<InsertBudget>): Promise<Budget> {
    const existing = this.budgets.get(id);
    if (!existing) throw new Error("Budget not found");
    
    const updated: Budget = { ...existing, ...insertBudget };
    this.budgets.set(id, updated);
    return updated;
  }

  async deleteBudget(id: string): Promise<void> {
    this.budgets.delete(id);
  }

  // Actuals
  async getActuals(contractId?: string): Promise<Actual[]> {
    const actuals = Array.from(this.actuals.values());
    return contractId ? actuals.filter(a => a.contractId === contractId) : actuals;
  }

  async getActual(id: string): Promise<Actual | undefined> {
    return this.actuals.get(id);
  }

  async createActual(insertActual: InsertActual): Promise<Actual> {
    const id = randomUUID();
    const actual: Actual = {
      ...insertActual,
      id,
      createdAt: new Date(),
    };
    this.actuals.set(id, actual);
    return actual;
  }

  async updateActual(id: string, insertActual: Partial<InsertActual>): Promise<Actual> {
    const existing = this.actuals.get(id);
    if (!existing) throw new Error("Actual not found");
    
    const updated: Actual = { ...existing, ...insertActual };
    this.actuals.set(id, updated);
    return updated;
  }

  async deleteActual(id: string): Promise<void> {
    this.actuals.delete(id);
  }

  // Employees
  async getEmployees(contractId?: string): Promise<Employee[]> {
    const employees = Array.from(this.employees.values());
    return contractId ? employees.filter(e => e.contractId === contractId) : employees;
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = {
      ...insertEmployee,
      id,
      createdAt: new Date(),
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: string, insertEmployee: Partial<InsertEmployee>): Promise<Employee> {
    const existing = this.employees.get(id);
    if (!existing) throw new Error("Employee not found");
    
    const updated: Employee = { ...existing, ...insertEmployee };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: string): Promise<void> {
    this.employees.delete(id);
  }

  // Glosas
  async getGlosas(contractId?: string): Promise<Glosa[]> {
    const glosas = Array.from(this.glosas.values());
    return contractId ? glosas.filter(g => g.contractId === contractId) : glosas;
  }

  async getGlosa(id: string): Promise<Glosa | undefined> {
    return this.glosas.get(id);
  }

  async createGlosa(insertGlosa: InsertGlosa): Promise<Glosa> {
    const id = randomUUID();
    const glosa: Glosa = {
      ...insertGlosa,
      id,
      createdAt: new Date(),
    };
    this.glosas.set(id, glosa);
    return glosa;
  }

  async updateGlosa(id: string, insertGlosa: Partial<InsertGlosa>): Promise<Glosa> {
    const existing = this.glosas.get(id);
    if (!existing) throw new Error("Glosa not found");
    
    const updated: Glosa = { ...existing, ...insertGlosa };
    this.glosas.set(id, updated);
    return updated;
  }

  async deleteGlosa(id: string): Promise<void> {
    this.glosas.delete(id);
  }

  // Predictions
  async getPredictions(contractId?: string): Promise<Prediction[]> {
    const predictions = Array.from(this.predictions.values());
    return contractId ? predictions.filter(p => p.contractId === contractId) : predictions;
  }

  async getPrediction(id: string): Promise<Prediction | undefined> {
    return this.predictions.get(id);
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = randomUUID();
    const prediction: Prediction = {
      ...insertPrediction,
      id,
      createdAt: new Date(),
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  async updatePrediction(id: string, insertPrediction: Partial<InsertPrediction>): Promise<Prediction> {
    const existing = this.predictions.get(id);
    if (!existing) throw new Error("Prediction not found");
    
    const updated: Prediction = { ...existing, ...insertPrediction };
    this.predictions.set(id, updated);
    return updated;
  }

  async deletePrediction(id: string): Promise<void> {
    this.predictions.delete(id);
  }

  // Audit Logs
  async getAuditLogs(tableName?: string, recordId?: string): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values());
    if (tableName) logs = logs.filter(l => l.tableName === tableName);
    if (recordId) logs = logs.filter(l => l.recordId === recordId);
    return logs.sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime());
  }

  async createAuditLog(insertAuditLog: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const auditLog: AuditLog = {
      ...insertAuditLog,
      id,
      timestamp: new Date(),
    };
    this.auditLogs.set(id, auditLog);
    return auditLog;
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      ...insertAlert,
      id,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: string, insertAlert: Partial<InsertAlert>): Promise<Alert> {
    const existing = this.alerts.get(id);
    if (!existing) throw new Error("Alert not found");
    
    const updated: Alert = { ...existing, ...insertAlert };
    this.alerts.set(id, updated);
    return updated;
  }

  async deleteAlert(id: string): Promise<void> {
    this.alerts.delete(id);
  }

  // Reports
  async getReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }

  async getReport(id: string): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = {
      ...insertReport,
      id,
      createdAt: new Date(),
    };
    this.reports.set(id, report);
    return report;
  }

  async updateReport(id: string, insertReport: Partial<InsertReport>): Promise<Report> {
    const existing = this.reports.get(id);
    if (!existing) throw new Error("Report not found");
    
    const updated: Report = { ...existing, ...insertReport };
    this.reports.set(id, updated);
    return updated;
  }

  async deleteReport(id: string): Promise<void> {
    this.reports.delete(id);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, insertCategory: Partial<InsertCategory>): Promise<Category> {
    const existing = this.categories.get(id);
    if (!existing) throw new Error("Category not found");
    
    const updated: Category = { ...existing, ...insertCategory };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    this.categories.delete(id);
  }

  // Analytics
  async getDREData(year: number, month: number): Promise<any> {
    const budgets = await this.getBudgets();
    const actuals = await this.getActuals();
    
    const budgetData = budgets.filter(b => b.year === year && b.month === month);
    const actualData = actuals.filter(a => a.year === year && a.month === month);
    
    const totalBudgetRevenue = budgetData.reduce((sum, b) => sum + parseFloat(b.revenue || "0"), 0);
    const totalActualRevenue = actualData.reduce((sum, a) => sum + parseFloat(a.revenue || "0"), 0);
    const totalBudgetCosts = budgetData.reduce((sum, b) => sum + parseFloat(b.costs || "0"), 0);
    const totalActualCosts = actualData.reduce((sum, a) => sum + parseFloat(a.costs || "0"), 0);
    
    return {
      revenue: {
        budgeted: totalBudgetRevenue,
        actual: totalActualRevenue,
        variance: totalActualRevenue - totalBudgetRevenue,
        variancePercent: totalBudgetRevenue > 0 ? ((totalActualRevenue - totalBudgetRevenue) / totalBudgetRevenue) * 100 : 0,
      },
      costs: {
        budgeted: totalBudgetCosts,
        actual: totalActualCosts,
        variance: totalActualCosts - totalBudgetCosts,
        variancePercent: totalBudgetCosts > 0 ? ((totalActualCosts - totalBudgetCosts) / totalBudgetCosts) * 100 : 0,
      },
      profit: {
        budgeted: totalBudgetRevenue - totalBudgetCosts,
        actual: totalActualRevenue - totalActualCosts,
        margin: totalActualRevenue > 0 ? ((totalActualRevenue - totalActualCosts) / totalActualRevenue) * 100 : 0,
      }
    };
  }

  async getKPIData(): Promise<any> {
    const contracts = await this.getContracts();
    const activeContracts = contracts.filter(c => c.status === "active");
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const dreData = await this.getDREData(currentYear, currentMonth);
    
    return {
      totalRevenue: dreData.revenue.actual,
      totalCosts: dreData.costs.actual,
      profitMargin: dreData.profit.margin,
      activeContracts: activeContracts.length,
      revenueGrowth: 12.5, // Mock data for growth
      costIncrease: 8.3,
      marginImprovement: 4.1,
    };
  }
}

export const storage = new MemStorage();
