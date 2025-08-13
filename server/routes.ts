import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import "./types"; // Import type extensions
import { registerAdminRoutes } from "./adminRoutes";
import { registerUserRoutes } from "./userRoutes";
import { registerAnalyticsRoutes } from "./analyticsRoutes";
import { 
  insertContractSchema, insertBudgetSchema, insertActualSchema,
  insertEmployeeSchema, insertGlosaSchema, insertPredictionSchema,
  insertAlertSchema, insertReportSchema, insertCategorySchema,
  insertDirectCostSchema, insertAuditLogSchema, insertPayrollSchema,
  insertVagaSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register user routes
  registerUserRoutes(app);
  
  // Register analytics routes
  registerAnalyticsRoutes(app);
  
  // Audit middleware
  const auditMiddleware = async (req: any, res: any, next: any) => {
    const originalSend = res.send;
    res.send = function(data: any) {
      // Log the operation after response
      if (req.method !== 'GET' && req.auditData) {
        storage.createAuditLog({
          tableName: req.auditData.tableName,
          recordId: req.auditData.recordId,
          operation: req.method,
          oldData: req.auditData.oldData,
          newData: req.auditData.newData,
          userId: req.headers['user-id'] as string || 'system',
        });
      }
      return originalSend.call(this, data);
    };
    next();
  };

  app.use('/api', auditMiddleware);

  // Contracts
  app.get('/api/contracts', async (req, res) => {
    try {
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching contracts' });
    }
  });

  app.get('/api/contracts/:id', async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      res.json(contract);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching contract' });
    }
  });

  app.post('/api/contracts', async (req, res) => {
    try {
      console.log('📝 Dados recebidos para criação:', req.body);
      
      // Parse and validate data, ensuring all required fields are present
      const validatedData = insertContractSchema.parse({
        ...req.body,
        // Ensure nullable fields have proper handling
        contact: req.body.contact || null,
        description: req.body.description || null,
        margin: req.body.margin || null,
        endDate: req.body.endDate || null,
        categories: req.body.categories || [],
        tags: req.body.tags || [],
        monthlyValues: req.body.monthlyValues || {},
        totalValues: req.body.totalValues || {},
      });

      console.log('✅ Dados validados:', validatedData);
      
      const contract = await storage.createContract(validatedData);
      
      console.log('💾 Contrato salvo:', contract);
      
      req.auditData = {
        tableName: 'contracts',
        recordId: contract.id,
        newData: contract,
      };
      
      res.status(201).json(contract);
    } catch (error) {
      console.error('❌ Erro ao criar contrato:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating contract' });
    }
  });

  // Handle both PUT and PATCH for contract updates
  const handleContractUpdate = async (req: any, res: any) => {
    try {
      console.log('📝 Dados recebidos para atualização:', req.params.id, req.body);
      
      const oldContract = await storage.getContract(req.params.id);
      if (!oldContract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      
      // Parse and validate partial data for update
      const validatedData = insertContractSchema.partial().parse({
        ...req.body,
        // Ensure proper handling of nullable fields during update
        ...(req.body.contact !== undefined && { contact: req.body.contact || null }),
        ...(req.body.description !== undefined && { description: req.body.description || null }),
        ...(req.body.margin !== undefined && { margin: req.body.margin || null }),
        ...(req.body.endDate !== undefined && { endDate: req.body.endDate || null }),
        ...(req.body.categories !== undefined && { categories: req.body.categories || [] }),
        ...(req.body.tags !== undefined && { tags: req.body.tags || [] }),
        ...(req.body.monthlyValues !== undefined && { monthlyValues: req.body.monthlyValues || {} }),
        ...(req.body.totalValues !== undefined && { totalValues: req.body.totalValues || {} }),
      });
      
      console.log('✅ Dados validados para atualização:', validatedData);
      
      const contract = await storage.updateContract(req.params.id, validatedData);
      
      console.log('💾 Contrato atualizado:', contract);
      
      req.auditData = {
        tableName: 'contracts',
        recordId: contract.id,
        oldData: oldContract,
        newData: contract,
      };
      
      res.json(contract);
    } catch (error) {
      console.error('❌ Erro ao atualizar contrato:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error updating contract' });
    }
  };

  app.put('/api/contracts/:id', handleContractUpdate);
  app.patch('/api/contracts/:id', handleContractUpdate);

  app.delete('/api/contracts/:id', async (req, res) => {
    try {
      const oldContract = await storage.getContract(req.params.id);
      await storage.deleteContract(req.params.id);
      
      req.auditData = {
        tableName: 'contracts',
        recordId: req.params.id,
        oldData: oldContract,
      };
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error deleting contract' });
    }
  });

  // Budgets
  app.get('/api/budgets', async (req, res) => {
    try {
      const contractId = req.query.contractId as string;
      const budgets = await storage.getBudgets(contractId);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching budgets' });
    }
  });

  app.post('/api/budgets', async (req, res) => {
    try {
      const validatedData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(validatedData);
      
      req.auditData = {
        tableName: 'budgets',
        recordId: budget.id,
        newData: budget,
      };
      
      res.status(201).json(budget);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating budget' });
    }
  });

  // Actuals
  app.get('/api/actuals', async (req, res) => {
    try {
      const contractId = req.query.contractId as string;
      const actuals = await storage.getActuals(contractId);
      res.json(actuals);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching actuals' });
    }
  });

  app.post('/api/actuals', async (req, res) => {
    try {
      const validatedData = insertActualSchema.parse(req.body);
      const actual = await storage.createActual(validatedData);
      
      req.auditData = {
        tableName: 'actuals',
        recordId: actual.id,
        newData: actual,
      };
      
      res.status(201).json(actual);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating actual' });
    }
  });

  // Employees
  app.get('/api/employees', async (req, res) => {
    try {
      const contractId = req.query.contractId as string;
      const employees = await storage.getEmployees(contractId);
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching employees' });
    }
  });

  app.post('/api/employees', async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      
      req.auditData = {
        tableName: 'employees',
        recordId: employee.id,
        newData: employee,
      };
      
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating employee' });
    }
  });

  // Glosas
  app.get('/api/glosas', async (req, res) => {
    try {
      const contractId = req.query.contractId as string;
      const glosas = await storage.getGlosas(contractId);
      res.json(glosas);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching glosas' });
    }
  });

  app.post('/api/glosas', async (req, res) => {
    try {
      const validatedData = insertGlosaSchema.parse(req.body);
      const glosa = await storage.createGlosa(validatedData);
      
      req.auditData = {
        tableName: 'glosas',
        recordId: glosa.id,
        newData: glosa,
      };
      
      res.status(201).json(glosa);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating glosa' });
    }
  });

  app.put('/api/glosas/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertGlosaSchema.parse(req.body);
      const updatedGlosa = await storage.updateGlosa(id, validatedData);
      
      req.auditData = {
        tableName: 'glosas',
        recordId: id,
        newData: updatedGlosa,
      };
      
      res.json(updatedGlosa);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error updating glosa' });
    }
  });

  app.delete('/api/glosas/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGlosa(id);
      
      req.auditData = {
        tableName: 'glosas',
        recordId: id,
        action: 'delete',
      };
      
      res.json({ message: 'Glosa deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error deleting glosa' });
    }
  });

  // Predictions
  app.get('/api/predictions', async (req, res) => {
    try {
      const contractId = req.query.contractId as string;
      const predictions = await storage.getPredictions(contractId);
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching predictions' });
    }
  });

  app.post('/api/predictions', async (req, res) => {
    try {
      const validatedData = insertPredictionSchema.parse(req.body);
      const prediction = await storage.createPrediction(validatedData);
      res.status(201).json(prediction);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating prediction' });
    }
  });

  // Audit Logs
  app.get('/api/audit-logs', async (req, res) => {
    try {
      const tableName = req.query.tableName as string;
      const recordId = req.query.recordId as string;
      const logs = await storage.getAuditLogs(tableName, recordId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching audit logs' });
    }
  });

  // Alerts
  app.get('/api/alerts', async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching alerts' });
    }
  });

  app.post('/api/alerts', async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating alert' });
    }
  });

  app.put('/api/alerts/:id', async (req, res) => {
    try {
      const validatedData = insertAlertSchema.partial().parse(req.body);
      const alert = await storage.updateAlert(req.params.id, validatedData);
      res.json(alert);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error updating alert' });
    }
  });

  // Reports
  app.get('/api/reports', async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching reports' });
    }
  });

  app.post('/api/reports', async (req, res) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating report' });
    }
  });

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching categories' });
    }
  });

  app.post('/api/categories', async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating category' });
    }
  });

  // Direct Costs
  app.get('/api/direct-costs', async (req, res) => {
    try {
      const contractId = req.query.contractId as string;
      const costs = await storage.getDirectCosts(contractId);
      res.json(costs);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching direct costs' });
    }
  });

  app.get('/api/direct-costs/:id', async (req, res) => {
    try {
      const cost = await storage.getDirectCost(req.params.id);
      if (!cost) {
        return res.status(404).json({ message: 'Direct cost not found' });
      }
      res.json(cost);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching direct cost' });
    }
  });

  app.post('/api/direct-costs', async (req, res) => {
    try {
      const validatedData = insertDirectCostSchema.parse(req.body);
      const cost = await storage.createDirectCost(validatedData);
      
      req.auditData = {
        tableName: 'direct_costs',
        recordId: cost.id,
        newData: cost,
      };
      
      res.status(201).json(cost);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating direct cost' });
    }
  });

  app.put('/api/direct-costs/:id', async (req, res) => {
    try {
      const existing = await storage.getDirectCost(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Direct cost not found' });
      }
      
      const validatedData = insertDirectCostSchema.partial().parse(req.body);
      const cost = await storage.updateDirectCost(req.params.id, validatedData);
      
      req.auditData = {
        tableName: 'direct_costs',
        recordId: cost.id,
        oldData: existing,
        newData: cost,
      };
      
      res.json(cost);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error updating direct cost' });
    }
  });

  app.delete('/api/direct-costs/:id', async (req, res) => {
    try {
      const existing = await storage.getDirectCost(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Direct cost not found' });
      }
      
      await storage.deleteDirectCost(req.params.id);
      
      req.auditData = {
        tableName: 'direct_costs',
        recordId: req.params.id,
        oldData: existing,
      };
      
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error deleting direct cost' });
    }
  });

  // Payroll routes
  app.get('/api/payroll', async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.contractId) filters.contractId = req.query.contractId as string;
      if (req.query.year) filters.year = parseInt(req.query.year as string);
      if (req.query.month) filters.month = parseInt(req.query.month as string);
      if (req.query.quarter) filters.quarter = parseInt(req.query.quarter as string);
      if (req.query.period) filters.period = req.query.period as string;
      
      const payroll = await storage.getPayroll(filters);
      res.json(payroll);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching payroll' });
    }
  });

  app.get('/api/payroll/:id', async (req, res) => {
    try {
      const payrollItem = await storage.getPayrollItem(req.params.id);
      if (!payrollItem) {
        return res.status(404).json({ message: 'Payroll not found' });
      }
      res.json(payrollItem);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching payroll' });
    }
  });

  app.post('/api/payroll', async (req, res) => {
    try {
      const validatedData = insertPayrollSchema.parse(req.body);
      const payrollItem = await storage.createPayroll(validatedData);
      
      req.auditData = {
        tableName: 'payroll',
        recordId: payrollItem.id,
        newData: payrollItem,
      };
      
      res.json(payrollItem);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating payroll' });
    }
  });

  app.put('/api/payroll/:id', async (req, res) => {
    try {
      const existing = await storage.getPayrollItem(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Payroll not found' });
      }
      
      const validatedData = insertPayrollSchema.partial().parse(req.body);
      const payrollItem = await storage.updatePayroll(req.params.id, validatedData);
      
      req.auditData = {
        tableName: 'payroll',
        recordId: payrollItem.id,
        oldData: existing,
        newData: payrollItem,
      };
      
      res.json(payrollItem);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error updating payroll' });
    }
  });

  app.delete('/api/payroll/:id', async (req, res) => {
    try {
      const existing = await storage.getPayrollItem(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Payroll not found' });
      }
      
      await storage.deletePayroll(req.params.id);
      
      req.auditData = {
        tableName: 'payroll',
        recordId: req.params.id,
        oldData: existing,
      };
      
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error deleting payroll' });
    }
  });

  // Analytics
  app.get('/api/analytics/dre', async (req, res) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const dreData = await storage.getDREData(year, month);
      res.json(dreData);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching DRE data' });
    }
  });

  app.get('/api/analytics/kpis', async (req, res) => {
    try {
      const kpiData = await storage.getKPIData();
      res.json(kpiData);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching KPI data' });
    }
  });

  // Machine Learning Predictions
  app.get("/api/predictions", async (req, res) => {
    res.json([]);
  });

  // Vagas (Job Openings) Routes
  app.get('/api/vagas', async (req, res) => {
    try {
      const contractId = req.query.contractId as string;
      // Se contractId for "all" ou vazio, passar undefined para buscar todas as vagas
      const finalContractId = contractId === "all" || !contractId ? undefined : contractId;
      const vagas = await storage.getVagas(finalContractId);
      res.json(vagas);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching vagas' });
    }
  });

  app.get('/api/vagas/metrics', async (req, res) => {
    try {
      const contractId = req.query.contractId as string;
      // Se contractId for "all" ou vazio, passar undefined para buscar métricas de todos os contratos
      const finalContractId = contractId === "all" || !contractId ? undefined : contractId;
      const metrics = await storage.getVagasMetrics(finalContractId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching vagas metrics' });
    }
  });

  app.get('/api/vagas/:id', async (req, res) => {
    try {
      const vaga = await storage.getVaga(req.params.id);
      if (!vaga) {
        return res.status(404).json({ message: 'Vaga not found' });
      }
      res.json(vaga);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching vaga' });
    }
  });

  app.post('/api/vagas', async (req, res) => {
    try {
      const validatedData = insertVagaSchema.parse(req.body);
      const vaga = await storage.createVaga(validatedData);
      
      req.auditData = {
        tableName: 'vagas',
        recordId: vaga.id,
        newData: vaga,
      };
      
      res.status(201).json(vaga);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating vaga' });
    }
  });

  app.put('/api/vagas/:id', async (req, res) => {
    try {
      const existing = await storage.getVaga(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Vaga not found' });
      }
      
      const validatedData = insertVagaSchema.partial().parse(req.body);
      const vaga = await storage.updateVaga(req.params.id, validatedData);
      
      req.auditData = {
        tableName: 'vagas',
        recordId: vaga.id,
        oldData: existing,
        newData: vaga,
      };
      
      res.json(vaga);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error updating vaga' });
    }
  });

  app.delete('/api/vagas/:id', async (req, res) => {
    try {
      const existing = await storage.getVaga(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Vaga not found' });
      }
      
      await storage.deleteVaga(req.params.id);
      
      req.auditData = {
        tableName: 'vagas',
        recordId: req.params.id,
        oldData: existing,
      };
      
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error deleting vaga' });
    }
  });

  // Register admin routes
  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
