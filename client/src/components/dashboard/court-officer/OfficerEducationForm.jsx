"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const educationSchema = z.object({
  education: z
    .array(
      z.object({
        degree: z.string().min(1, "Degree is required"),
        institute: z.string().min(1, "Institute is required"),
        startDate: z.string().min(1, "Start Date required"),
        endDate: z.string().optional(),
        isContinuing: z.boolean().default(false),
      }),
    )
    .min(1, "At least one education record is required"),
});

export function OfficerEducationForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}) {
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
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border rounded-lg bg-muted/10 relative"
            >
              <div className="absolute right-2 top-2">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 pr-8">
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
                          <SelectItem value="LLB">
                            LLB (Bachelor of Laws – 5 Years)
                          </SelectItem>
                          <SelectItem value="LLM">
                            LLM (Master of Laws)
                          </SelectItem>
                          <SelectItem value="PhD">PhD in Law</SelectItem>
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
                        <Input
                          placeholder="University/College Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name={`education.${index}.endDate`}
                    render={({ field }) => {
                      const isContinuing = form.watch(
                        `education.${index}.isContinuing`,
                      );
                      return (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              disabled={isContinuing}
                              value={isContinuing ? "" : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name={`education.${index}.isContinuing`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0 mt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">
                          Currently Studying
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
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

          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Education"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
