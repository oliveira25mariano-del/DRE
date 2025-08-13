// Server-specific type extensions

declare global {
  namespace Express {
    interface Request {
      auditData?: {
        tableName: string;
        recordId: string;
        oldData?: any;
        newData?: any;
      };
    }
  }
}

export {};