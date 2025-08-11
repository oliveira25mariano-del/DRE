import type { Express } from "express";
import { insertUserSchema } from "@shared/schema";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

export function registerUserRoutes(app: Express) {
  // Cadastrar usuário
  app.post('/api/users/register', async (req, res) => {
    try {
      // Validar dados de entrada
      const userData = insertUserSchema.parse(req.body);
      
      // Verificar se email já existe
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ 
          error: "Email já está em uso" 
        });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Criar usuário
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: 'user' // Papel padrão
      });

      // Remover senha da resposta
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Erro interno do servidor" 
      });
    }
  });

  // Login de usuário
  app.post('/api/users/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          error: "Email e senha são obrigatórios" 
        });
      }

      // Autenticar usuário
      const user = await storage.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ 
          error: "Email ou senha incorretos" 
        });
      }

      if (!user.active) {
        return res.status(401).json({ 
          error: "Conta desativada. Entre em contato com o administrador." 
        });
      }

      // Atualizar último login
      await storage.updateLastLogin(user.id);

      // Remover senha da resposta
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        message: "Login realizado com sucesso"
      });
    } catch (error) {
      console.error("Erro no login:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor" 
      });
    }
  });

  // Listar usuários (apenas para admins)
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Remover senhas da resposta
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Obter usuário por ID
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Atualizar usuário
  app.put('/api/users/:id', async (req, res) => {
    try {
      const { password, ...updateData } = req.body;
      
      // Hash nova senha se fornecida
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      
      const user = await storage.updateUser(req.params.id, updateData);
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
}