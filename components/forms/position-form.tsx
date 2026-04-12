"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldMessage,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type {
  Position,
  CreatePositionData,
  UpdatePositionData,
} from "@/lib/types";
import { departmentsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const positionSchema = z.object({
  NOME: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  DESCRICAO: z
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres")
    .optional(),
  NIVEL: z
    .string()
    .max(50, "Nível deve ter no máximo 50 caracteres")
    .optional(),
  SALARIO_BASE: z.coerce
    .number({ invalid_type_error: "Salário base deve ser um número" })
    .positive("Salário base deve ser positivo")
    .optional()
    .or(z.literal(0).transform(() => undefined)),
  DEPARTAMENTO_ID: z.string().optional(),
  STATUS: z.enum(["ATIVO", "INATIVO"]).optional(),
});

type PositionFormData = z.infer<typeof positionSchema>;

interface PositionFormProps {
  position?: Position;
  onSubmit: (data: CreatePositionData | UpdatePositionData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function PositionForm({
  position,
  onSubmit,
  isSubmitting,
  onCancel,
}: PositionFormProps) {
  const { data: departmentsResponse } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.getAll(),
  });

  const departaments =
    departmentsResponse?.data?.filter(
      (department) => department.STATUS === "ATIVO",
    ) || [];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<PositionFormData>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      NOME: position?.NOME || "",
      DESCRICAO: position?.DESCRICAO || "",
      NIVEL: position?.NIVEL || "",
      SALARIO_BASE: position?.SALARIO_BASE || undefined,
      DEPARTAMENTO_ID: position?.DEPARTAMENTO_ID || "",
      STATUS: position?.STATUS === "INATIVO" ? "INATIVO" : "ATIVO",
    },
  });

  const status = useWatch({ control, name: "STATUS" });
  const departamentoId = useWatch({ control, name: "DEPARTAMENTO_ID" });

  const handleFormSubmit = async (
    data: ReturnType<typeof positionSchema.parse>,
  ) => {
    const payload: CreatePositionData | UpdatePositionData = {
      NOME: data.NOME,
      DESCRICAO: data.DESCRICAO || undefined,
      NIVEL: data.NIVEL || undefined,
      SALARIO_BASE: data.SALARIO_BASE || undefined,
      DEPARTAMENTO_ID:
        !data.DEPARTAMENTO_ID || data.DEPARTAMENTO_ID === "none"
          ? undefined
          : data.DEPARTAMENTO_ID,
    };

    if (position && data.STATUS) {
      (payload as UpdatePositionData).STATUS = data.STATUS;
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="NOME">Nome *</FieldLabel>
          <Input id="NOME" {...register("NOME")} />
          {errors.NOME && (
            <FieldMessage variant="error">{errors.NOME.message}</FieldMessage>
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4">
          <Field>
            <FieldLabel htmlFor="NIVEL">Nível</FieldLabel>
            <Input id="NIVEL" {...register("NIVEL")} />
            {errors.NIVEL && (
              <FieldMessage variant="error">
                {errors.NIVEL.message}
              </FieldMessage>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="SALARIO_BASE">Salário Base</FieldLabel>
            <Input
              id="SALARIO_BASE"
              type="number"
              step="0.01"
              {...register("SALARIO_BASE")}
            />
            {errors.SALARIO_BASE && (
              <FieldMessage variant="error">
                {errors.SALARIO_BASE.message}
              </FieldMessage>
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="DESCRICAO">Descrição</FieldLabel>
          <Textarea
            id="DESCRICAO"
            {...register("DESCRICAO")}
            rows={3}
            maxLength={255}
          />
          {errors.DESCRICAO && (
            <FieldMessage variant="error">
              {errors.DESCRICAO.message}
            </FieldMessage>
          )}
        </Field>
        <Field>
          <FieldLabel>Departamento</FieldLabel>
          <Select
            value={departamentoId}
            onValueChange={(value) => setValue("DEPARTAMENTO_ID", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {departaments.map((department) => (
                <SelectItem key={department.ID} value={department.ID}>
                  {department.NOME}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {position && (
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select
              value={status}
              onValueChange={(value) =>
                setValue("STATUS", value as "ATIVO" | "INATIVO")
              }
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
            {position ? "Salvar" : "Criar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
