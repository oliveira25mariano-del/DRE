import { Router } from "express";
import { z } from "zod";
import { storage } from "./storage";

const router = Router();

// Schema para validação de preferências de notificação
const NotificationPreferenceSchema = z.object({
  userId: z.string(),
  type: z.enum(['financial', 'system', 'contract', 'budget', 'alert']),
  category: z.string(),
  enabled: z.boolean(),
  channels: z.array(z.enum(['email', 'push', 'sms', 'dashboard'])),
  threshold: z.number().optional(),
  conditions: z.record(z.any()),
  customMessage: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
});

const NotificationHistorySchema = z.object({
  userId: z.string(),
  type: z.enum(['financial', 'system', 'contract', 'budget', 'alert']),
  category: z.string(),
  title: z.string(),
  message: z.string(),
  channel: z.enum(['email', 'push', 'sms', 'dashboard']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  read: z.boolean().default(false),
  data: z.record(z.any()).optional()
});

// GET /api/notifications/preferences - Buscar preferências do usuário
router.get('/preferences', async (req, res) => {
  try {
    // TODO: Pegar userId do token de autenticação
    const userId = 'current-user'; // Temporário
    
    const preferences = await storage.getNotificationPreferences(userId);
    res.json(preferences);
  } catch (error) {
    console.error("Erro ao buscar preferências de notificação:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// POST /api/notifications/preferences - Criar nova preferência
router.post('/preferences', async (req, res) => {
  try {
    const validatedData = NotificationPreferenceSchema.parse(req.body);
    
    const preference = await storage.createNotificationPreference(validatedData);
    res.status(201).json(preference);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      return;
    }
    
    console.error("Erro ao criar preferência de notificação:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// PUT /api/notifications/preferences/:id - Atualizar preferência
router.put('/preferences/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = NotificationPreferenceSchema.parse(req.body);
    
    const preference = await storage.updateNotificationPreference(id, validatedData);
    
    if (!preference) {
      res.status(404).json({ message: "Preferência não encontrada" });
      return;
    }
    
    res.json(preference);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      return;
    }
    
    console.error("Erro ao atualizar preferência de notificação:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// DELETE /api/notifications/preferences/:id - Deletar preferência
router.delete('/preferences/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await storage.deleteNotificationPreference(id);
    
    if (!deleted) {
      res.status(404).json({ message: "Preferência não encontrada" });
      return;
    }
    
    res.json({ message: "Preferência removida com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar preferência de notificação:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// GET /api/notifications/history - Buscar histórico de notificações
router.get('/history', async (req, res) => {
  try {
    // TODO: Pegar userId do token de autenticação
    const userId = 'current-user'; // Temporário
    const { limit = 50, offset = 0 } = req.query;
    
    const history = await storage.getNotificationHistory(
      userId,
      Number(limit),
      Number(offset)
    );
    
    res.json(history);
  } catch (error) {
    console.error("Erro ao buscar histórico de notificações:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// POST /api/notifications/send - Enviar notificação (uso interno)
router.post('/send', async (req, res) => {
  try {
    const validatedData = NotificationHistorySchema.parse(req.body);
    
    // Buscar preferências do usuário para este tipo/categoria
    const preferences = await storage.getNotificationPreferences(validatedData.userId);
    const relevantPreference = preferences.find(p => 
      p.type === validatedData.type && 
      p.category === validatedData.category &&
      p.enabled
    );
    
    if (!relevantPreference) {
      res.status(200).json({ message: "Notificação não enviada - usuário não quer receber este tipo" });
      return;
    }
    
    // Verificar se o canal escolhido está habilitado
    if (!relevantPreference.channels.includes(validatedData.channel)) {
      res.status(200).json({ message: "Notificação não enviada - canal não habilitado" });
      return;
    }
    
    // Salvar no histórico
    const notification = await storage.createNotificationHistory(validatedData);
    
    // TODO: Implementar envio real baseado no canal
    switch (validatedData.channel) {
      case 'email':
        // await sendEmail(notification);
        break;
      case 'push':
        // await sendPushNotification(notification);
        break;
      case 'sms':
        // await sendSMS(notification);
        break;
      case 'dashboard':
        // Notificação já salva no banco, será mostrada no dashboard
        break;
    }
    
    res.status(201).json(notification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      return;
    }
    
    console.error("Erro ao enviar notificação:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// PUT /api/notifications/history/:id/read - Marcar notificação como lida
router.put('/history/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await storage.markNotificationAsRead(id);
    
    if (!notification) {
      res.status(404).json({ message: "Notificação não encontrada" });
      return;
    }
    
    res.json(notification);
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// GET /api/notifications/unread-count - Contar notificações não lidas
router.get('/unread-count', async (req, res) => {
  try {
    // TODO: Pegar userId do token de autenticação
    const userId = 'current-user'; // Temporário
    
    const count = await storage.getUnreadNotificationCount(userId);
    res.json({ count });
  } catch (error) {
    console.error("Erro ao contar notificações não lidas:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;