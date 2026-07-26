"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  balance: number;
  walletId: string;
  onSuccess: () => Promise<void>;
}

export function WithdrawForm({ balance, walletId, onSuccess }: Props): React.ReactElement {
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState("");
  const [account, setAccount] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!amount || isNaN(amountCents) || amountCents <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amountCents > balance) {
      toast.error("Insufficient balance");
      return;
    }
    if (!method) {
      toast.error("Select a withdrawal method");
      return;
    }
    if (!account) {
      toast.error("Enter your account details");
      return;
    }

    setSubmitting(true);
    try {
      const finance = await import("@/features/finance/actions/finance-actions");
      const res = await finance.requestWithdrawalAction({
        walletId,
        amount: amountCents,
        method: method as "bkash" | "nagad" | "rocket" | "bank" | "manual",
        payoutDetails: { accountNumber: account },
      });
      if (res.success) {
        toast.success("Withdrawal request submitted");
        setAmount("");
        setMethod("");
        setAccount("");
        await onSuccess();
      } else {
        toast.error(res.error ?? "Failed to submit withdrawal");
      }
    } catch {
      toast.error("Failed to submit withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm">Request Withdrawal</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs">
              Amount (BDT)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="method" className="text-xs">
              Method
            </Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bkash">bKash</SelectItem>
                <SelectItem value="nagad">Nagad</SelectItem>
                <SelectItem value="rocket">Rocket</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account" className="text-xs">
              Account Number / Details
            </Label>
            <Input
              id="account"
              placeholder="e.g. 01XXXXXXXXX"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full gap-1.5" disabled={submitting}>
            {submitting ? <Spinner size="sm" /> : <ArrowUpRight className="h-4 w-4" />}
            {submitting ? "Submitting…" : "Request Withdrawal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
