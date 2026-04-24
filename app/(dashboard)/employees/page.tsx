"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { FormModal } from "@/components/form-modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmployeeForm } from "@/components/forms/employee-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { employeesApi } from "@/lib/api";
import type {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
} from "@/lib/types";

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<
    Employee | undefined
  >();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null,
  );
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeeData) => employeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsFormOpen(false);
      toast.success("Funcionário criado com sucesso!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Erro ao criar funcionário");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeData }) =>
      employeesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsFormOpen(false);
      setSelectedEmployee(undefined);
      toast.success("Funcionário atualizado com sucesso!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Erro ao atualizar funcionário");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsDeleteOpen(false);
      setEmployeeToDelete(null);
      toast.success("Funcionário excluído com sucesso!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Erro ao excluir funcionário");
    },
  });

  const handleSubmit = async (
    formData: CreateEmployeeData | UpdateEmployeeData,
  ) => {
    try {
      if (selectedEmployee) {
        await updateMutation.mutateAsync({
          id: selectedEmployee.ID,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData as CreateEmployeeData);
      }
    } catch {
      // tratado pelo onError da mutation
    }
  };

  const openCreateForm = () => {
    setSelectedEmployee(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteOpen(true);
  };

  const openViewDialog = (employee: Employee) => {
    setViewEmployee(employee);
    setIsViewOpen(true);
  };

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "MATRICULA",
      header: "Matrícula",
    },
    {
      accessorKey: "NOME",
      header: "Nome",
    },
    {
      accessorKey: "CPF",
      header: "CPF",
    },
    {
      accessorKey: "EMAIL",
      header: "E-mail",
    },
    {
      accessorKey: "DEPARTAMENTO",
      header: "Departamento",
      cell: ({ row }) => row.original.DEPARTAMENTO?.NOME || "-",
    },
    {
      accessorKey: "CARGO",
      header: "Cargo",
      cell: ({ row }) => row.original.CARGO?.NOME || "-",
    },
    {
      accessorKey: "GESTOR",
      header: "Gestor",
      cell: ({ row }) => row.original.GESTOR?.NOME || "-",
    },
    {
      accessorKey: "STATUS",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.STATUS} />,
    },
    {
      accessorKey: "DATA_ADMISSAO",
      header: "Admissão",
      cell: ({ row }) =>
        new Date(row.original.DATA_ADMISSAO).toLocaleDateString("pt-BR"),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openViewDialog(employee)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditForm(employee)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(employee)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const employees = data?.data || [];

  return (
    <div>
      <PageHeader
        title="Funcionários"
        description="Gerencie os funcionários da empresa"
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Funcionário
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={employees}
          searchKey="NOME"
          searchPlaceholder="Buscar por nome..."
        />
      )}

      <FormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedEmployee ? "Editar Funcionário" : "Novo Funcionário"}
        description={
          selectedEmployee
            ? "Atualize os dados do funcionário"
            : "Preencha os dados do novo funcionário"
        }
      >
        <EmployeeForm
          employee={selectedEmployee}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      <FormModal
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        title="Detalhes do Funcionário"
      >
        {viewEmployee && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Matrícula</p>
                <p className="font-medium">{viewEmployee.MATRICULA}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={viewEmployee.STATUS} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nome Completo</p>
              <p className="font-medium">{viewEmployee.NOME}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{viewEmployee.CPF}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">RG</p>
                <p className="font-medium">{viewEmployee.RG || "-"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium">{viewEmployee.EMAIL}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{viewEmployee.TELEFONE || "-"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Data de Nascimento
                </p>
                <p className="font-medium">
                  {new Date(viewEmployee.DATA_NASCIMENTO).toLocaleDateString(
                    "pt-BR",
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Data de Admissão
                </p>
                <p className="font-medium">
                  {new Date(viewEmployee.DATA_ADMISSAO).toLocaleDateString(
                    "pt-BR",
                  )}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Departamento</p>
                <p className="font-medium">
                  {viewEmployee.DEPARTAMENTO?.NOME || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cargo</p>
                <p className="font-medium">{viewEmployee.CARGO?.NOME || "-"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gestor</p>
              <p className="font-medium">{viewEmployee.GESTOR?.NOME || "-"}</p>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </FormModal>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Excluir Funcionário"
        description={`Tem certeza que deseja excluir o funcionário "${employeeToDelete?.NOME}"? Esta ação não pode ser desfeita.`}
        onConfirm={() =>
          employeeToDelete && deleteMutation.mutate(employeeToDelete.ID)
        }
        isLoading={deleteMutation.isPending}
        confirmText="Excluir"
      />
    </div>
  );
}
