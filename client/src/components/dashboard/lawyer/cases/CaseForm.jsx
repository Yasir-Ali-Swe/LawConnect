"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { Loader2 } from "lucide-react";

// Schema
const caseSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  type: z.enum(
    [
      "Civil",
      "Criminal",
      "Family",
      "Corporate",
      "Labor",
      "Property",
      "Political",
      "Tax",
    ],
    { required_error: "Please select a case type" },
  ),
  description: z.string().min(20, "Description must be at least 20 characters"),
  parties: z
    .array(
      z.object({
        role: z.enum(["PLAINTIFF", "DEFENDANT"]),
        name: z.string().min(2, "Name required"),
      }),
    )
    .min(2, "At least one plaintiff and one defendant required")
    .refine(
      (parties) =>
        parties.some((p) => p.role === "PLAINTIFF") &&
        parties.some((p) => p.role === "DEFENDANT"),
      {
        message: "Must have at least one Plaintiff and one Defendant",
        path: ["parties"],
      },
    ),
});

export function CaseForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  mode = "create",
  clients = [],
}) {
  const form = useForm({
    resolver: zodResolver(caseSchema),
    defaultValues: defaultValues || {
      clientId: "",
      title: "",
      type: undefined,
      description: "",
      parties: [
        { role: "PLAINTIFF", name: "" },
        { role: "DEFENDANT", name: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parties",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              {(mode === "create" || clients.length > 0) && (
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={mode === "update"} // Disable client change in update mode? Usually yes.
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client._id} value={client._id}>
                              {client.fullName} ({client.email})
                            </SelectItem>
                          ))}
                          {/* If update mode and client not in list (lazy load), we might need to handle display. 
                                For now assume create mode passes clients. Update mode logic handles itself if default value is set. 
                             */}
                        </SelectContent>
                      </Select>
                      {mode === "create" && (
                        <FormDescription>
                          Drafting for a client with an accepted proposal.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Contract Dispute vs. Acme Corp"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
                            "Civil",
                            "Criminal",
                            "Family",
                            "Corporate",
                            "Labor",
                            "Property",
                            "Political",
                            "Tax",
                          ].map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the case..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4 border-t">
              <div className="mb-4">
                <FormLabel className="text-base">Parties Involved</FormLabel>
                <FormDescription>
                  Add all plaintiffs and defendants involved in this case.
                </FormDescription>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`parties.${index}.role`}
                      render={({ field }) => (
                        <FormItem className="w-[140px]">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PLAINTIFF">
                                Plaintiff
                              </SelectItem>
                              <SelectItem value="DEFENDANT">
                                Defendant
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`parties.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Full Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-red-500"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {form.formState.errors.parties?.root && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.parties.root.message}
                </p>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 w-full md:w-auto"
                onClick={() => append({ role: "PLAINTIFF", name: "" })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Party
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Draft Case" : "Update Draft"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
