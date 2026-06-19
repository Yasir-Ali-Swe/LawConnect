"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

const professionalSchema = z.object({
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must be less than 500 characters"),
  experience: z.coerce.number().min(0, "Experience must be a positive number"),
  barCouncil: z.string().min(1, "Bar Council is required"),
  specialization: z
    .array(z.string())
    .min(1, "Select at least one specialization"),
});

const BAR_COUNCILS = [
  "Punjab Bar Council",
  "Sindh Bar Council",
  "Khyber Pakhtunkhwa Bar Council",
  "Balochistan Bar Council",
  "Islamabad Bar Council",
];

const SPECIALIZATIONS = [
  "Civil Law",
  "Criminal Law",
  "Family Law",
  "Corporate Law",
  "Property Law",
  "Tax Law",
  "Labor Law",
  "Cyber Law",
  "Constitutional Law",
  "Intellectual Property",
];

export function LawyerProfessionalForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}) {
  const form = useForm({
    resolver: zodResolver(professionalSchema),
    defaultValues: defaultValues || {
      bio: "",
      experience: 0,
      barCouncil: "",
      specialization: [],
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        bio: defaultValues.bio || "",
        experience: defaultValues.experience ?? 0,
        barCouncil: defaultValues.barCouncil || "",
        specialization: defaultValues.specialization || [],
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
              <FormLabel>Short Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your professional background..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-4">
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
            name="barCouncil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bar Council Membership</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Bar Council" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BAR_COUNCILS.map((council) => (
                      <SelectItem key={council} value={council}>
                        {council}
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
          name="specialization"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Specializations</FormLabel>
                <FormDescription>
                  Select the legal areas you practice in.
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {SPECIALIZATIONS.map((item) => (
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Professional Details
        </Button>
      </form>
    </Form>
  );
}
