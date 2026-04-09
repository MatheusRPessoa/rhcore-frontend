export interface ApiResponse<T> {
  succeeded: boolean;
  data: T;
  message: string;
  error?: ApiError | null;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface User {
  ID: string;
  USERNAME: string;
  STATUS: "ATIVO" | "INATIVO";
  CRIADO_EM: string;
  ATUALIZADO_POR?: string | null;
}

export interface Employee {
  ID: string;
  MATRICULA: string;
  NOME: string;
  CPF: string;
  RG?: string;
  DATA_NASCIMENTO: string;
  EMAIL: string;
  TELEFONE?: string;
  DATA_ADMISSAO: string;
  DEPARTAMENTO_ID?: string;
  CARGO_ID?: string;
  GESTOR_ID?: string;
  STATUS: "ATIVO" | "INATIVO";
  CRIADO_EM: string;
  ATUALIZADO_POR?: string | null;
  DEPARTAMENTO?: Department;
  CARGO?: Position;
  GESTOR?: Employee;
}

export interface CreateEmployeeData {
  MATRICULA: string;
  NOME: string;
  CPF: string;
  RG?: string;
  DATA_NASCIMENTO: string;
  EMAIL: string;
  TELEFONE?: string;
  DATA_ADMISSAO: string;
  DEPARTAMENTO_ID?: string;
  CARGO_ID?: string;
  GESTOR_ID?: string;
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  STATUS?: "ATIVO" | "INATIVO";
}

export interface Department {
  ID: string;
  NOME: string;
  SIGLA: string;
  DESCRICAO?: string | null;
  DEPARTAMENTO_PAI?: Department;
  STATUS: "ATIVO" | "INATIVO";
  CRIADO_POR: string;
  CRIADO_EM: string;
  ATUALIZADO_POR?: string | null;
  EXCLUIDO_POR?: string | null;
}

export interface CreateDepartmentData {
  NOME: string;
  SIGLA: string;
  DESCRICAO?: string;
  DEPARTAMENTO_PAI_ID?: string;
}

export interface UpdateDepartmentData extends Partial<CreateDepartmentData> {
  STATUS?: "ATIVO" | "INATIVO";
}

export interface Position {
  ID: string;
  NOME: string;
  DESCRICAO?: string;
  STATUS: "ATIVO" | "INATIVO";
  CRIADO_EM: string;
  ATUALIZADO_POR?: string | null;
}

export interface CreatePositionData {
  NOME: string;
  DESCRICAO?: string;
}

export interface UpdatePositionData extends Partial<CreatePositionData> {
  STATUS?: "ATIVO" | "INATIVO";
}

export type VacationStatus =
  | "PENDENTE"
  | "APROVADO"
  | "REJEITADO"
  | "CANCELADO";

export interface Vacation {
  ID: string;
  FUNCIONARIO_ID: string;
  DATA_INICIO: string;
  DATA_FIM: string;
  DIAS_SOLICITADOS: number;
  STATUS_FERIAS: VacationStatus;
  APROVADO_POR_ID?: string;
  DATA_APROVACAO?: string;
  OBSERVACAO?: string;
  CRIADO_EM: string;
  ATUALIZADO_POR?: string | null;
  FUNCIONARIO?: Employee;
  APROVADO_POR?: Employee;
}

export interface CreateVacationData {
  FUNCIONARIO_ID: string;
  DATA_INICIO: string;
  DATA_FIM: string;
  OBSERVACAO?: string;
}

export interface UpdateVacationData extends Partial<CreateVacationData> {
  STATUS_FERIAS?: VacationStatus;
  APROVADO_POR_ID?: string;
  DATA_APROVACAO?: string;
}

export type RequestType =
  | "DOCUMENTO"
  | "EQUIPAMENTO"
  | "BENEFICIO"
  | "TREINAMENTO"
  | "OUTROS";

export interface HRRequest {
  ID: string;
  FUNCIONARIO_ID: string;
  TIPO: RequestType;
  DESCRICAO: string;
  DATA_SOLICITACAO: string;
  DATA_RESPOSTA?: string;
  APROVADO_POR_ID?: string;
  OBSERVACAO?: string;
  CRIADO_EM: string;
  ATUALIZADO_POR?: string | null;
  FUNCIONARIO?: Employee;
  APROVADO_POR?: Employee;
}

export interface CreateRequestData {
  FUNCIONARIO_ID: string;
  TIPO: RequestType;
  DESCRICAO: string;
  DATA_SOLICITACAO: string;
  OBSERVACAO?: string;
}

export interface UpdateRequestData extends Partial<CreateRequestData> {
  DATA_RESPOSTA?: string;
  APROVADO_POR_ID?: string;
}

export interface SystemUser {
  ID: string;
  USERNAME: string;
  STATUS: "ATIVO" | "INATIVO";
  CRIADO_EM: string;
  ATUALIZADO_POR?: string | null;
}

export interface CreateUserData {
  USERNAME: string;
  PASSWORD: string;
}

export interface UpdateUserData {
  USERNAME?: string;
  PASSWORD?: string;
  STATUS?: "ATIVO" | "INATIVO";
}

export interface DashboardSummary {
  totalEmployees: number;
  totalDepartments: number;
  totalPositions: number;
  pendingVacations: number;
  openRequests: number;
}

export interface RecentActivity {
  id: number;
  type: "employee" | "vacation" | "request";
  description: string;
  timestamp: string;
}
