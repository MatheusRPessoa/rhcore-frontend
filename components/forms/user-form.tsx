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
import { employeesApi } from "@/lib/api";
import type {
  SystemUser,
  CreateUserData,
  UpdateUserData,
  UserRole,
  Employee,
} from "@/lib/types";

const userSchema = z.object({
  NOME_USUARIO: z.string().min(1, "O Nome do usuário é obrigatório"),
  SENHA: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .optional()
    .or(z.literal("")),
  STATUS: z.enum(["ATIVO", "INATIVO"]).optional(),
  ROLE: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
  FUNCIONARIO_ID: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: SystemUser;
  onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function UserForm({
  user,
  onSubmit,
  isSubmitting,
  onCancel,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(
      user
        ? userSchema.extend({
            SENHA: z
              .string()
              .min(6, "Senha deve ter no mínimo 6 caracteres")
              .optional()
              .or(z.literal("")),
          })
        : userSchema.extend({
            SENHA: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
          }),
    ),
    defaultValues: {
      NOME_USUARIO: user?.NOME_USUARIO || "",
      SENHA: "",
      STATUS: user?.STATUS || "ATIVO",
      ROLE: user?.ROLE || "EMPLOYEE",
      FUNCIONARIO_ID: user?.FUNCIONARIO_ID || "",
    },
  });

  const status = useWatch({ control, name: "STATUS" });
  const role = useWatch({ control, name: "ROLE" });
  const funcionarioId = useWatch({ control, name: "FUNCIONARIO_ID" });

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeesApi.getAll(),
  });
  const employees: Employee[] =
    employeesData?.data?.filter((e) => e.STATUS === "ATIVO") || [];

  const handleFormSubmit = async (formValues: UserFormData) => {
    if (user) {
      const payload: UpdateUserData = {
        NOME_USUARIO: formValues.NOME_USUARIO,
        STATUS: formValues.STATUS,
        ROLE: formValues.ROLE,
        FUNCIONARIO_ID: formValues.FUNCIONARIO_ID,
      };
      if (formValues.SENHA) {
        payload.SENHA = formValues.SENHA;
      }
      await onSubmit(payload);
    } else {
      await onSubmit({
        NOME_USUARIO: formValues.NOME_USUARIO,
        SENHA: formValues.SENHA!,
        ROLE: formValues.ROLE,
        FUNCIONARIO_ID: formValues.FUNCIONARIO_ID,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="NOME_USUARIO">Usuário *</FieldLabel>
          <Input id="NOME_USUARIO" {...register("NOME_USUARIO")} />
          {errors.NOME_USUARIO && (
            <FieldMessage variant="error">
              {errors.NOME_USUARIO.message}
            </FieldMessage>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="SENHA">
            {user ? "Nova Senha (deixe em branco para manter)" : "Senha *"}
          </FieldLabel>
          <Input id="SENHA" type="password" {...register("SENHA")} />
          {errors.SENHA && (
            <FieldMessage variant="error">{errors.SENHA.message}</FieldMessage>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Função *</FieldLabel>
            <Select
              value={role}
              onValueChange={(value) => setValue("ROLE", value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="MANAGER">Gerente</SelectItem>
                <SelectItem value="EMPLOYEE">Funcionário</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {user && (
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
        </div>

        <Field>
          <FieldLabel>Funcionário vinculado</FieldLabel>
          <Select
            value={funcionarioId || ""}
            onValueChange={(value) =>
              setValue("FUNCIONARIO_ID", value === "none" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Nenhum (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.ID} value={emp.ID}>
                  {emp.NOME}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
            {user ? "Salvar" : "Criar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
