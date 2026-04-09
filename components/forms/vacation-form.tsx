"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery } from "@tanstack/react-query"
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
import { employeesApi } from "@/lib/api"
import type { Vacation, CreateVacationData, UpdateVacationData, VacationStatus } from "@/lib/types"

const vacationSchema = z.object({
  FUNCIONARIO_ID: z.string().min(1, "Funcionário é obrigatório"),
  DATA_INICIO: z.string().min(1, "Data de início é obrigatória"),
  DATA_FIM: z.string().min(1, "Data de fim é obrigatória"),
  OBSERVACAO: z.string().max(500, "Máximo de 500 caracteres").optional(),
  STATUS_FERIAS: z.enum(["PENDENTE", "APROVADO", "REJEITADO", "CANCELADO"]).optional(),
  APROVADO_POR_ID: z.string().optional(),
  DATA_APROVACAO: z.string().optional(),
})

type VacationFormData = z.infer<typeof vacationSchema>

interface VacationFormProps {
  vacation?: Vacation
  onSubmit: (data: CreateVacationData | UpdateVacationData) => Promise<void>
  isSubmitting: boolean
  onCancel: () => void
}

export function VacationForm({ vacation, onSubmit, isSubmitting, onCancel }: VacationFormProps) {
  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeesApi.getAll(),
  })

  const employees = employeesData?.data?.filter(e => e.STATUS === "ATIVO") || []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VacationFormData>({
    resolver: zodResolver(vacationSchema),
    defaultValues: {
      FUNCIONARIO_ID: vacation?.FUNCIONARIO_ID?.toString() || "",
      DATA_INICIO: vacation?.DATA_INICIO?.split("T")[0] || "",
      DATA_FIM: vacation?.DATA_FIM?.split("T")[0] || "",
      OBSERVACAO: vacation?.OBSERVACAO || "",
      STATUS_FERIAS: vacation?.STATUS_FERIAS || "PENDENTE",
      APROVADO_POR_ID: vacation?.APROVADO_POR_ID?.toString() || "",
      DATA_APROVACAO: vacation?.DATA_APROVACAO?.split("T")[0] || "",
    },
  })

  const handleFormSubmit = async (data: VacationFormData) => {
    const payload: CreateVacationData | UpdateVacationData = {
      FUNCIONARIO_ID: Number(data.FUNCIONARIO_ID),
      DATA_INICIO: data.DATA_INICIO,
      DATA_FIM: data.DATA_FIM,
      OBSERVACAO: data.OBSERVACAO || undefined,
    }

    if (vacation) {
      const updatePayload = payload as UpdateVacationData
      updatePayload.STATUS_FERIAS = data.STATUS_FERIAS as VacationStatus
      if (data.APROVADO_POR_ID) {
        updatePayload.APROVADO_POR_ID = Number(data.APROVADO_POR_ID)
      }
      if (data.DATA_APROVACAO) {
        updatePayload.DATA_APROVACAO = data.DATA_APROVACAO
      }
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel>Funcionário *</FieldLabel>
          <Select
            value={watch("FUNCIONARIO_ID")}
            onValueChange={(value) => setValue("FUNCIONARIO_ID", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um funcionário..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.ID} value={emp.ID.toString()}>
                  {emp.NOME}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.FUNCIONARIO_ID && <FieldMessage variant="error">{errors.FUNCIONARIO_ID.message}</FieldMessage>}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="DATA_INICIO">Data de Início *</FieldLabel>
            <Input id="DATA_INICIO" type="date" {...register("DATA_INICIO")} />
            {errors.DATA_INICIO && <FieldMessage variant="error">{errors.DATA_INICIO.message}</FieldMessage>}
          </Field>

          <Field>
            <FieldLabel htmlFor="DATA_FIM">Data de Fim *</FieldLabel>
            <Input id="DATA_FIM" type="date" {...register("DATA_FIM")} />
            {errors.DATA_FIM && <FieldMessage variant="error">{errors.DATA_FIM.message}</FieldMessage>}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="OBSERVACAO">Observação</FieldLabel>
          <Textarea
            id="OBSERVACAO"
            {...register("OBSERVACAO")}
            rows={3}
            maxLength={500}
            placeholder="Máximo de 500 caracteres"
          />
          {errors.OBSERVACAO && <FieldMessage variant="error">{errors.OBSERVACAO.message}</FieldMessage>}
        </Field>

        {vacation && (
          <>
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Select
                value={watch("STATUS_FERIAS")}
                onValueChange={(value) => setValue("STATUS_FERIAS", value as VacationStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="APROVADO">Aprovado</SelectItem>
                  <SelectItem value="REJEITADO">Rejeitado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Aprovado Por</FieldLabel>
              <Select
                value={watch("APROVADO_POR_ID")}
                onValueChange={(value) => setValue("APROVADO_POR_ID", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.ID} value={emp.ID.toString()}>
                      {emp.NOME}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="DATA_APROVACAO">Data de Aprovação</FieldLabel>
              <Input id="DATA_APROVACAO" type="date" {...register("DATA_APROVACAO")} />
            </Field>
          </>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
            {vacation ? "Salvar" : "Criar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
