"use client";

import { useAuth } from "@/contexts/auth-context";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gestor",
  EMPLOYEE: "Funcionário",
};

const STATUS_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

export default function ProfilePage() {
  const { user } = useAuth();

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
    </div>
  );
}
