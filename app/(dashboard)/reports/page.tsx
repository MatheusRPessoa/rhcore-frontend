"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import {
  employeesApi,
  vacationsApi,
  requestsApi,
  departmentsApi,
} from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

const VACATION_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
  CANCELADO: "Cancelado",
};

const REQUEST_LABELS: Record<string, string> = {
  DOCUMENTO: "Documento",
  EQUIPAMENTO: "Equipamento",
  BENEFICIO: "Benefício",
  TREINAMENTO: "Treinamento",
  OUTROS: "Outros",
};

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ReportsPage() {
  const { hasAppPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hasAppPermission("VIEW_REPORTS")) router.push("/");
  }, [hasAppPermission, router]);

  const { data: empData, isLoading: empLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeesApi.getAll(),
  });

  const { data: vacData, isLoading: vacLoading } = useQuery({
    queryKey: ["vacations"],
    queryFn: () => vacationsApi.getAll(),
  });

  const { data: reqData, isLoading: reqLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: () => requestsApi.getAll(),
  });

  const { data: deptData, isLoading: deptLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.getAll(),
  });

  const isLoading = empLoading || vacLoading || reqLoading || deptLoading;

  const employees = empData?.data ?? [];
  const vacations = vacData?.data ?? [];
  const requests = reqData?.data ?? [];
  const departments = deptData?.data ?? [];

  const activeEmployees = employees.filter((e) => e.STATUS === "ATIVO").length;
  const inactiveEmployees = employees.filter(
    (e) => e.STATUS === "INATIVO",
  ).length;

  const vacationsByStatus = [
    "PENDENTE",
    "APROVADO",
    "REJEITADO",
    "CANCELADO",
  ].map((s) => ({
    name: VACATION_LABELS[s],
    total: vacations.filter((v) => v.STATUS_FERIAS === s).length,
  }));

  const requestsByType = [
    "DOCUMENTO",
    "EQUIPAMENTO",
    "BENEFICIO",
    "TREINAMENTO",
    "OUTROS",
  ].map((t) => ({
    name: REQUEST_LABELS[t],
    total: requests.filter((r) => r.TIPO === t).length,
  }));

  const employeesByDept = departments
    .filter((d) => d.STATUS === "ATIVO")
    .map((dept) => ({
      name: dept.SIGLA,
      fullName: dept.NOME,
      total: employees.filter(
        (e) => e.DEPARTAMENTO?.ID === dept.ID && e.STATUS === "ATIVO",
      ).length,
    }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Visão analítica dos dados do sistema"
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24 mt-1" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="pb2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Funcionários Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeEmployees}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {inactiveEmployees}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Férias no período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vacations.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {
                    vacations.filter((v) => v.STATUS_FERIAS === "PENDENTE")
                      .length
                  }{" "}
                  pendentes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Solicitações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {requests.filter((r) => r.STATUS === "PENDENTE").length}{" "}
                  pendentes
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Férias por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={vacationsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {vacationsByStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitações por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={requestsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {!isLoading && employeesByDept.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Funcionários por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer
              width="100%"
              height={Math.max(200, employeesByDept.length * 40)}
            >
              <BarChart data={employeesByDept} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={60}
                />
                <Tooltip
                  formatter={(value) => [value, "Funcionários"]}
                  labelFormatter={(label) =>
                    employeesByDept.find((d) => d.name === label)?.fullName ??
                    label
                  }
                />
                <Bar dataKey="total" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
