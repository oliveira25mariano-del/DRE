import type { Express } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Simulação de banco de dados de usuários em memória
let users = [
  {
    id: "1",
    email: "joao@empresa.com",
    firstName: "João",
    lastName: "Silva",
    role: "edit" as const,
    passwordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    restrictToOwnContracts: false,
    allowedContracts: [] as string[],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    email: "maria@empresa.com",
    firstName: "Maria",
    lastName: "Santos",
    role: "visualization" as const,
    passwordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    restrictToOwnContracts: true,
    allowedContracts: ["c1", "c2"] as string[],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    email: "admin@empresa.com",
    firstName: "Admin",
    lastName: "Sistema",
    role: "edit" as const,
    passwordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    restrictToOwnContracts: false,
    allowedContracts: [] as string[],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(["edit", "visualization"]),
  restrictToOwnContracts: z.boolean().optional().default(false),
  allowedContracts: z.array(z.string()).optional().default([]),
});

const updateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(["edit", "visualization"]),
  restrictToOwnContracts: z.boolean().optional().default(false),
  allowedContracts: z.array(z.string()).optional().default([]),
});

export function registerAdminRoutes(app: Express) {
  // Listar todos os usuários
  app.get("/api/admin/users", (req, res) => {
    const publicUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      restrictToOwnContracts: user.restrictToOwnContracts,
      allowedContracts: user.allowedContracts,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    
    res.json(publicUsers);
  });

  // Criar novo usuário
  app.post("/api/admin/users", async (req, res) => {
    try {
      const validatedData = createUserSchema.parse(req.body);
      
      // Verificar se email já existe
      const existingUser = users.find(u => u.email === validatedData.email);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Email já está em uso" 
        });
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(validatedData.password, 10);
      
      const newUser = {
        id: (users.length + 1).toString(),
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
        restrictToOwnContracts: validatedData.restrictToOwnContracts,
        allowedContracts: validatedData.allowedContracts,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      users.push(newUser);

      // Retornar dados públicos (sem senha)
      const { passwordHash: _, ...publicUser } = newUser;
      res.status(201).json(publicUser);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Atualizar usuário existente
  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const validatedData = updateUserSchema.parse(req.body);
      
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Verificar se email já existe (exceto para o próprio usuário)
      const existingUser = users.find(u => u.email === validatedData.email && u.id !== userId);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Email já está em uso por outro usuário" 
        });
      }

      // Atualizar usuário
      users[userIndex] = {
        ...users[userIndex],
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
        restrictToOwnContracts: validatedData.restrictToOwnContracts,
        allowedContracts: validatedData.allowedContracts,
        updatedAt: new Date(),
      };

      // Retornar dados públicos
      const { passwordHash: _, ...publicUser } = users[userIndex];
      res.json(publicUser);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Excluir usuário
  app.delete("/api/admin/users/:id", (req, res) => {
    try {
      const userId = req.params.id;
      
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Não permitir exclusão do admin principal
      if (users[userIndex].email === "admin@empresa.com") {
        return res.status(403).json({ 
          message: "Não é possível excluir o administrador principal" 
        });
      }

      users.splice(userIndex, 1);
      res.json({ message: "Usuário excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Autenticação de usuários para login no sistema
  app.post("/api/admin/authenticate", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Retornar dados do usuário sem senha
      const { passwordHash: _, ...publicUser } = user;
      res.json(publicUser);
    } catch (error) {
      console.error("Erro na autenticação:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
}