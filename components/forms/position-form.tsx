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
  Position,
  CreatePositionData,
  UpdatePositionData,
} from "@/lib/types";

const positionSchema = z.object({
  NOME: z.string().min(1, "Nome é obrigatório"),
  DESCRICAO: z.string().optional(),
  STATUS: z.enum(["ATIVO", "INATIVO"]).optional(),
});

type PositionFormData = z.infer<typeof positionSchema>;

interface PositionFormProps {
  position?: Position;
  onSubmit: (data: CreatePositionData | UpdatePositionData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function PositionForm({
  position,
  onSubmit,
  isSubmitting,
  onCancel,
}: PositionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<PositionFormData>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      NOME: position?.NOME || "",
      DESCRICAO: position?.DESCRICAO || "",
      STATUS: position?.STATUS || "ATIVO",
    },
  });

  const status = useWatch({ control, name: "STATUS" });

  const handleFormSubmit = async (data: PositionFormData) => {
    const payload: CreatePositionData | UpdatePositionData = {
      NOME: data.NOME,
      DESCRICAO: data.DESCRICAO || undefined,
    };

    if (position && data.STATUS) {
      (payload as UpdatePositionData).STATUS = data.STATUS;
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="NOME">Nome *</FieldLabel>
          <Input id="NOME" {...register("NOME")} />
          {errors.NOME && (
            <FieldMessage variant="error">{errors.NOME.message}</FieldMessage>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="DESCRICAO">Descrição</FieldLabel>
          <Textarea id="DESCRICAO" {...register("DESCRICAO")} rows={3} />
        </Field>

        {position && (
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
            {position ? "Salvar" : "Criar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
