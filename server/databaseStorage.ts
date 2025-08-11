import { db } from "./db";
import { users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { User, InsertUser } from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Users implementation
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;
    
    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  // Placeholder implementations for other methods (to be implemented)
  async getContracts() { return []; }
  async getContract() { return undefined; }
  async createContract() { throw new Error("Not implemented"); }
  async updateContract() { throw new Error("Not implemented"); }
  async deleteContract() { return; }

  async getBudgets() { return []; }
  async getBudget() { return undefined; }
  async createBudget() { throw new Error("Not implemented"); }
  async updateBudget() { throw new Error("Not implemented"); }
  async deleteBudget() { return; }

  async getActuals() { return []; }
  async getActual() { return undefined; }
  async createActual() { throw new Error("Not implemented"); }
  async updateActual() { throw new Error("Not implemented"); }
  async deleteActual() { return; }

  async getEmployees() { return []; }
  async getEmployee() { return undefined; }
  async createEmployee() { throw new Error("Not implemented"); }
  async updateEmployee() { throw new Error("Not implemented"); }
  async deleteEmployee() { return; }

  async getGlosas() { return []; }
  async getGlosa() { return undefined; }
  async createGlosa() { throw new Error("Not implemented"); }
  async updateGlosa() { throw new Error("Not implemented"); }
  async deleteGlosa() { return; }

  async getPredictions() { return []; }
  async getPrediction() { return undefined; }
  async createPrediction() { throw new Error("Not implemented"); }
  async updatePrediction() { throw new Error("Not implemented"); }
  async deletePrediction() { return; }

  async getAuditLogs() { return []; }
  async createAuditLog() { throw new Error("Not implemented"); }

  async getAlerts() { return []; }
  async getAlert() { return undefined; }
  async createAlert() { throw new Error("Not implemented"); }
  async updateAlert() { throw new Error("Not implemented"); }
  async deleteAlert() { return; }

  async getReports() { return []; }
  async getReport() { return undefined; }
  async createReport() { throw new Error("Not implemented"); }
  async updateReport() { throw new Error("Not implemented"); }
  async deleteReport() { return; }

  async getCategories() { return []; }
  async getCategory() { return undefined; }
  async createCategory() { throw new Error("Not implemented"); }
  async updateCategory() { throw new Error("Not implemented"); }
  async deleteCategory() { return; }

  async getDREData() { return {}; }
  async getKPIData() { return {}; }
}