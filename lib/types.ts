export interface ApiResponse<T> {
  succeeded: boolean
  data: T
  message: string
  error?: ApiError | null
}

export interface ApiError {
  statusCode: number
  error: string
  message?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface User {
  ID: number
  USERNAME: string
  STATUS: "ATIVO" | "INATIVO"
  CREATED_AT: string
  UPDATED_AT: string
}

export interface Employee {
  ID: number
  MATRICULA: string
  NOME: string
  CPF: string
  RG?: string
  DATA_NASCIMENTO: string
  EMAIL: string
  TELEFONE?: string
  DATA_ADMISSAO: string
  DEPARTAMENTO_ID?: number
  CARGO_ID?: number
  GESTOR_ID?: number
  STATUS: "ATIVO" | "INATIVO"
  CREATED_AT: string
  UPDATED_AT: string
  DEPARTAMENTO?: Department
  CARGO?: Position
  GESTOR?: Employee
}

export interface CreateEmployeeData {
  MATRICULA: string
  NOME: string
  CPF: string
  RG?: string
  DATA_NASCIMENTO: string
  EMAIL: string
  TELEFONE?: string
  DATA_ADMISSAO: string
  DEPARTAMENTO_ID?: number
  CARGO_ID?: number
  GESTOR_ID?: number
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  STATUS?: "ATIVO" | "INATIVO"
}

export interface Department {
  ID: number
  NOME: string
  SIGLA: string
  DESCRICAO?: string
  STATUS: "ATIVO" | "INATIVO"
  CREATED_AT: string
  UPDATED_AT: string
}

export interface CreateDepartmentData {
  NOME: string
  DESCRICAO?: string
}

export interface UpdateDepartmentData extends Partial<CreateDepartmentData> {
  STATUS?: "ATIVO" | "INATIVO"
}

export interface Position {
  ID: number
  NOME: string
  DESCRICAO?: string
  STATUS: "ATIVO" | "INATIVO"
  CREATED_AT: string
  UPDATED_AT: string
}

export interface CreatePositionData {
  NOME: string
  DESCRICAO?: string
}

export interface UpdatePositionData extends Partial<CreatePositionData> {
  STATUS?: "ATIVO" | "INATIVO"
}

export type VacationStatus = "PENDENTE" | "APROVADO" | "REJEITADO" | "CANCELADO"

export interface Vacation {
  ID: number
  FUNCIONARIO_ID: number
  DATA_INICIO: string
  DATA_FIM: string
  DIAS_SOLICITADOS: number
  STATUS_FERIAS: VacationStatus
  APROVADO_POR_ID?: number
  DATA_APROVACAO?: string
  OBSERVACAO?: string
  CREATED_AT: string
  UPDATED_AT: string
  FUNCIONARIO?: Employee
  APROVADO_POR?: Employee
}

export interface CreateVacationData {
  FUNCIONARIO_ID: number
  DATA_INICIO: string
  DATA_FIM: string
  OBSERVACAO?: string
}

export interface UpdateVacationData extends Partial<CreateVacationData> {
  STATUS_FERIAS?: VacationStatus
  APROVADO_POR_ID?: number
  DATA_APROVACAO?: string
}

export type RequestType = "DOCUMENTO" | "EQUIPAMENTO" | "BENEFICIO" | "TREINAMENTO" | "OUTROS"

export interface HRRequest {
  ID: number
  FUNCIONARIO_ID: number
  TIPO: RequestType
  DESCRICAO: string
  DATA_SOLICITACAO: string
  DATA_RESPOSTA?: string
  APROVADO_POR_ID?: number
  OBSERVACAO?: string
  CREATED_AT: string
  UPDATED_AT: string
  FUNCIONARIO?: Employee
  APROVADO_POR?: Employee
}

export interface CreateRequestData {
  FUNCIONARIO_ID: number
  TIPO: RequestType
  DESCRICAO: string
  DATA_SOLICITACAO: string
  OBSERVACAO?: string
}

export interface UpdateRequestData extends Partial<CreateRequestData> {
  DATA_RESPOSTA?: string
  APROVADO_POR_ID?: number
}

export interface SystemUser {
  ID: number
  USERNAME: string
  STATUS: "ATIVO" | "INATIVO"
  CREATED_AT: string
  UPDATED_AT: string
}

export interface CreateUserData {
  USERNAME: string
  PASSWORD: string
}

export interface UpdateUserData {
  USERNAME?: string
  PASSWORD?: string
  STATUS?: "ATIVO" | "INATIVO"
}

export interface DashboardSummary {
  totalEmployees: number
  totalDepartments: number
  totalPositions: number
  pendingVacations: number
  openRequests: number
}

export interface RecentActivity {
  id: number
  type: "employee" | "vacation" | "request"
  description: string
  timestamp: string
}
