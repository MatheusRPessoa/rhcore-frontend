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
import { DepartmentForm } from "@/components/forms/department-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { departmentsApi } from "@/lib/api"
import type { Department, CreateDepartmentData, UpdateDepartmentData } from "@/lib/types"

export default function DepartmentsPage() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentData) => departmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] })
      setIsFormOpen(false)
      toast.success("Departamento criado com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao criar departamento")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDepartmentData }) =>
      departmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] })
      setIsFormOpen(false)
      setSelectedDepartment(undefined)
      toast.success("Departamento atualizado com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao atualizar departamento")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => departmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] })
      setIsDeleteOpen(false)
      setDepartmentToDelete(null)
      toast.success("Departamento excluído com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao excluir departamento")
    },
  })

  const handleSubmit = async (formData: CreateDepartmentData | UpdateDepartmentData) => {
    if (selectedDepartment) {
      await updateMutation.mutateAsync({ id: selectedDepartment.ID, data: formData })
    } else {
      await createMutation.mutateAsync(formData as CreateDepartmentData)
    }
  }

  const openCreateForm = () => {
    setSelectedDepartment(undefined)
    setIsFormOpen(true)
  }

  const openEditForm = (department: Department) => {
    setSelectedDepartment(department)
    setIsFormOpen(true)
  }

  const openDeleteDialog = (department: Department) => {
    setDepartmentToDelete(department)
    setIsDeleteOpen(true)
  }

  const columns: ColumnDef<Department>[] = [
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
        const department = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditForm(department)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(department)}
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

  const departments = data?.data || []

  return (
    <div>
      <PageHeader
        title="Departamentos"
        description="Gerencie os departamentos da empresa"
      >
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Departamento
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
          data={departments}
          searchKey="NOME"
          searchPlaceholder="Buscar por nome..."
        />
      )}

      <FormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedDepartment ? "Editar Departamento" : "Novo Departamento"}
        description={selectedDepartment ? "Atualize os dados do departamento" : "Preencha os dados do novo departamento"}
      >
        <DepartmentForm
          department={selectedDepartment}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Excluir Departamento"
        description={`Tem certeza que deseja excluir o departamento "${departmentToDelete?.NOME}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => departmentToDelete && deleteMutation.mutate(departmentToDelete.ID)}
        isLoading={deleteMutation.isPending}
        confirmText="Excluir"
      />
    </div>
  )
}
