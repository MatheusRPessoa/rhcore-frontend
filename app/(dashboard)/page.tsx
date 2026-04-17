"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  Users,
  Building2,
  Briefcase,
  Palmtree,
  FileText,
  TrendingUp,
  Clock,
  UserPlus,
} from "lucide-react";
import { dashboardApi, vacationsApi } from "@/lib/api";
interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
          {trend && (
            <span className="text-green-600 ml-1 inline-flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              {trend}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

interface RecentActivityItem {
  id: number;
  type: "employee" | "vacation" | "request";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

function RecentActivityCard({
  activities,
  isLoading,
}: {
  activities: RecentActivityItem[];
  isLoading: boolean;
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case "employee":
        return <UserPlus className="h-4 w-4" />;
      case "vacation":
        return <Palmtree className="h-4 w-4" />;
      case "request":
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>Últimas atualizações no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    {activity.status && (
                      <StatusBadge status={activity.status} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma atividade recente
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PendingVacationsCard({
  vacations,
  isLoading,
}: {
  vacations: { name: string; dates: string; days: number }[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Férias Pendentes</CardTitle>
        <CardDescription>Aguardando aprovação</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : vacations.length > 0 ? (
          <div className="space-y-3">
            {vacations.map((vacation, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{vacation.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {vacation.dates}
                  </p>
                </div>
                <StatusBadge status="PENDENTE" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma solicitação pendente
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => dashboardApi.getSummary(),
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: () => dashboardApi.getRecentActivity(),
  });

  const { data: vacationsData, isLoading: vacationsLoading } = useQuery({
    queryKey: ["vacations-pending"],
    queryFn: () => vacationsApi.getAll(),
  });

  const isLoading = summaryLoading || activityLoading;

  const summary = summaryData?.data;
  const activities = activityData?.data ?? [];
  const pendingVacations = (vacationsData?.data ?? []).filter(
    (v) => v.STATUS_FERIAS === "PENDENTE",
  );

  const recentActivity: RecentActivityItem[] = activities.map((a) => ({
    id: a.id,
    type: a.type,
    title: a.description,
    description: new Date(a.timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    timestamp: a.timestamp,
  }));

  const pendingVacationsList = pendingVacations.slice(0, 5).map((v) => ({
    name: v.FUNCIONARIO?.NOME || "Funcionário",
    dates: `${new Date(v.DATA_INICIO).toLocaleDateString("pt-BR")} - ${new Date(v.DATA_FIM).toLocaleDateString("pt-BR")}`,
    days: v.DIAS_SOLICITADOS,
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do sistema de recursos humanos"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Funcionários"
              value={summary?.totalEmployees ?? 0}
              description="Funcionários ativos"
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              title="Departamentos"
              value={summary?.totalDepartments ?? 0}
              description="Departamentos ativos"
              icon={<Building2 className="h-4 w-4" />}
            />
            <StatCard
              title="Cargos"
              value={summary?.totalPositions ?? 0}
              description="Cargos cadastrados"
              icon={<Briefcase className="h-4 w-4" />}
            />
            <StatCard
              title="Férias Pendentes"
              value={summary?.pendingVacations ?? 0}
              description="Aguardando aprovação"
              icon={<Palmtree className="h-4 w-4" />}
            />
            <StatCard
              title="Solicitações Abertas"
              value={summary?.openRequests ?? 0}
              description="Sem resposta"
              icon={<FileText className="h-4 w-4" />}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentActivityCard activities={recentActivity} isLoading={isLoading} />
        <PendingVacationsCard
          vacations={pendingVacationsList}
          isLoading={vacationsLoading}
        />
      </div>
    </div>
  );
}
