"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package,
  Heart,
  ShoppingBag,
  MapPin,
  ChevronRight,
  User,
  Shield,
  Bell,
  UserCog,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface OverviewData {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    profileImage?: string;
  };
  orderCount: number;
  wishlistCount: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: Date;
  }[];
}

const QUICK_ACTIONS = [
  { label: "Edit Profile", href: "/account/profile", icon: User, color: "text-blue-500" },
  { label: "My Orders", href: "/account/orders", icon: Package, color: "text-emerald-500" },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart, color: "text-rose-500" },
  { label: "Addresses", href: "/account/addresses", icon: MapPin, color: "text-amber-500" },
  { label: "Security", href: "/account/security", icon: Shield, color: "text-violet-500" },
  { label: "Notifications", href: "/account/notifications", icon: Bell, color: "text-cyan-500" },
  { label: "Roles", href: "/account/role", icon: UserCog, color: "text-orange-500" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-200",
  processing: "bg-violet-500/10 text-violet-600 border-violet-200",
  shipped: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  cancelled: "bg-rose-500/10 text-rose-600 border-rose-200",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AccountOverviewContent({ data }: { data: OverviewData }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 rounded-full overflow-hidden bg-muted ring-2 ring-border">
          {data.user.profileImage ? (
            <Image src={data.user.profileImage} alt="" fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
              {data.user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Welcome back, {data.user.fullName.split(" ")[0]}
          </h1>
          <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
            <Badge variant="outline" className="capitalize text-xs">
              {data.user.role}
            </Badge>
            <span>{data.user.email}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Wishlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.wishlistCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/30 transition-colors"
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-xs text-muted-foreground text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
          <Link href="/account/orders">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data.recentOrders.length === 0 ? (
            <div className="text-center py-6">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
              <Link href="/">
                <Button variant="outline" size="sm" className="mt-3">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${
                          STATUS_COLORS[order.status] || "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        {order.status}
                      </Badge>
                      <span className="text-sm font-semibold">৳{order.total.toLocaleString()}</span>
                    </div>
                  </Link>
                  {i < data.recentOrders.length - 1 && <Separator />}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
