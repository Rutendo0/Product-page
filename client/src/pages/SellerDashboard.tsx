import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  User,
  PackageCheck,
  TrendingUp,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import SellerOrders from "./SellerOrders";
import SellerAnalytics from "./SellerAnalytics";
import SellerProducts from "./SellerProducts";
import SellerSettings from "./SellerSettings";
import SellerInventory from "./SellerInventory";
import SellerSales from "./SellerSales";
import SellerPurchases from "./SellerPurchases";

const navigation = [
  { title: "Dashboard", url: "/seller", icon: Home },
  { title: "Products", url: "/seller/products", icon: Package },
  { title: "Orders", url: "/seller/orders", icon: ShoppingCart },
  { title: "Analytics", url: "/seller/analytics", icon: BarChart3 },
  { title: "Inventory", url: "/seller/inventory", icon: PackageCheck },
  { title: "Sales", url: "/seller/sales", icon: TrendingUp },
  { title: "Purchases", url: "/seller/purchases", icon: ShoppingBag },
  { title: "Settings", url: "/seller/settings", icon: Settings },
];

export default function SellerDashboard() {
  const [location] = useLocation();

  const getSubpage = () => {
    if (location === "/seller") return "dashboard";
    return location.replace("/seller/", "");
  };

  const subpage = getSubpage();

  const renderSubpage = () => {
    switch (subpage) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Overview of your store performance</p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/seller/settings">Quick Settings</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-muted">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4,239</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">Active</p>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,349</div>
                  <p className="text-xs text-muted-foreground">Monthly</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription className="text-xs">Latest activity from your customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Order list placeholder</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription className="text-xs">Key indicators over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Chart placeholder</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "products":
        return <SellerProducts />;
      case "orders":
        return <SellerOrders />;
      case "analytics":
        return <SellerAnalytics />;
      case "inventory":
        return <SellerInventory />;
      case "sales":
        return <SellerSales />;
      case "purchases":
        return <SellerPurchases />;
      case "settings":
        return <SellerSettings />;
      default:
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <p className="text-sm text-muted-foreground">Subpage not found. Please select from the sidebar.</p>
          </div>
        );
    }
  };

  const isActive = (url: string) => {
    if (url === "/seller") return location === "/seller";
    return location.startsWith(url);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="p-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/80 text-primary-foreground grid place-items-center text-xs">SP</div>
                <div>
                  <p className="text-sm font-semibold leading-none">Seller Portal</p>
                  <p className="text-xs text-muted-foreground">Manage your store</p>
                </div>
              </div>
            </div>

            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Profile">
                  <Link href="/profile">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="outline" className="w-full">Logout</Button>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-6">
          {renderSubpage()}
        </main>
      </div>
    </SidebarProvider>
  );
}