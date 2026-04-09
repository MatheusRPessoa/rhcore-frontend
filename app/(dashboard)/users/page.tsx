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
import { UserForm } from "@/components/forms/user-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { usersApi } from "@/lib/api"
import type { SystemUser, CreateUserData, UpdateUserData } from "@/lib/types"

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SystemUser | undefined>()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateUserData) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsFormOpen(false)
      toast.success("Usuário criado com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao criar usuário")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserData }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsFormOpen(false)
      setSelectedUser(undefined)
      toast.success("Usuário atualizado com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao atualizar usuário")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsDeleteOpen(false)
      setUserToDelete(null)
      toast.success("Usuário excluído com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao excluir usuário")
    },
  })

  const handleSubmit = async (formData: CreateUserData | UpdateUserData) => {
    if (selectedUser) {
      await updateMutation.mutateAsync({ id: selectedUser.ID, data: formData as UpdateUserData })
    } else {
      await createMutation.mutateAsync(formData as CreateUserData)
    }
  }

  const openCreateForm = () => {
    setSelectedUser(undefined)
    setIsFormOpen(true)
  }

  const openEditForm = (user: SystemUser) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const openDeleteDialog = (user: SystemUser) => {
    setUserToDelete(user)
    setIsDeleteOpen(true)
  }

  const columns: ColumnDef<SystemUser>[] = [
    {
      accessorKey: "USERNAME",
      header: "Usuário",
    },
    {
      accessorKey: "STATUS",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.STATUS} />,
    },
    {
      accessorKey: "CREATED_AT",
      header: "Criado em",
      cell: ({ row }) => new Date(row.original.CREATED_AT).toLocaleDateString("pt-BR"),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditForm(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(user)}
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

  const users = data?.data || []

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Gerencie os usuários do sistema"
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
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
          data={users}
          searchKey="USERNAME"
          searchPlaceholder="Buscar por usuário..."
        />
      )}

      <FormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedUser ? "Editar Usuário" : "Novo Usuário"}
        description={selectedUser ? "Atualize os dados do usuário" : "Preencha os dados do novo usuário"}
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Excluir Usuário"
        description={`Tem certeza que deseja excluir o usuário "${userToDelete?.USERNAME}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => userToDelete && deleteMutation.mutate(userToDelete.ID)}
        isLoading={deleteMutation.isPending}
        confirmText="Excluir"
      />
    </div>
  )
}
