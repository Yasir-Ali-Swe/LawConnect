"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const CATEGORIES = [
  "Civil Law",
  "Criminal Law",
  "Family Law",
  "Corporate Law",
  "Property Law",
  "Constitutional Law",
  "Labor Law",
  "Intellectual Property",
  "Taxation Law",
  "Banking Law",
];

const professionalSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  experience: z.coerce.number().min(0, "Experience required"),
  specialization: z
    .array(z.string())
    .min(1, "Select at least one specialization"),
  notes: z.string().optional(),
});

export function OfficerProfessionalForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}) {
  const form = useForm({
    resolver: zodResolver(professionalSchema),
    defaultValues: defaultValues || {
      bio: "",
      experience: 0,
      specialization: [],
      notes: "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        bio: defaultValues.bio || "",
        experience: defaultValues.experience ?? 0,
        specialization: defaultValues.specialization || [],
        notes: defaultValues.notes || "",
      });
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Bio / About</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself..."
                  className="resize-none h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of Experience</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialization"
          render={() => (
            <FormItem>
              <FormLabel className="mb-4 text-base">
                Categories of Cases Handled
              </FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-md">
                {CATEGORIES.map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="specialization"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{item}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any other professional details..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Professional Details"}
        </Button>
      </form>
    </Form>
  );
}
