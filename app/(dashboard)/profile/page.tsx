"use client";

import { useAuth } from "@/contexts/auth-context";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldMessage,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi } from "@/lib/api";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gestor",
  EMPLOYEE: "Funcionário",
};

const STATUS_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

const passwordSchema = z
  .object({
    SENHA_ATUAL: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    NOVA_SENHA: z
      .string()
      .min(6, "A nova senha deve ter no mínimo 6 caracteres"),
    CONFIRMAR_SENHA: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.NOVA_SENHA === data.CONFIRMAR_SENHA, {
    message: "As senhas não coincidem",
    path: ["CONFIRMAR_SENHA"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: (data: { SENHA_ATUAL: string; NOVA_SENHA: string }) =>
      usersApi.update(user!.ID, {
        SENHA_ATUAL: data.SENHA_ATUAL,
        NOVA_SENHA: data.NOVA_SENHA,
      }),
    onSuccess: () => {
      toast.success("Senha alterada com sucesso");
      reset();
    },
    onError: () => {
      toast.error("Erro ao alterar senha");
    },
  });

  if (!user) return null;

  const initials = (user.USERNAME ?? "US").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Meu Perfil"
        description="Gerencie as informações da sua conta e preferências."
      />

      <Card className="max-w-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle>{user.USERNAME}</CardTitle>
            <Badge variant="outline">
              {ROLE_LABELS[user.ROLE] || user.ROLE}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted-foreground font-medium">ID</dt>
            <dd className="font-mono text-xs break-all">{user.ID}</dd>

            <dt className="text-muted-foreground font-medium">Usuário</dt>
            <dd>{user.USERNAME}</dd>

            <dt className="text-muted-foreground font-medium">Perfil</dt>
            <dd>{ROLE_LABELS[user.ROLE] || user.ROLE}</dd>

            <dt className="text-muted-foreground font-medium">Status</dt>
            <dd>
              <Badge
                variant={user.STATUS === "ATIVO" ? "default" : "secondary"}
              >
                {STATUS_LABELS[user.STATUS] ?? user.STATUS}
              </Badge>
            </dd>

            <dt className="text-muted-foreground font-medium">Criado em</dt>
            <dd>
              {new Date(user.CRIADO_EM).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </dd>

            {user.FUNCIONARIO_ID && (
              <>
                <dt className="text-muted-foreground font-medium">
                  Funcionário ID
                </dt>
                <dd className="font-mono text-xs break-all">
                  {user.FUNCIONARIO_ID}
                </dd>
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((data) =>
              changePassword({
                SENHA_ATUAL: data.SENHA_ATUAL,
                NOVA_SENHA: data.NOVA_SENHA,
              }),
            )}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="SENHA_ATUAL">Senha Atual</FieldLabel>
                <Input
                  id="SENHA_ATUAL"
                  type="password"
                  {...register("SENHA_ATUAL")}
                />
                {errors.SENHA_ATUAL && (
                  <FieldMessage variant="error">
                    {errors.SENHA_ATUAL.message}
                  </FieldMessage>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="NOVA_SENHA">Nova Senha</FieldLabel>
                <Input
                  id="NOVA_SENHA"
                  type="password"
                  {...register("NOVA_SENHA")}
                />
                {errors.NOVA_SENHA && (
                  <FieldMessage variant="error">
                    {errors.NOVA_SENHA.message}
                  </FieldMessage>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="CONFIRMAR_SENHA">
                  Confirmar Nova Senha
                </FieldLabel>
                <Input
                  id="CONFIRMAR_SENHA"
                  type="password"
                  {...register("CONFIRMAR_SENHA")}
                />
                {errors.CONFIRMAR_SENHA && (
                  <FieldMessage variant="error">
                    {errors.CONFIRMAR_SENHA.message}
                  </FieldMessage>
                )}
              </Field>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending && <Spinner className="mr-2 h-4 w-4" />}
                  Alterar Senha
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
