import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface SellerSettings {
  storeName: string;
  bio: string;
  address: string;
  bankAccount: string;
  phone: string;
}

const formSchema = z.object({
  storeName: z.string().min(1, { message: "Store name is required." }),
  bio: z.string().max(500, { message: "Bio must not exceed 500 characters." }).optional(),
  address: z.string().min(1, { message: "Address is required." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  bankAccount: z.string().optional(),
});

export default function SellerSettings() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const defaultValues = useMemo(
    () => ({
      storeName: "",
      bio: "",
      address: "",
      phone: "",
      bankAccount: "",
    }),
    []
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { data: settings, isLoading, error } = useQuery<SellerSettings>({
    queryKey: ["seller-settings"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No token available");

      const response = await fetch("/api/seller/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      return (await response.json()) as SellerSettings;
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (updatedSettings: z.infer<typeof formSchema>) => {
      const token = await getToken();
      if (!token) throw new Error("No token available");

      const response = await fetch("/api/seller/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-settings"] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header with actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Update your store information and contact details</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset(settings ?? defaultValues)}
            disabled={updateMutation.isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="seller-settings-form"
            disabled={updateMutation.isPending || form.formState.isSubmitting}
          >
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings form in responsive grid */}
      <Form {...form}>
        <form
          id="seller-settings-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main form area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your public store details</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your store name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us about your store" maxLength={500} {...field} />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">{field.value?.length || 0}/500</div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How customers and support can reach you</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
                <CardDescription>Payout destination (optional)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankAccount"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Bank Account</FormLabel>
                      <FormControl>
                        <Input placeholder="Account or IBAN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Side column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
                <CardDescription>Improve your store profile</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Use a concise store name that matches your brand.</p>
                <p>• Keep your bio clear and under 500 characters.</p>
                <p>• Ensure your phone and address are up to date for deliveries.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>How customers may see your details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Store: </span>
                  <span>{form.watch("storeName") || "—"}</span>
                </div>
                <div>
                  <span className="font-medium">Phone: </span>
                  <span>{form.watch("phone") || "—"}</span>
                </div>
                <div className="text-muted-foreground line-clamp-3">
                  {form.watch("bio") || "Add a short bio to introduce your store."}
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}