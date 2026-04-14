"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { departmentsApi, positionsApi, employeesApi } from "@/lib/api";
import type {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
} from "@/lib/types";

const employeeSchema = z.object({
  MATRICULA: z.string().min(1, "Matrícula é obrigatória"),
  NOME: z.string().min(1, "Nome é obrigatório"),
  CPF: z
    .string()
    .min(1, "CPF é obrigatório")
    .regex(
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      "CPF deve estar no formato 000.000.000-00",
    ),
  RG: z.string().optional(),
  DATA_NASCIMENTO: z.string().min(1, "Data de nascimento é obrigatória"),
  EMAIL: z.string().email("E-mail inválido"),
  TELEFONE: z.string().optional(),
  DATA_ADMISSAO: z.string().min(1, "Data de admissão é obrigatória"),
  DEPARTAMENTO_ID: z.string().optional(),
  CARGO_ID: z.string().optional(),
  GESTOR_ID: z.string().optional(),
  STATUS: z.enum(["ATIVO", "INATIVO"]).optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: CreateEmployeeData | UpdateEmployeeData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function EmployeeForm({
  employee,
  onSubmit,
  isSubmitting,
  onCancel,
}: EmployeeFormProps) {
  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.getAll(),
  });

  const { data: positionsData } = useQuery({
    queryKey: ["positions"],
    queryFn: () => positionsApi.getAll(),
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeesApi.getAll(),
  });

  const departments =
    departmentsData?.data?.filter((d) => d.STATUS === "ATIVO") || [];
  const positions =
    positionsData?.data?.filter((p) => p.STATUS === "ATIVO") || [];
  const employees =
    employeesData?.data?.filter(
      (e) => e.STATUS === "ATIVO" && e.ID !== employee?.ID,
    ) || [];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      MATRICULA: employee?.MATRICULA || "",
      NOME: employee?.NOME || "",
      CPF: employee?.CPF || "",
      RG: employee?.RG || "",
      DATA_NASCIMENTO: employee?.DATA_NASCIMENTO?.split("T")[0] || "",
      EMAIL: employee?.EMAIL || "",
      TELEFONE: employee?.TELEFONE || "",
      DATA_ADMISSAO: employee?.DATA_ADMISSAO?.split("T")[0] || "",
      DEPARTAMENTO_ID: employee?.DEPARTAMENTO_ID?.toString() || "",
      CARGO_ID: employee?.CARGO_ID?.toString() || "",
      GESTOR_ID: employee?.GESTOR_ID?.toString() || "",
      STATUS: employee?.STATUS || "ATIVO",
    },
  });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6)
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const departamentoId = useWatch({ control, name: "DEPARTAMENTO_ID" });
  const cargoId = useWatch({ control, name: "CARGO_ID" });
  const gestorId = useWatch({ control, name: "GESTOR_ID" });
  const status = useWatch({ control, name: "STATUS" });

  const handleFormSubmit = async (data: EmployeeFormData) => {
    const payload: CreateEmployeeData | UpdateEmployeeData = {
      MATRICULA: data.MATRICULA,
      NOME: data.NOME,
      CPF: data.CPF,
      RG: data.RG || undefined,
      DATA_NASCIMENTO: data.DATA_NASCIMENTO,
      EMAIL: data.EMAIL,
      TELEFONE: data.TELEFONE || undefined,
      DATA_ADMISSAO: data.DATA_ADMISSAO,
      DEPARTAMENTO_ID: data.DEPARTAMENTO_ID || undefined,
      CARGO_ID: data.CARGO_ID || undefined,
      GESTOR_ID: data.GESTOR_ID || undefined,
    };

    if (employee && data.STATUS) {
      (payload as UpdateEmployeeData).STATUS = data.STATUS;
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="MATRICULA">Matrícula *</FieldLabel>
            <Input id="MATRICULA" {...register("MATRICULA")} />
            {errors.MATRICULA && (
              <FieldMessage variant="error">
                {errors.MATRICULA.message}
              </FieldMessage>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="CPF">CPF *</FieldLabel>
            <Input
              id="CPF"
              {...register("CPF")}
              onChange={(e) => {
                const formatted = formatCPF(e.target.value);
                setValue("CPF", formatted);
              }}
              placeholder="000.000.000-00"
              maxLength={14}
            />
            {errors.CPF && (
              <FieldMessage variant="error">{errors.CPF.message}</FieldMessage>
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="NOME">Nome Completo *</FieldLabel>
          <Input id="NOME" {...register("NOME")} />
          {errors.NOME && (
            <FieldMessage variant="error">{errors.NOME.message}</FieldMessage>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="RG">RG</FieldLabel>
            <Input id="RG" {...register("RG")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="DATA_NASCIMENTO">
              Data de Nascimento *
            </FieldLabel>
            <Input
              id="DATA_NASCIMENTO"
              type="date"
              {...register("DATA_NASCIMENTO")}
            />
            {errors.DATA_NASCIMENTO && (
              <FieldMessage variant="error">
                {errors.DATA_NASCIMENTO.message}
              </FieldMessage>
            )}
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="EMAIL">E-mail *</FieldLabel>
            <Input id="EMAIL" type="email" {...register("EMAIL")} />
            {errors.EMAIL && (
              <FieldMessage variant="error">
                {errors.EMAIL.message}
              </FieldMessage>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="TELEFONE">Telefone</FieldLabel>
            <Input
              id="TELEFONE"
              {...register("TELEFONE")}
              placeholder="(00) 00000-0000"
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="DATA_ADMISSAO">Data de Admissão *</FieldLabel>
          <Input
            id="DATA_ADMISSAO"
            type="date"
            {...register("DATA_ADMISSAO")}
          />
          {errors.DATA_ADMISSAO && (
            <FieldMessage variant="error">
              {errors.DATA_ADMISSAO.message}
            </FieldMessage>
          )}
        </Field>

        <Field>
          <FieldLabel>Departamento</FieldLabel>
          <Select
            value={departamentoId}
            onValueChange={(value) => setValue("DEPARTAMENTO_ID", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.ID} value={dept.ID.toString()}>
                  {dept.NOME}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Cargo</FieldLabel>
          <Select
            value={cargoId}
            onValueChange={(value) => setValue("CARGO_ID", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {positions.map((pos) => (
                <SelectItem key={pos.ID} value={pos.ID.toString()}>
                  {pos.NOME}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Gestor</FieldLabel>
          <Select
            value={gestorId}
            onValueChange={(value) => setValue("GESTOR_ID", value)}
          >
            <SelectTrigger className="w-full">
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

        {employee && (
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select
              value={status}
              onValueChange={(value) =>
                setValue("STATUS", value as "ATIVO" | "INATIVO")
              }
            >
              <SelectTrigger className="w-full">
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
            {employee ? "Salvar" : "Criar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
