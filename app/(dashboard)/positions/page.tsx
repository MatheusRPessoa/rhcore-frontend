"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { FormModal } from "@/components/form-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { PositionForm } from "@/components/forms/position-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { positionsApi } from "@/lib/api"
import type { Position, CreatePositionData, UpdatePositionData } from "@/lib/types"

export default function PositionsPage() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | undefined>()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["positions"],
    queryFn: () => positionsApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreatePositionData) => positionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] })
      setIsFormOpen(false)
      toast.success("Cargo criado com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao criar cargo")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePositionData }) =>
      positionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] })
      setIsFormOpen(false)
      setSelectedPosition(undefined)
      toast.success("Cargo atualizado com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao atualizar cargo")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => positionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] })
      setIsDeleteOpen(false)
      setPositionToDelete(null)
      toast.success("Cargo excluído com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao excluir cargo")
    },
  })

  const handleSubmit = async (formData: CreatePositionData | UpdatePositionData) => {
    if (selectedPosition) {
      await updateMutation.mutateAsync({ id: selectedPosition.ID, data: formData })
    } else {
      await createMutation.mutateAsync(formData as CreatePositionData)
    }
  }

  const openCreateForm = () => {
    setSelectedPosition(undefined)
    setIsFormOpen(true)
  }

  const openEditForm = (position: Position) => {
    setSelectedPosition(position)
    setIsFormOpen(true)
  }

  const openDeleteDialog = (position: Position) => {
    setPositionToDelete(position)
    setIsDeleteOpen(true)
  }

  const columns: ColumnDef<Position>[] = [
    {
      accessorKey: "NOME",
      header: "Nome",
    },
    {
      accessorKey: "DESCRICAO",
      header: "Descrição",
      cell: ({ row }) => row.original.DESCRICAO || "-",
    },
    {
      accessorKey: "STATUS",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.STATUS} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const position = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditForm(position)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(position)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const positions = data?.data || []

  return (
    <div>
      <PageHeader
        title="Cargos"
        description="Gerencie os cargos da empresa"
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cargo
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
          data={positions}
          searchKey="NOME"
          searchPlaceholder="Buscar por nome..."
        />
      )}

      <FormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedPosition ? "Editar Cargo" : "Novo Cargo"}
        description={selectedPosition ? "Atualize os dados do cargo" : "Preencha os dados do novo cargo"}
      >
        <PositionForm
          position={selectedPosition}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Excluir Cargo"
        description={`Tem certeza que deseja excluir o cargo "${positionToDelete?.NOME}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => positionToDelete && deleteMutation.mutate(positionToDelete.ID)}
        isLoading={deleteMutation.isPending}
        confirmText="Excluir"
      />
    </div>
  )
}
