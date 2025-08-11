import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Plus, Edit, Trash2, Shield, Eye, Key, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminInfo from "@/components/admin-info";

const userSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  firstName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter no mínimo 2 caracteres"),
  role: z.enum(["edit", "visualization"], {
    required_error: "Selecione um tipo de acesso",
  }),
});

type UserFormData = z.infer<typeof userSchema>;

// Definir tipo User temporariamente
type User = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role: "edit" | "visualization";
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export default function AdminPanel() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "visualization",
    },
  });

  const editForm = useForm<Omit<UserFormData, "password">>({
    resolver: zodResolver(userSchema.omit({ password: true })),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "visualization",
    },
  });

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return await apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Usuário criado com sucesso",
        description: "O novo usuário foi cadastrado no sistema.",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro ao cadastrar o usuário.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Omit<UserFormData, "password">) => {
      if (!selectedUser) throw new Error("Usuário não selecionado");
      return await apiRequest(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Usuário atualizado com sucesso",
        description: "As informações do usuário foram atualizadas.",
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      editForm.reset();
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Ocorreu um erro ao atualizar o usuário.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Usuário excluído com sucesso",
        description: "O usuário foi removido do sistema.",
      });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || "Ocorreu um erro ao remover o usuário.",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter(user =>
    (user.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = (data: UserFormData) => {
    createMutation.mutate(data);
  };

  const handleUpdateUser = (data: Omit<UserFormData, "password">) => {
    updateMutation.mutate(data);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      <AdminInfo />
      <Card className="glass-effect border-blue-200/20">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Painel Administrativo
              </CardTitle>
              <CardDescription className="text-gray-300">
                Gerencie usuários e suas permissões de acesso ao sistema
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-blue-bg border-blue-400/30">
                  <DialogHeader>
                    <DialogTitle className="text-white">Criar Novo Usuário</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Nome</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                                placeholder="Digite o nome"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Sobrenome</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                                placeholder="Digite o sobrenome"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="email"
                                className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                                placeholder="email@empresa.com"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Senha</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="password"
                                className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                                placeholder="Digite a senha"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Tipo de Usuário</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                                  <SelectValue placeholder="Selecione o tipo de usuário" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="edit">
                                  <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    <span>Administrador</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="visualization">
                                  <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    <span>Usuário</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="text-xs text-blue-300 mt-1">
                              <strong>Administrador:</strong> Acesso completo ao sistema<br/>
                              <strong>Usuário:</strong> Apenas visualização de relatórios
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2 pt-4">
                        <Button 
                          type="submit" 
                          disabled={createMutation.isPending}
                          className="bg-white text-blue-900 hover:bg-blue-50"
                        >
                          {createMutation.isPending ? "Criando..." : "Criar Usuário"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                          className="border-white text-white hover:bg-white hover:text-blue-900"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Barra de Pesquisa */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-blue-800/50 border-blue-600 text-white placeholder:text-blue-300 pl-10"
              />
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-4 h-4" />
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-800/20 border-blue-600/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300">Total de Usuários</p>
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-800/20 border-green-600/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-300">Administradores</p>
                    <p className="text-2xl font-bold text-white">
                      {users.filter(u => u.role === "edit").length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-800/20 border-yellow-600/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-300">Usuários</p>
                    <p className="text-2xl font-bold text-white">
                      {users.filter(u => u.role === "visualization").length}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Usuários */}
          <div className="bg-blue-800/20 rounded-lg border border-blue-600/30">
            <Table>
              <TableHeader>
                <TableRow className="border-blue-600/30 hover:bg-blue-700/20">
                  <TableHead className="text-blue-200">Nome</TableHead>
                  <TableHead className="text-blue-200">Email</TableHead>
                  <TableHead className="text-blue-200">Tipo de Usuário</TableHead>
                  <TableHead className="text-blue-200">Data de Criação</TableHead>
                  <TableHead className="text-blue-200 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-blue-600/30 hover:bg-blue-700/30">
                    <TableCell className="font-medium text-white">
                      {(user.firstName || "")} {(user.lastName || "")}
                    </TableCell>
                    <TableCell className="text-blue-100">{user.email || "-"}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === "edit" ? "default" : "secondary"}
                        className={user.role === "edit" 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-yellow-600 hover:bg-yellow-700"
                        }
                      >
                        {user.role === "edit" ? "Administrador" : "Usuário"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-blue-100">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-blue-400 hover:text-blue-200 hover:bg-blue-500/20"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-400 hover:text-red-200 hover:bg-red-500/20"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Usuário</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateUser)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nome</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Sobrenome</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Tipo de Usuário</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="edit">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>Administrador</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="visualization">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>Usuário</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-blue-300 mt-1">
                      <strong>Administrador:</strong> Acesso completo ao sistema<br/>
                      <strong>Usuário:</strong> Apenas visualização de relatórios
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="bg-white text-blue-900 hover:bg-blue-50"
                >
                  {updateMutation.isPending ? "Atualizando..." : "Atualizar"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-white text-white hover:bg-white hover:text-blue-900"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-blue-bg border-blue-400/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-200">
              Tem certeza que deseja excluir o usuário "{userToDelete?.firstName} {userToDelete?.lastName}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white text-white hover:bg-white hover:text-blue-900">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}