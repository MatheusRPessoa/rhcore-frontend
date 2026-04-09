"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldMessage } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import type { Department, CreateDepartmentData, UpdateDepartmentData } from "@/lib/types"

const departmentSchema = z.object({
  NOME: z.string().min(1, "Nome é obrigatório"),
  DESCRICAO: z.string().optional(),
  STATUS: z.enum(["ATIVO", "INATIVO"]).optional(),
})

type DepartmentFormData = z.infer<typeof departmentSchema>

interface DepartmentFormProps {
  department?: Department
  onSubmit: (data: CreateDepartmentData | UpdateDepartmentData) => Promise<void>
  isSubmitting: boolean
  onCancel: () => void
}

export function DepartmentForm({ department, onSubmit, isSubmitting, onCancel }: DepartmentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      NOME: department?.NOME || "",
      DESCRICAO: department?.DESCRICAO || "",
      STATUS: department?.STATUS || "ATIVO",
    },
  })

  const handleFormSubmit = async (data: DepartmentFormData) => {
    const payload: CreateDepartmentData | UpdateDepartmentData = {
      NOME: data.NOME,
      DESCRICAO: data.DESCRICAO || undefined,
    }

    if (department && data.STATUS) {
      (payload as UpdateDepartmentData).STATUS = data.STATUS
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="NOME">Nome *</FieldLabel>
          <Input id="NOME" {...register("NOME")} />
          {errors.NOME && <FieldMessage variant="error">{errors.NOME.message}</FieldMessage>}
        </Field>

        <Field>
          <FieldLabel htmlFor="DESCRICAO">Descrição</FieldLabel>
          <Textarea id="DESCRICAO" {...register("DESCRICAO")} rows={3} />
        </Field>

        {department && (
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select
              value={watch("STATUS")}
              onValueChange={(value) => setValue("STATUS", value as "ATIVO" | "INATIVO")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="INATIVO">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
            {department ? "Salvar" : "Criar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
