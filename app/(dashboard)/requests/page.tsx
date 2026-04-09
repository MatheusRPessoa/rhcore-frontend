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
import { RequestForm } from "@/components/forms/request-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { requestsApi } from "@/lib/api";
import type {
  HRRequest,
  CreateRequestData,
  UpdateRequestData,
} from "@/lib/types";

export default function RequestsPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<
    HRRequest | undefined
  >();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<HRRequest | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: () => requestsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateRequestData) => requestsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      setIsFormOpen(false);
      toast.success("Solicitação criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar solicitação");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRequestData }) =>
      requestsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      setIsFormOpen(false);
      setSelectedRequest(undefined);
      toast.success("Solicitação atualizada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar solicitação");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => requestsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      setIsDeleteOpen(false);
      setRequestToDelete(null);
      toast.success("Solicitação excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir solicitação");
    },
  });

  const handleSubmit = async (
    formData: CreateRequestData | UpdateRequestData,
  ) => {
    if (selectedRequest) {
      await updateMutation.mutateAsync({
        id: selectedRequest.ID,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData as CreateRequestData);
    }
  };

  const openCreateForm = () => {
    setSelectedRequest(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (request: HRRequest) => {
    setSelectedRequest(request);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (request: HRRequest) => {
    setRequestToDelete(request);
    setIsDeleteOpen(true);
  };

  const columns: ColumnDef<HRRequest>[] = [
    {
      accessorKey: "FUNCIONARIO",
      header: "Funcionário",
      cell: ({ row }) => row.original.FUNCIONARIO?.NOME || "-",
    },
    {
      accessorKey: "TIPO",
      header: "Tipo",
      cell: ({ row }) => <StatusBadge status={row.original.TIPO} />,
    },
    {
      accessorKey: "DESCRICAO",
      header: "Descrição",
      cell: ({ row }) => (
        <span className="truncate max-w-[200px] block">
          {row.original.DESCRICAO}
        </span>
      ),
    },
    {
      accessorKey: "DATA_SOLICITACAO",
      header: "Data Solicitação",
      cell: ({ row }) =>
        new Date(row.original.DATA_SOLICITACAO).toLocaleDateString("pt-BR"),
    },
    {
      accessorKey: "DATA_RESPOSTA",
      header: "Data Resposta",
      cell: ({ row }) =>
        row.original.DATA_RESPOSTA
          ? new Date(row.original.DATA_RESPOSTA).toLocaleDateString("pt-BR")
          : "-",
    },
    {
      accessorKey: "APROVADO_POR",
      header: "Aprovado Por",
      cell: ({ row }) => row.original.APROVADO_POR?.NOME || "-",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const request = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditForm(request)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(request)}
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

  const requests = data?.data || [];

  return (
    <div>
      <PageHeader
        title="Solicitações"
        description="Gerencie as solicitações de RH"
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
          columns={columns}
          data={requests}
          searchKey="FUNCIONARIO"
          searchPlaceholder="Buscar por funcionário..."
        />
      )}

      <FormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedRequest ? "Editar Solicitação" : "Nova Solicitação"}
        description={
          selectedRequest
            ? "Atualize os dados da solicitação"
            : "Preencha os dados da nova solicitação"
        }
      >
        <RequestForm
          request={selectedRequest}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Excluir Solicitação"
        description={`Tem certeza que deseja excluir esta solicitação de "${requestToDelete?.FUNCIONARIO?.NOME}"? Esta ação não pode ser desfeita.`}
        onConfirm={() =>
          requestToDelete && deleteMutation.mutate(requestToDelete.ID)
        }
        isLoading={deleteMutation.isPending}
        confirmText="Excluir"
      />
    </div>
  );
}
