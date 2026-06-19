"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const educationSchema = z.object({
  education: z
    .array(
      z
        .object({
          degree: z.string().min(1, "Degree is required"),
          institute: z.string().min(2, "Institute is required"),
          startDate: z.string().min(1, "Start Date is required"),
          endDate: z.string().optional(),
          isContinuing: z.boolean().default(false),
        })
        .refine((data) => data.isContinuing || data.endDate, {
          message: "End Date is required unless currently studying",
          path: ["endDate"],
        }),
    )
    .min(1, "At least one education entry is required"),
});

const DEGREES = [
  "LLB (Bachelor of Laws – 5 Years)",
  "LLM (Master of Laws)",
  "PhD in Law",
];

export function LawyerEducationForm({ defaultValues, onSubmit, isSubmitting }) {
  const form = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: defaultValues || {
      education: [
        {
          degree: "",
          institute: "",
          startDate: "",
          endDate: "",
          isContinuing: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "education",
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(
        defaultValues.education?.length
          ? defaultValues
          : {
              education: [
                {
                  degree: "",
                  institute: "",
                  startDate: "",
                  endDate: "",
                  isContinuing: false,
                },
              ],
            },
      );
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 border rounded-lg space-y-4 bg-slate-50 dark:bg-slate-900/50"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Education #{index + 1}</h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <FormField
              control={form.control}
              name={`education.${index}.degree`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Degree" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEGREES.map((deg) => (
                        <SelectItem key={deg} value={deg}>
                          {deg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`education.${index}.institute`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institute</FormLabel>
                  <FormControl>
                    <Input placeholder="University of the Punjab" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`education.${index}.startDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`education.${index}.endDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={form.watch(`education.${index}.isContinuing`)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`education.${index}.isContinuing`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white dark:bg-slate-950">
                  <div className="space-y-0.5">
                    <FormLabel>Currently Studying</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue(`education.${index}.endDate`, "");
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        ))}

        <div className="flex gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                degree: "",
                institute: "",
                startDate: "",
                endDate: "",
                isContinuing: false,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Education
          </Button>

          <Button type="submit" disabled={isSubmitting} size="sm">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Educational Details
          </Button>
        </div>
      </form>
    </Form>
  );
}
