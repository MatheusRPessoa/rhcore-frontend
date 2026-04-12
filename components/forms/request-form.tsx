"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
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
import { employeesApi } from "@/lib/api";
import type {
  HRRequest,
  CreateRequestData,
  UpdateRequestData,
  RequestType,
} from "@/lib/types";

const requestSchema = z.object({
  FUNCIONARIO_ID: z.string().min(1, "Funcionário é obrigatório"),
  TIPO: z.enum([
    "DOCUMENTO",
    "EQUIPAMENTO",
    "BENEFICIO",
    "TREINAMENTO",
    "OUTROS",
  ]),
  DESCRICAO: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(500, "Máximo de 500 caracteres"),
  DATA_SOLICITACAO: z.string().min(1, "Data de solicitação é obrigatória"),
  OBSERVACAO: z.string().max(500, "Máximo de 500 caracteres").optional(),
  DATA_RESPOSTA: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestFormProps {
  request?: HRRequest;
  onSubmit: (data: CreateRequestData | UpdateRequestData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const requestTypes = [
  { value: "DOCUMENTO", label: "Documento" },
  { value: "EQUIPAMENTO", label: "Equipamento" },
  { value: "BENEFICIO", label: "Benefício" },
  { value: "TREINAMENTO", label: "Treinamento" },
  { value: "OUTROS", label: "Outros" },
];

export function RequestForm({
  request,
  onSubmit,
  isSubmitting,
  onCancel,
}: RequestFormProps) {
  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeesApi.getAll(),
  });

  const employees =
    employeesData?.data?.filter((e) => e.STATUS === "ATIVO") || [];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      FUNCIONARIO_ID: request?.FUNCIONARIO_ID?.toString() || "",
      TIPO: request?.TIPO || "DOCUMENTO",
      DESCRICAO: request?.DESCRICAO || "",
      DATA_SOLICITACAO:
        request?.DATA_SOLICITACAO?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      OBSERVACAO: request?.OBSERVACAO || "",
      DATA_RESPOSTA: request?.DATA_RESPOSTA?.split("T")[0] || "",
    },
  });

  const funcionarioId = useWatch({ control, name: "FUNCIONARIO_ID" });
  const tipo = useWatch({ control, name: "TIPO" });

  const handleFormSubmit = async (data: RequestFormData) => {
    const payload: CreateRequestData | UpdateRequestData = {
      FUNCIONARIO_ID: data.FUNCIONARIO_ID,
      TIPO: data.TIPO as RequestType,
      DESCRICAO: data.DESCRICAO,
      DATA_SOLICITACAO: data.DATA_SOLICITACAO,
      OBSERVACAO: data.OBSERVACAO || undefined,
    };

    if (request) {
      const updatePayload = payload as UpdateRequestData;
      if (data.DATA_RESPOSTA) {
        updatePayload.DATA_RESPOSTA = data.DATA_RESPOSTA;
      }
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel>Funcionário *</FieldLabel>
          <Select
            value={funcionarioId}
            onValueChange={(value) => setValue("FUNCIONARIO_ID", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um funcionário..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.ID} value={emp.ID.toString()}>
                  {emp.NOME}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.FUNCIONARIO_ID && (
            <FieldMessage variant="error">
              {errors.FUNCIONARIO_ID.message}
            </FieldMessage>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Tipo *</FieldLabel>
            <Select
              value={tipo}
              onValueChange={(value) => setValue("TIPO", value as RequestType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {requestTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.TIPO && (
              <FieldMessage variant="error">{errors.TIPO.message}</FieldMessage>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="DATA_SOLICITACAO">
              Data de Solicitação *
            </FieldLabel>
            <Input
              id="DATA_SOLICITACAO"
              type="date"
              {...register("DATA_SOLICITACAO")}
            />
            {errors.DATA_SOLICITACAO && (
              <FieldMessage variant="error">
                {errors.DATA_SOLICITACAO.message}
              </FieldMessage>
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="DESCRICAO">Descrição *</FieldLabel>
          <Textarea
            id="DESCRICAO"
            {...register("DESCRICAO")}
            rows={3}
            maxLength={500}
            placeholder="Descreva a solicitação (máximo 500 caracteres)"
          />
          {errors.DESCRICAO && (
            <FieldMessage variant="error">
              {errors.DESCRICAO.message}
            </FieldMessage>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="OBSERVACAO">Observação</FieldLabel>
          <Textarea
            id="OBSERVACAO"
            {...register("OBSERVACAO")}
            rows={2}
            maxLength={500}
            placeholder="Observações adicionais (opcional)"
          />
          {errors.OBSERVACAO && (
            <FieldMessage variant="error">
              {errors.OBSERVACAO.message}
            </FieldMessage>
          )}
        </Field>

        {request && (
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="DATA_RESPOSTA">Data de Resposta</FieldLabel>
              <Input
                id="DATA_RESPOSTA"
                type="date"
                {...register("DATA_RESPOSTA")}
              />
            </Field>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
            {request ? "Salvar" : "Criar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
