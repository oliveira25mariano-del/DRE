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
  type Category, type InsertCategory,
  type DirectCost, type InsertDirectCost,
  type User, type InsertUser,
  type Payroll, type InsertPayroll,
  type Vaga, type InsertVaga
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { users, employees, directCosts, payroll } from "@shared/schema";

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

  // Direct Costs
  getDirectCosts(contractId?: string): Promise<DirectCost[]>;
  getDirectCost(id: string): Promise<DirectCost | undefined>;
  createDirectCost(directCost: InsertDirectCost): Promise<DirectCost>;
  updateDirectCost(id: string, directCost: Partial<InsertDirectCost>): Promise<DirectCost>;
  deleteDirectCost(id: string): Promise<void>;

  // Analytics
  getDREData(year: number, month: number): Promise<any>;
  getKPIData(): Promise<any>;

  // Payroll
  getPayroll(filters?: { contractId?: string; year?: number; month?: number; quarter?: number; period?: string }): Promise<Payroll[]>;
  getPayrollItem(id: string): Promise<Payroll | undefined>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: string, payroll: Partial<InsertPayroll>): Promise<Payroll>;
  deletePayroll(id: string): Promise<void>;

  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  updateLastLogin(id: string): Promise<void>;

  // Vagas
  getVagas(contractId?: string): Promise<Vaga[]>;
  getVaga(id: string): Promise<Vaga | undefined>;
  createVaga(vaga: InsertVaga): Promise<Vaga>;
  updateVaga(id: string, vaga: Partial<InsertVaga>): Promise<Vaga>;
  deleteVaga(id: string): Promise<void>;
  getVagasMetrics(contractId?: string): Promise<any>;
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
  private directCosts: Map<string, DirectCost> = new Map();
  private payrollData: Map<string, Payroll> = new Map();
  private users: Map<string, User> = new Map();
  private vagas: Map<string, Vaga> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const now = new Date();
    
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
        createdAt: now,
      });
    });

    // Initialize sample contracts
    const sampleContracts = [
      {
        name: "Shopping Curitiba - PR",
        description: "Contrato de manutenção predial e facilities",
        client: "Shopping Curitiba",
        contact: "Edgar Nabarte",
        category: "Manutenção",
        categories: ["Manutenção"],
        status: "active",
        monthlyValue: "17600.52",
        totalValue: "211206.24",
        monthlyValues: {},
        totalValues: {},
        startDate: "2025-01-01T00:00:00.000Z",
        tags: []
      },
      {
        name: "PMOC - Hospital Regional",
        description: "Plano de Manutenção, Operação e Controle de sistemas de climatização",
        client: "Hospital Regional Sul",
        contact: "Dr. Carlos Medeiros",
        category: "PMOC",
        categories: ["PMOC"],
        status: "active",
        monthlyValue: "12500.00",
        totalValue: "150000.00",
        monthlyValues: {},
        totalValues: {},
        startDate: "2025-01-15T00:00:00.000Z",
        tags: []
      },
      {
        name: "Projeto ABC - Sistema Gestão",
        description: "Desenvolvimento de sistema de gestão empresarial",
        client: "ABC Tecnologia",
        contact: "João Silva",
        category: "Desenvolvimento",
        categories: ["Desenvolvimento"],
        status: "active",
        monthlyValue: "25000.00",
        totalValue: "300000.00",
        monthlyValues: {},
        totalValues: {},
        startDate: "2025-02-01T00:00:00.000Z",
        tags: []
      },
      {
        name: "Shopping Santa Maria - RS",
        description: "Contrato de manutenção predial",
        client: "Allos",
        contact: "Edgar Nabarte",
        category: "PMOC",
        categories: ["PMOC"],
        status: "active",
        monthlyValue: "13500.00",
        totalValue: "162000.00",
        monthlyValues: {},
        totalValues: {},
        startDate: "2025-01-10T00:00:00.000Z",
        tags: []
      },
      {
        name: "Shopping Bauru",
        description: "Contrato de manutenção predial",
        client: "Shopping Bauru",
        contact: "Gerente Facilities",
        category: "Manutenção",
        categories: ["Manutenção"],
        status: "active",
        monthlyValue: "8500.00",
        totalValue: "102000.00",
        monthlyValues: {},
        totalValues: {},
        startDate: "2025-02-15T00:00:00.000Z",
        tags: []
      },
      {
        name: "Shopping SBC",
        description: "Contrato de facilities e manutenção",
        client: "Shopping São Bernardo",
        contact: "Coordenador Técnico",
        category: "Manutenção",
        categories: ["Manutenção"],
        status: "active",
        monthlyValue: "11200.00",
        totalValue: "134400.00",
        monthlyValues: {},
        totalValues: {},
        startDate: "2025-03-01T00:00:00.000Z",
        tags: []
      },
      {
        name: "Shopping Goiânia",
        description: "Contrato de manutenção e facilities",
        client: "Shopping Goiânia",
        contact: "Gerente Operacional",
        category: "Manutenção",
        categories: ["Manutenção"],
        status: "active",
        monthlyValue: "9800.00",
        totalValue: "117600.00",
        monthlyValues: {},
        totalValues: {},
        startDate: "2025-02-20T00:00:00.000Z",
        tags: []
      },
      {
        name: "Shopping Cerrado",
        description: "Serviços de manutenção predial",
        client: "Shopping Cerrado",
        contact: "Supervisor Técnico",
        category: "Manutenção",
        categories: ["Manutenção"],
        status: "active",
        monthlyValue: "7500.00",
        totalValue: "90000.00",
        monthlyValues: {},
        totalValues: {},
        startDate: "2025-03-10T00:00:00.000Z",
        tags: []
      },
      {
        name: "Shopping Uberlândia",
        description: "Manutenção predial e climatização",
        client: "Shopping Uberlândia",
        contact: "Coordenador de Facilities",
        category: "PMOC",
        categories: ["PMOC"],
        status: "active",
        monthlyValue: "14800.00",
        totalValue: "177600.00",
        monthlyValues: {},
        totalValues: {},
        startDate: "2025-01-25T00:00:00.000Z",
        tags: []
      },
      {
        name: "Shopping Vila Lobos - SP",
        description: "Contrato completo de facilities",
        client: "Shopping Vila Lobos",
        contact: "Gerente de Operações",
        category: "Manutenção",
        categories: ["Manutenção"],
        status: "active",
        monthlyValue: "19500.00",
        totalValue: "234000.00",
        monthlyValues: {},
        totalValues: {},
        startDate: "2025-01-05T00:00:00.000Z",
        tags: []
      }
    ];

    // Add sample contracts to storage
    const contractIds: string[] = [];
    sampleContracts.forEach(contractData => {
      const id = randomUUID();
      contractIds.push(id);
      this.contracts.set(id, {
        ...contractData,
        id,
        createdAt: now,
        updatedAt: now
      } as Contract);
    });

    // Initialize sample vagas (job openings)
    const sampleVagas = [
      {
        contratoId: contractIds[0], // Shopping Curitiba
        titulo: "Técnico em Refrigeração",
        descricao: "Técnico especializado em sistemas de refrigeração e ar condicionado",
        status: "fechada",
        dataAbertura: new Date(2025, 0, 10),
        dataFechamento: new Date(2025, 0, 25),
        tempoFechamentoDias: 15,
        prioridade: "alta",
        departamento: "Manutenção"
      },
      {
        contratoId: contractIds[1], // PMOC - Hospital
        titulo: "Engenheiro PMOC",
        descricao: "Engenheiro para coordenação de PMOC hospitalar",
        status: "aberta",
        dataAbertura: new Date(2025, 0, 20),
        prioridade: "urgente",
        departamento: "Engenharia"
      },
      {
        contratoId: contractIds[2], // Projeto ABC
        titulo: "Desenvolvedor Full Stack",
        descricao: "Desenvolvedor para sistema de gestão empresarial",
        status: "fechada",
        dataAbertura: new Date(2024, 11, 15),
        dataFechamento: new Date(2025, 0, 5),
        tempoFechamentoDias: 21,
        prioridade: "alta",
        departamento: "TI"
      },
      {
        contratoId: contractIds[0], // Shopping Curitiba
        titulo: "Supervisor de Manutenção",
        descricao: "Supervisor para coordenar equipe de manutenção predial",
        status: "aberta",
        dataAbertura: new Date(2025, 0, 15),
        prioridade: "media",
        departamento: "Supervisão"
      },
      {
        contratoId: contractIds[3], // Shopping Santa Maria
        titulo: "Técnico Eletricista",
        descricao: "Técnico eletricista para manutenção predial",
        status: "fechada",
        dataAbertura: new Date(2024, 11, 1),
        dataFechamento: new Date(2024, 11, 28),
        tempoFechamentoDias: 27,
        prioridade: "media",
        departamento: "Elétrica"
      },
      {
        contratoId: contractIds[4], // Shopping Cerrado
        titulo: "Auxiliar de Manutenção",
        descricao: "Auxiliar para serviços gerais de manutenção",
        status: "aberta",
        dataAbertura: new Date(2025, 0, 25),
        prioridade: "baixa",
        departamento: "Manutenção"
      }
    ];

    // Add sample vagas to storage
    sampleVagas.forEach(vagaData => {
      const id = randomUUID();
      this.vagas.set(id, {
        ...vagaData,
        id,
        createdAt: now,
        updatedAt: now
      } as Vaga);
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

  // Direct Costs
  async getDirectCosts(contractId?: string): Promise<DirectCost[]> {
    const costs = Array.from(this.directCosts.values());
    if (contractId) {
      return costs.filter(cost => cost.contractId === contractId);
    }
    return costs;
  }

  async getDirectCost(id: string): Promise<DirectCost | undefined> {
    return this.directCosts.get(id);
  }

  async createDirectCost(insertDirectCost: InsertDirectCost): Promise<DirectCost> {
    const id = randomUUID();
    const cost: DirectCost = {
      ...insertDirectCost,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.directCosts.set(id, cost);
    return cost;
  }

  async updateDirectCost(id: string, insertDirectCost: Partial<InsertDirectCost>): Promise<DirectCost> {
    const existing = this.directCosts.get(id);
    if (!existing) throw new Error("Direct cost not found");
    
    const updated: DirectCost = { ...existing, ...insertDirectCost, updatedAt: new Date() };
    this.directCosts.set(id, updated);
    return updated;
  }

  async deleteDirectCost(id: string): Promise<void> {
    this.directCosts.delete(id);
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

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      id,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      company: userData.company ?? null,
      phone: userData.phone ?? null,
      profilePhoto: userData.profilePhoto ?? null,
      active: userData.active ?? true,
      emailVerified: userData.emailVerified ?? false,
      restrictToOwnContracts: userData.restrictToOwnContracts ?? false,
      allowedContracts: userData.allowedContracts ?? [],
      lastLogin: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    // For demo, compare plain text (not secure, should use bcrypt in production)
    if (user.password !== password) return null;
    
    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      this.users.set(id, user);
    }
  }

  // Payroll methods for MemStorage
  async getPayroll(filters?: { contractId?: string; year?: number; month?: number; quarter?: number; period?: string }): Promise<Payroll[]> {
    const allPayroll = Array.from(this.payrollData.values());
    
    if (!filters) return allPayroll;
    
    return allPayroll.filter(item => {
      if (filters.contractId && item.contractId !== filters.contractId) return false;
      if (filters.year && item.year !== filters.year) return false;
      if (filters.month && item.month !== filters.month) return false;
      if (filters.quarter && item.quarter !== filters.quarter) return false;
      return true;
    });
  }

  async getPayrollItem(id: string): Promise<Payroll | undefined> {
    return this.payrollData.get(id);
  }

  async createPayroll(payrollData: InsertPayroll): Promise<Payroll> {
    const id = randomUUID();
    const now = new Date();
    const payroll: Payroll = {
      id,
      contractId: payrollData.contractId,
      year: payrollData.year,
      month: payrollData.month,
      quarter: payrollData.quarter,
      salarios: payrollData.salarios,
      horasExtras: payrollData.horasExtras,
      beneficios: payrollData.beneficios,
      vt: payrollData.vt,
      imestra: payrollData.imestra,
      createdAt: now,
      updatedAt: now,
    };
    this.payrollData.set(id, payroll);
    return payroll;
  }

  async updatePayroll(id: string, payrollData: Partial<InsertPayroll>): Promise<Payroll> {
    const existing = this.payrollData.get(id);
    if (!existing) throw new Error("Payroll not found");
    
    const updated: Payroll = { ...existing, ...payrollData, updatedAt: new Date() };
    this.payrollData.set(id, updated);
    return updated;
  }

  async deletePayroll(id: string): Promise<void> {
    this.payrollData.delete(id);
  }

  // Vagas methods
  async getVagas(contractId?: string): Promise<Vaga[]> {
    const allVagas = Array.from(this.vagas.values());
    let filteredVagas = contractId ? allVagas.filter(vaga => vaga.contratoId === contractId) : allVagas;
    
    // Ordenar por data de criação, mais recentes primeiro
    return filteredVagas.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.dataAbertura);
      const dateB = new Date(b.createdAt || b.dataAbertura);
      return dateB.getTime() - dateA.getTime();
    });
  }

  async getVaga(id: string): Promise<Vaga | undefined> {
    return this.vagas.get(id);
  }

  async createVaga(vaga: InsertVaga): Promise<Vaga> {
    const id = randomUUID();
    const now = new Date();
    const newVaga: Vaga = {
      id,
      ...vaga,
      createdAt: now,
      updatedAt: now,
    };

    // Calculate tempo_fechamento_dias if status is 'fechada'
    if (vaga.status === 'fechada' && vaga.dataFechamento && vaga.dataAbertura) {
      const diffTime = new Date(vaga.dataFechamento).getTime() - new Date(vaga.dataAbertura).getTime();
      newVaga.tempoFechamentoDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    this.vagas.set(id, newVaga);
    return newVaga;
  }

  async updateVaga(id: string, vaga: Partial<InsertVaga>): Promise<Vaga> {
    const existing = this.vagas.get(id);
    if (!existing) {
      throw new Error(`Vaga with id ${id} not found`);
    }

    const updated: Vaga = {
      ...existing,
      ...vaga,
      updatedAt: new Date(),
    };

    // Recalculate tempo_fechamento_dias if status changed to 'fechada'
    if (vaga.status === 'fechada' && updated.dataFechamento && updated.dataAbertura) {
      const diffTime = new Date(updated.dataFechamento).getTime() - new Date(updated.dataAbertura).getTime();
      updated.tempoFechamentoDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    this.vagas.set(id, updated);
    return updated;
  }

  async deleteVaga(id: string): Promise<void> {
    this.vagas.delete(id);
  }

  async getVagasMetrics(contractId?: string): Promise<any> {
    const vagas = await this.getVagas(contractId);
    const contracts = await this.getContracts();
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const vagasAbertas = vagas.filter(vaga => vaga.status === 'aberta').length;
    const vagasFechadas = vagas.filter(vaga => vaga.status === 'fechada').length;
    const totalVagas = vagasAbertas + vagasFechadas;

    // Taxa de Fechamento de Vagas (TFV)
    const tfv = totalVagas > 0 ? (vagasFechadas / totalVagas) * 100 : 0;

    // Tempo Médio de Fechamento (TMF)
    const vagasComTempo = vagas.filter(vaga => vaga.tempoFechamentoDias !== null && vaga.tempoFechamentoDias !== undefined);
    const tmf = vagasComTempo.length > 0 
      ? vagasComTempo.reduce((sum, vaga) => sum + (vaga.tempoFechamentoDias || 0), 0) / vagasComTempo.length
      : 0;

    // Taxa de Turnover - baseada em vagas fechadas nos últimos 12 meses
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
    const vagasFechadasUltimos12Meses = vagas.filter(vaga => {
      if (!vaga.dataFechamento) return false;
      const fechamento = new Date(vaga.dataFechamento);
      return fechamento >= twelveMonthsAgo && fechamento <= now;
    }).length;
    
    const taxaTurnover = totalVagas > 0 ? (vagasFechadasUltimos12Meses / totalVagas) * 100 : 0;
    const indiceRotatividade = taxaTurnover; // Mantendo compatibilidade

    // Metrics by contract
    const metricsByContract = contracts.map(contract => {
      const contractVagas = vagas.filter(vaga => vaga.contratoId === contract.id);
      const contractAbertas = contractVagas.filter(vaga => vaga.status === 'aberta').length;
      const contractFechadas = contractVagas.filter(vaga => vaga.status === 'fechada').length;
      const contractTotal = contractAbertas + contractFechadas;

      // Taxa de turnover por contrato
      const contractVagasFechadasUltimos12Meses = contractVagas.filter(vaga => {
        if (!vaga.dataFechamento) return false;
        const fechamento = new Date(vaga.dataFechamento);
        return fechamento >= twelveMonthsAgo && fechamento <= now;
      }).length;
      
      const taxaTurnoverContrato = contractTotal > 0 ? (contractVagasFechadasUltimos12Meses / contractTotal) * 100 : 0;

      return {
        contractId: contract.id,
        contractName: contract.name,
        abertas: contractAbertas,
        fechadas: contractFechadas,
        total: contractTotal,
        tfv: contractTotal > 0 ? (contractFechadas / contractTotal) * 100 : 0,
        taxaTurnover: taxaTurnoverContrato
      };
    });

    // Monthly trend (last 12 months)
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      const month = date.toLocaleDateString('pt-BR', { month: 'short' });
      const year = date.getFullYear();
      const monthNum = date.getMonth() + 1;

      const monthVagas = vagas.filter(vaga => {
        const vagaDate = new Date(vaga.dataAbertura);
        return vagaDate.getFullYear() === year && vagaDate.getMonth() + 1 === monthNum;
      });

      const monthAbertas = monthVagas.filter(vaga => vaga.status === 'aberta').length;
      const monthFechadas = monthVagas.filter(vaga => vaga.status === 'fechada').length;

      monthlyTrend.push({
        month,
        abertas: monthAbertas,
        fechadas: monthFechadas,
        tfv: monthAbertas + monthFechadas > 0 ? (monthFechadas / (monthAbertas + monthFechadas)) * 100 : 0
      });
    }

    return {
      kpis: {
        tfv: Math.round(tfv * 10) / 10,
        tmf: Math.round(tmf * 10) / 10,
        vagasAbertasAtivas: vagasAbertas,
        indiceRotatividade: Math.round(indiceRotatividade * 10) / 10,
        taxaTurnover: Math.round(taxaTurnover * 10) / 10
      },
      metricsByContract,
      monthlyTrend,
      alerts: [
        ...(tmf > 30 ? [{
          type: 'warning',
          message: `Tempo Médio de Fechamento (${tmf.toFixed(1)} dias) está acima da meta de 30 dias`,
          severity: 'alta'
        }] : []),
        ...(tfv < 70 ? [{
          type: 'warning', 
          message: `Taxa de Fechamento de Vagas (${tfv.toFixed(1)}%) está abaixo da meta de 70%`,
          severity: 'media'
        }] : []),
        ...(taxaTurnover > 20 ? [{
          type: 'error',
          message: `Taxa de Turnover (${taxaTurnover.toFixed(1)}%) está acima do limite recomendado de 20%`,
          severity: 'alta'
        }] : [])
      ]
    };
  }
}

// Use database storage for production
// DatabaseStorage implementation
class DatabaseStorage implements IStorage {
  // Employees
  async getEmployees(contractId?: string): Promise<Employee[]> {
    if (contractId) {
      return await db.select().from(employees).where(eq(employees.contractId, contractId));
    }
    return await db.select().from(employees);
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db
      .insert(employees)
      .values({
        ...insertEmployee,
        baseSalary: insertEmployee.baseSalary.toString(),
        fringeRate: insertEmployee.fringeRate.toString(),
        hoursWorked: insertEmployee.hoursWorked?.toString(),
        hourlyRate: insertEmployee.hourlyRate?.toString(),
      })
      .returning();
    return employee;
  }

  async updateEmployee(id: string, insertEmployee: Partial<InsertEmployee>): Promise<Employee> {
    const [employee] = await db
      .update(employees)
      .set({
        ...insertEmployee,
        ...(insertEmployee.baseSalary && { baseSalary: insertEmployee.baseSalary.toString() }),
        ...(insertEmployee.fringeRate && { fringeRate: insertEmployee.fringeRate.toString() }),
        ...(insertEmployee.hoursWorked && { hoursWorked: insertEmployee.hoursWorked.toString() }),
        ...(insertEmployee.hourlyRate && { hourlyRate: insertEmployee.hourlyRate.toString() }),
      })
      .where(eq(employees.id, id))
      .returning();
    return employee;
  }

  async deleteEmployee(id: string): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  // Delegating other methods to MemStorage for now
  private memStorage = new MemStorage();
  
  async getContracts(): Promise<Contract[]> { 
    // Para agora, buscar do MemStorage que tem os dados padrão
    return this.memStorage.getContracts(); 
  }
  async getContract(id: string): Promise<Contract | undefined> { return this.memStorage.getContract(id); }
  async createContract(contract: InsertContract): Promise<Contract> { return this.memStorage.createContract(contract); }
  async updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract> { return this.memStorage.updateContract(id, contract); }
  async deleteContract(id: string): Promise<void> { return this.memStorage.deleteContract(id); }
  
  async getBudgets(contractId?: string): Promise<Budget[]> { return this.memStorage.getBudgets(contractId); }
  async getBudget(id: string): Promise<Budget | undefined> { return this.memStorage.getBudget(id); }
  async createBudget(budget: InsertBudget): Promise<Budget> { return this.memStorage.createBudget(budget); }
  async updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget> { return this.memStorage.updateBudget(id, budget); }
  async deleteBudget(id: string): Promise<void> { return this.memStorage.deleteBudget(id); }
  
  async getActuals(contractId?: string): Promise<Actual[]> { return this.memStorage.getActuals(contractId); }
  async getActual(id: string): Promise<Actual | undefined> { return this.memStorage.getActual(id); }
  async createActual(actual: InsertActual): Promise<Actual> { return this.memStorage.createActual(actual); }
  async updateActual(id: string, actual: Partial<InsertActual>): Promise<Actual> { return this.memStorage.updateActual(id, actual); }
  async deleteActual(id: string): Promise<void> { return this.memStorage.deleteActual(id); }
  
  async getGlosas(contractId?: string): Promise<Glosa[]> { return this.memStorage.getGlosas(contractId); }
  async getGlosa(id: string): Promise<Glosa | undefined> { return this.memStorage.getGlosa(id); }
  async createGlosa(glosa: InsertGlosa): Promise<Glosa> { return this.memStorage.createGlosa(glosa); }
  async updateGlosa(id: string, glosa: Partial<InsertGlosa>): Promise<Glosa> { return this.memStorage.updateGlosa(id, glosa); }
  async deleteGlosa(id: string): Promise<void> { return this.memStorage.deleteGlosa(id); }
  
  async getPredictions(contractId?: string): Promise<Prediction[]> { return this.memStorage.getPredictions(contractId); }
  async getPrediction(id: string): Promise<Prediction | undefined> { return this.memStorage.getPrediction(id); }
  async createPrediction(prediction: InsertPrediction): Promise<Prediction> { return this.memStorage.createPrediction(prediction); }
  async updatePrediction(id: string, prediction: Partial<InsertPrediction>): Promise<Prediction> { return this.memStorage.updatePrediction(id, prediction); }
  async deletePrediction(id: string): Promise<void> { return this.memStorage.deletePrediction(id); }
  
  async getAuditLogs(tableName?: string, recordId?: string): Promise<AuditLog[]> { return this.memStorage.getAuditLogs(tableName, recordId); }
  async createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog> { return this.memStorage.createAuditLog(auditLog); }
  
  async getAlerts(): Promise<Alert[]> { return this.memStorage.getAlerts(); }
  async getAlert(id: string): Promise<Alert | undefined> { return this.memStorage.getAlert(id); }
  async createAlert(alert: InsertAlert): Promise<Alert> { return this.memStorage.createAlert(alert); }
  async updateAlert(id: string, alert: Partial<InsertAlert>): Promise<Alert> { return this.memStorage.updateAlert(id, alert); }
  async deleteAlert(id: string): Promise<void> { return this.memStorage.deleteAlert(id); }
  
  async getReports(): Promise<Report[]> { return this.memStorage.getReports(); }
  async getReport(id: string): Promise<Report | undefined> { return this.memStorage.getReport(id); }
  async createReport(report: InsertReport): Promise<Report> { return this.memStorage.createReport(report); }
  async updateReport(id: string, report: Partial<InsertReport>): Promise<Report> { return this.memStorage.updateReport(id, report); }
  async deleteReport(id: string): Promise<void> { return this.memStorage.deleteReport(id); }
  
  async getCategories(): Promise<Category[]> { return this.memStorage.getCategories(); }
  async getCategory(id: string): Promise<Category | undefined> { return this.memStorage.getCategory(id); }
  async createCategory(category: InsertCategory): Promise<Category> { return this.memStorage.createCategory(category); }
  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> { return this.memStorage.updateCategory(id, category); }
  async deleteCategory(id: string): Promise<void> { return this.memStorage.deleteCategory(id); }

  // Direct Costs
  async getDirectCosts(contractId?: string): Promise<DirectCost[]> { return this.memStorage.getDirectCosts(contractId); }
  async getDirectCost(id: string): Promise<DirectCost | undefined> { return this.memStorage.getDirectCost(id); }
  async createDirectCost(directCost: InsertDirectCost): Promise<DirectCost> { return this.memStorage.createDirectCost(directCost); }
  async updateDirectCost(id: string, directCost: Partial<InsertDirectCost>): Promise<DirectCost> { return this.memStorage.updateDirectCost(id, directCost); }
  async deleteDirectCost(id: string): Promise<void> { return this.memStorage.deleteDirectCost(id); }
  
  async getDREData(year: number, month: number): Promise<any> { return this.memStorage.getDREData(year, month); }
  async getKPIData(): Promise<any> { return this.memStorage.getKPIData(); }
  
  // Payroll
  async getPayroll(filters?: { contractId?: string; year?: number; month?: number; quarter?: number; period?: string }): Promise<Payroll[]> {
    let query = db.select().from(payroll);
    
    if (filters?.contractId) {
      query = query.where(eq(payroll.contractId, filters.contractId));
    }
    
    const results = await query;
    
    return results.filter(item => {
      if (filters?.year && item.year !== filters.year) return false;
      if (filters?.month && item.month !== filters.month) return false;
      if (filters?.quarter && item.quarter !== filters.quarter) return false;
      return true;
    });
  }
  
  async getPayrollItem(id: string): Promise<Payroll | undefined> {
    const [result] = await db.select().from(payroll).where(eq(payroll.id, id));
    return result;
  }
  
  async createPayroll(payrollData: InsertPayroll): Promise<Payroll> {
    const [result] = await db.insert(payroll).values(payrollData).returning();
    return result;
  }
  
  async updatePayroll(id: string, payrollData: Partial<InsertPayroll>): Promise<Payroll> {
    const [result] = await db.update(payroll)
      .set({ ...payrollData, updatedAt: new Date() })
      .where(eq(payroll.id, id))
      .returning();
    if (!result) throw new Error("Payroll not found");
    return result;
  }
  
  async deletePayroll(id: string): Promise<void> {
    await db.delete(payroll).where(eq(payroll.id, id));
  }

  async getUsers(): Promise<User[]> { return this.memStorage.getUsers(); }
  async getUser(id: string): Promise<User | undefined> { return this.memStorage.getUser(id); }
  async getUserByEmail(email: string): Promise<User | undefined> { return this.memStorage.getUserByEmail(email); }
  async createUser(user: InsertUser): Promise<User> { return this.memStorage.createUser(user); }
  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> { return this.memStorage.updateUser(id, user); }
  async authenticateUser(email: string, password: string): Promise<User | null> { return this.memStorage.authenticateUser(email, password); }
  async updateLastLogin(id: string): Promise<void> { return this.memStorage.updateLastLogin(id); }
  
  // Vagas methods
  async getVagas(contractId?: string): Promise<Vaga[]> { return this.memStorage.getVagas(contractId); }
  async getVaga(id: string): Promise<Vaga | undefined> { return this.memStorage.getVaga(id); }
  async createVaga(vaga: InsertVaga): Promise<Vaga> { return this.memStorage.createVaga(vaga); }
  async updateVaga(id: string, vaga: Partial<InsertVaga>): Promise<Vaga> { return this.memStorage.updateVaga(id, vaga); }
  async deleteVaga(id: string): Promise<void> { return this.memStorage.deleteVaga(id); }
  async getVagasMetrics(contractId?: string): Promise<any> { return this.memStorage.getVagasMetrics(contractId); }
}

export const storage = new DatabaseStorage();
