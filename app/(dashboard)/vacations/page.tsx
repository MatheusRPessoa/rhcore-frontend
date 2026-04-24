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
import { VacationForm } from "@/components/forms/vacation-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { vacationsApi } from "@/lib/api";
import type {
  Vacation,
  CreateVacationData,
  UpdateVacationData,
  VacationStatus,
} from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";

export default function VacationsPage() {
  const { user, role, hasAppPermission } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVacation, setSelectedVacation] = useState<
    Vacation | undefined
  >();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [vacationToDelete, setVacationToDelete] = useState<Vacation | null>(
    null,
  );
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [vacationToApprove, setVacationToApprove] = useState<Vacation | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["vacations"],
    queryFn: () => vacationsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateVacationData) => vacationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
      setIsFormOpen(false);
      toast.success("Férias registradas com sucesso!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Erro ao registrar férias");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVacationData }) =>
      vacationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
      setIsFormOpen(false);
      setSelectedVacation(undefined);
      toast.success("Férias atualizadas com sucesso!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Erro ao atualizar férias");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vacationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
      setIsDeleteOpen(false);
      setVacationToDelete(null);
      toast.success("Férias excluídas com sucesso!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Erro ao excluir férias");
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVacationData }) =>
      vacationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
      setIsApproveOpen(false);
      setVacationToApprove(null);
      toast.success("Férias aprovadas com sucesso!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Erro ao aprovar férias");
    },
  });

  const handleSubmit = async (
    formData: CreateVacationData | UpdateVacationData,
  ) => {
    try {
      if (selectedVacation) {
        await updateMutation.mutateAsync({
          id: selectedVacation.ID,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData as CreateVacationData);
      }
    } catch {
      // tratado pelo onError da mutation
    }
  };

  const openCreateForm = () => {
    setSelectedVacation(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (vacation: Vacation) => {
    setSelectedVacation(vacation);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (vacation: Vacation) => {
    setVacationToDelete(vacation);
    setIsDeleteOpen(true);
  };

  const openApproveDialog = (vacation: Vacation) => {
    setVacationToApprove(vacation);
    setIsApproveOpen(true);
  };

  const columns: ColumnDef<Vacation>[] = [
    {
      accessorKey: "FUNCIONARIO",
      header: "Funcionário",
      cell: ({ row }) => row.original.FUNCIONARIO?.NOME || "-",
    },
    {
      accessorKey: "DATA_INICIO",
      header: "Data Início",
      cell: ({ row }) =>
        new Date(row.original.DATA_INICIO).toLocaleDateString("pt-BR"),
    },
    {
      accessorKey: "DATA_FIM",
      header: "Data Fim",
      cell: ({ row }) =>
        new Date(row.original.DATA_FIM).toLocaleDateString("pt-BR"),
    },
    {
      accessorKey: "DIAS_SOLICITADOS",
      header: "Dias",
    },
    {
      accessorKey: "STATUS_FERIAS",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.STATUS_FERIAS} />,
    },
    {
      accessorKey: "APROVADO_POR",
      header: "Aprovado Por",
      cell: ({ row }) => row.original.APROVADO_POR?.NOME_USUARIO || "-",
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const vacation = row.original;
        const isOwnVacation = vacation.FUNCIONARIO_ID === user?.FUNCIONARIO_ID;
        const canApprove =
          hasAppPermission("APPROVE_VACATIONS") && !isOwnVacation;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditForm(vacation)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(vacation)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
              {canApprove && (
                <DropdownMenuItem
                  onClick={() => openApproveDialog(vacation)}
                  className="text-green-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprovar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  const visibleColumns = hasAppPermission("APPROVE_VACATIONS")
    ? columns
    : columns.filter((col) => col.id !== "actions");

  const vacations = data?.data || [];

  return (
    <div>
      <PageHeader
        title="Férias"
        description="Gerencie as solicitações de férias dos funcionários"
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Solicitação
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <DataTable
          columns={visibleColumns}
          data={vacations}
          searchKey="FUNCIONARIO"
          searchPlaceholder="Buscar por funcionário..."
        />
      )}

      <FormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={
          selectedVacation ? "Editar Férias" : "Nova Solicitação de Férias"
        }
        description={
          selectedVacation
            ? "Atualize os dados das férias"
            : "Preencha os dados da solicitação"
        }
      >
        <VacationForm
          vacation={selectedVacation}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setIsFormOpen(false)}
          role={role ?? undefined}
          employeeId={user?.FUNCIONARIO_ID}
        />
      </FormModal>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Excluir Férias"
        description={`Tem certeza que deseja excluir esta solicitação de férias de "${vacationToDelete?.FUNCIONARIO?.NOME}"? Esta ação não pode ser desfeita.`}
        onConfirm={() =>
          vacationToDelete && deleteMutation.mutate(vacationToDelete.ID)
        }
        isLoading={deleteMutation.isPending}
        confirmText="Excluir"
      />

      <ConfirmDialog
        open={isApproveOpen}
        onOpenChange={setIsApproveOpen}
        title="Aprovar Férias"
        description={`Tem certeza que deseja aprovar esta solicitação de férias de "${vacationToApprove?.FUNCIONARIO?.NOME}"?`}
        onConfirm={() =>
          vacationToApprove &&
          approveMutation.mutate({
            id: vacationToApprove.ID,
            data: {
              STATUS_FERIAS: "APROVADO" as VacationStatus,
              DATA_APROVACAO: new Date().toISOString(),
              APROVADO_POR_ID: user?.ID,
            },
          })
        }
        isLoading={approveMutation.isPending}
        confirmText="Aprovar"
        variant="default"
      />
    </div>
  );
}
