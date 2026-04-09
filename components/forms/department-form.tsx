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
  Department,
  CreateDepartmentData,
  UpdateDepartmentData,
} from "@/lib/types";
import { departmentsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const departmentSchema = z.object({
  NOME: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  SIGLA: z
    .string()
    .min(2, "Sigla é obrigatória")
    .max(10, "Sigla deve ter no máximo 10 caracteres"),
  DESCRICAO: z
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres")
    .optional(),
  DEPARTAMENTO_PAI_ID: z
    .string()
    .uuid("ID do departamento pai é inválido")
    .optional(),
  STATUS: z.enum(["ATIVO", "INATIVO"]).optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  department?: Department;
  onSubmit: (
    data: CreateDepartmentData | UpdateDepartmentData,
  ) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function DepartmentForm({
  department,
  onSubmit,
  isSubmitting,
  onCancel,
}: DepartmentFormProps) {
  const { data: departmentsResponse } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.getAll(),
  });

  const departments =
    departmentsResponse?.data.filter(
      (d) => d.STATUS === "ATIVO" && d.ID !== department?.ID,
    ) || [];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      NOME: department?.NOME || "",
      SIGLA: department?.SIGLA || "",
      DESCRICAO: department?.DESCRICAO || "",
      DEPARTAMENTO_PAI_ID: department?.DEPARTAMENTO_PAI?.ID || "",
      STATUS: department?.STATUS || "ATIVO",
    },
  });

  const departamentoPaiId = useWatch({ control, name: "DEPARTAMENTO_PAI_ID" });
  const status = useWatch({ control, name: "STATUS" });

  const handleFormSubmit = async (data: DepartmentFormData) => {
    const payload: CreateDepartmentData | UpdateDepartmentData = {
      NOME: data.NOME,
      DESCRICAO: data.DESCRICAO || undefined,
      DEPARTAMENTO_PAI_ID: data.DEPARTAMENTO_PAI_ID || undefined,
    };

    if (department && data.STATUS) {
      (payload as UpdateDepartmentData).STATUS = data.STATUS;
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="NOME">Nome *</FieldLabel>
            <Input id="NOME" {...register("NOME")} />
            {errors.NOME && (
              <FieldMessage variant="error">{errors.NOME.message}</FieldMessage>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="SIGLA">Sigla *</FieldLabel>
            <Input id="SIGLA" {...register("SIGLA")} />
            {errors.SIGLA && (
              <FieldMessage variant="error">
                {errors.SIGLA.message}
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
          <FieldLabel htmlFor="DEPARTAMENTO_PAI_ID">
            Departamento Pai
          </FieldLabel>
          <Select
            value={departamentoPaiId}
            onValueChange={(value) => setValue("DEPARTAMENTO_PAI_ID", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Nenhum (raiz)" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.ID} value={dept.ID}>
                  {dept.NOME}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.DEPARTAMENTO_PAI_ID && (
            <FieldMessage variant="error">
              {errors.DEPARTAMENTO_PAI_ID.message}
            </FieldMessage>
          )}
        </Field>

        {department && (
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
            {department ? "Salvar" : "Criar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
