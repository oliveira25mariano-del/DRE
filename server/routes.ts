import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerUserRoutes } from "./userRoutes";
import { 
  insertContractSchema, insertBudgetSchema, insertActualSchema,
  insertEmployeeSchema, insertGlosaSchema, insertPredictionSchema,
  insertAlertSchema, insertReportSchema, insertCategorySchema,
  insertAuditLogSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register user routes
  registerUserRoutes(app);
  
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
      const validatedData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(validatedData);
      
      req.auditData = {
        tableName: 'contracts',
        recordId: contract.id,
        newData: contract,
      };
      
      res.status(201).json(contract);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating contract' });
    }
  });

  app.put('/api/contracts/:id', async (req, res) => {
    try {
      const oldContract = await storage.getContract(req.params.id);
      const validatedData = insertContractSchema.partial().parse(req.body);
      const contract = await storage.updateContract(req.params.id, validatedData);
      
      req.auditData = {
        tableName: 'contracts',
        recordId: contract.id,
        oldData: oldContract,
        newData: contract,
      };
      
      res.json(contract);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Error updating contract' });
    }
  });

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

  const httpServer = createServer(app);
  return httpServer;
}
