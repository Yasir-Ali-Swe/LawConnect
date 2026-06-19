import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
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
import { useEffect } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const schema = z.object({
  dob: z.string().min(1, "Date of birth is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  profileImageUrl: z.string().optional().or(z.literal("")),
});

export function OfficerProfileForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  isEdit = false,
}) {
  const [preview, setPreview] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const displayPreview = preview || defaultValues?.profileImageUrl || "";

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      dob: "",
      city: "",
      province: "",
      profileImageUrl: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      const formattedValues = { ...defaultValues };
      if (formattedValues.dob) {
        formattedValues.dob = new Date(formattedValues.dob)
          .toISOString()
          .split("T")[0];
      }
      form.reset(formattedValues);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [defaultValues, form]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast.error("Only JPG, JPEG and PNG are allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    // Create Preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setProfileImageFile(file);
    toast.success("Image selected for preview");
  };

  const handleRemoveImage = () => {
    setPreview("");
    setProfileImageFile(null);
    form.setValue("profileImageUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit({ ...values, profileImageFile }),
        )}
        className="space-y-6"
      >
        {/* Profile Image Upload Section */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24 border-2 border-muted">
            <AvatarImage src={displayPreview} className="object-cover" />
            <AvatarFallback className="text-xl font-bold">OF</AvatarFallback>
          </Avatar>

          <div className="space-y-2 flex-1">
            <FormLabel>Profile Photos</FormLabel>
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              {preview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={handleRemoveImage}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Accepted formats: JPG, PNG. Max size: 2MB.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        {/* Hidden field to keep form logic intact */}
        <FormField
          control={form.control}
          name="profileImageUrl"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Lahore" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Punjab">Punjab</SelectItem>
                    <SelectItem value="Sindh">Sindh</SelectItem>
                    <SelectItem value="KPK">KPK</SelectItem>
                    <SelectItem value="Balochistan">Balochistan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEdit
              ? "Update Profile"
              : "Save Personal Info"}
        </Button>
      </form>
    </Form>
  );
}
