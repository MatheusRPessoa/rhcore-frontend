"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldMessage } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import type { SystemUser, CreateUserData, UpdateUserData } from "@/lib/types"

const userSchema = z.object({
  USERNAME: z.string().min(1, "Usuário é obrigatório"),
  PASSWORD: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
  STATUS: z.enum(["ATIVO", "INATIVO"]).optional(),
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  user?: SystemUser
  onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>
  isSubmitting: boolean
  onCancel: () => void
}

export function UserForm({ user, onSubmit, isSubmitting, onCancel }: UserFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(
      user
        ? userSchema.extend({
            PASSWORD: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
          })
        : userSchema.extend({
            PASSWORD: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
          })
    ),
    defaultValues: {
      USERNAME: user?.USERNAME || "",
      PASSWORD: "",
      STATUS: user?.STATUS || "ATIVO",
    },
  })

  const handleFormSubmit = async (data: UserFormData) => {
    if (user) {
      const payload: UpdateUserData = {
        USERNAME: data.USERNAME,
        STATUS: data.STATUS,
      }
      if (data.PASSWORD) {
        payload.PASSWORD = data.PASSWORD
      }
      await onSubmit(payload)
    } else {
      await onSubmit({
        USERNAME: data.USERNAME,
        PASSWORD: data.PASSWORD!,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="USERNAME">Usuário *</FieldLabel>
          <Input id="USERNAME" {...register("USERNAME")} />
          {errors.USERNAME && <FieldMessage variant="error">{errors.USERNAME.message}</FieldMessage>}
        </Field>

        <Field>
          <FieldLabel htmlFor="PASSWORD">
            {user ? "Nova Senha (deixe em branco para manter)" : "Senha *"}
          </FieldLabel>
          <Input id="PASSWORD" type="password" {...register("PASSWORD")} />
          {errors.PASSWORD && <FieldMessage variant="error">{errors.PASSWORD.message}</FieldMessage>}
        </Field>

        {user && (
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select
              value={watch("STATUS")}
              onValueChange={(value) => setValue("STATUS", value as "ATIVO" | "INATIVO")}
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
            {user ? "Salvar" : "Criar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
