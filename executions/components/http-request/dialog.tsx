"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  endpoint: z.url({ message: "Please enter a valid URL" }),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  body: z.string().optional(),
  // .refine()
})

export type HttpRequestFormValues = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: z.infer<typeof formSchema>) => void
  defaultValues?: Partial<HttpRequestFormValues>
}

export function HttpRequestDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: defaultValues.endpoint || "",
      method: defaultValues.method || "GET",
      body: defaultValues.body || "",
    },
  })
  // Reset form values when dialog opens with new defaults
  useEffect(() => {
    if (open) {
      form.reset({
        endpoint: defaultValues.endpoint || "",
        method: defaultValues.method || "GET",
        body: defaultValues.body || "",
      })
    }
  }, [open, defaultValues, form])
  const watchMethod = form.watch("method")
  const showBodyField = ["POST", "PUT", "PATCH"].includes(watchMethod)
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values)
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col">
        <DialogHeader>
          <DialogTitle>HTTP Request</DialogTitle>
          <DialogDescription>
            Configure settings for the HTTP request node.
          </DialogDescription>
        </DialogHeader>
        <form
          id="http-request-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-4 flex-1 overflow-y-auto space-y-8 pretty-scrollbar pr-4 -mr-4"
        >
          <Controller
            control={form.control}
            name="method"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="method">Method</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="method" className="w-full">
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  The HTTP method to use for this request.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="endpoint"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="endpoint">Endpoint URL</FieldLabel>
                <Input
                  id="endpoint"
                  placeholder="https://api.example.com/users/{{httpResponse.data.id}}"
                  {...field}
                />
                <FieldDescription>
                  {
                    "Static URL or use “{{variables}}” for simple values or “{{json variable}}” to stringify objects"
                  }
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {showBodyField && (
            <Controller
              control={form.control}
              name="body"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="body">Request Body</FieldLabel>
                  <Textarea
                    id="body"
                    placeholder={`{
                    "userId": "{{httpResponse.data.id}}",
                    "name": "{{httpResponse.data.name}}",
                    "items": "{{httpResponse.data.items}}"
                    }`}
                    className="min-h-30 font-mono text-sm"
                    {...field}
                  />
                  <FieldDescription>
                    {
                      "JSON with template variables. Use “{{variables}}” for simple values or “{{json variable}}” to stringify objects"
                    }
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
          <DialogFooter className="mt-4">
            <Button form="http-request-form" type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
