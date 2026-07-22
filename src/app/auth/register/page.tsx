"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { FormField } from "@/shared/components/forms/form-field";
import { registerUserAction } from "@/features/auth/actions/auth-actions";
import { Shield, Sparkles, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Customer",
  });

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await registerUserAction({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Registration failed.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push(`/auth/login?email=${encodeURIComponent(formData.email)}`);
      }, 1500);
    } catch {
      setErrorMsg("An unexpected error occurred during registration.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 ws-grain">
      <div className="w-full max-w-md space-y-4">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-base shadow-glow group-hover:scale-105 transition-transform">
              D
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              Dropshop<span className="text-primary">NN</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">
            Create an enterprise commerce account
          </p>
        </div>

        <Card className="border-border/80 bg-card/95 backdrop-blur-md shadow-xl rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Create Account
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Register as a Retail Customer, Reseller, Wholesale Buyer, or Supplier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMsg && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="rounded-lg border border-success/20 bg-success/10 p-3 text-xs font-semibold text-success flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <FormField label="Full Name" required>
                <Input
                  type="text"
                  placeholder="e.g. Rahim Ahmed"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  disabled={loading}
                  required
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Username" required>
                  <Input
                    type="text"
                    placeholder="rahim_ahmed"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    disabled={loading}
                    required
                  />
                </FormField>

                <FormField label="Account Role" required>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => handleChange("role", val)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Customer">Retail Customer</SelectItem>
                      <SelectItem value="Reseller">Reseller Partner</SelectItem>
                      <SelectItem value="Wholesale Buyer">Wholesale Buyer</SelectItem>
                      <SelectItem value="Supplier">Official Supplier</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="Email Address" required>
                <Input
                  type="email"
                  placeholder="rahim@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={loading}
                  required
                />
              </FormField>

              <FormField label="Phone Number" required hint="11-digit Bangladeshi mobile number">
                <Input
                  type="tel"
                  placeholder="01712345678"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={loading}
                  required
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Password" required>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    disabled={loading}
                    required
                  />
                </FormField>

                <FormField label="Confirm Password" required>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    disabled={loading}
                    required
                  />
                </FormField>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full font-semibold shadow-sm mt-2"
              >
                <UserPlus className="h-4 w-4 mr-1.5" />
                Register Account
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-border/60 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
