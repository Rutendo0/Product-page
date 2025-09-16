import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarProvider } from "@/components/ui/sidebar";
import { User, Store, Briefcase, ShoppingBag, LogOut, Mail, Home, Package, ShoppingCart, BarChart3, Settings } from "lucide-react";

const Profile = () => {
  const { user, logout, isAuthenticated, getToken } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();


  interface OrderItem {
    name: string;
    quantity: number;
    price: number;
  }

  interface RecentOrder {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
  }

  interface DashboardStats {
    totalSales: number;
    pendingOrders: number;
    activeProducts: number;
    monthlyRevenue: number;
  }

  interface DashboardData {
    stats: DashboardStats;
    recentOrders: RecentOrder[];
  }

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        if (token) {
          const response = await fetch("/api/seller/dashboard", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data: DashboardData = await response.json();
            setDashboardData(data);
          } else {
            if (response.status === 403) {
              toast({
                title: "Access Denied",
                description: "Seller account required. Please upgrade your account.",
                variant: "destructive",
              });
              navigate("/seller-register");
              return;
            }
            // ignore other errors silently
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
        // toast removed to prevent message
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getToken, toast]);

  useEffect(() => {
    if (isAuthenticated && user && !user.isSeller) {
      toast({
        title: "Access Denied",
        description: "Seller account required. Please upgrade your account.",
        variant: "destructive",
      });
      navigate("/seller-register");
    }
  }, [isAuthenticated, user, navigate, toast]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Profile</CardTitle>
            <CardDescription>Please log in to view your profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full">Log in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user && !user.isSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span>Redirecting...</span>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background w-full">
      <Sidebar className="border-r-0">
        <SidebarHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Seller Profile</h3>
                <Badge variant="secondary" className="bg-green-600 text-xs">Seller</Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center space-x-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">Username:</span> {user.username}
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">Email:</span> {user.email}
              </p>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/profile">
                    <Home className="h-4 w-4 mr-2" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/seller/products">
                    <Package className="h-4 w-4 mr-2" />
                    <span>Products</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/seller/orders">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    <span>Orders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/seller/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/seller/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1">
        <div className="p-6 flex-1 flex flex-col h-full">
          <div className="flex flex-col flex-1 space-y-6">
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <h2 className="text-2xl font-semibold">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Sales</CardTitle>
                  <CardDescription>This week</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                      <span>Loading stats...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">${dashboardData?.stats?.totalSales?.toLocaleString() || 0}</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>Pending</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                      <span>Loading stats...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">{dashboardData?.stats?.pendingOrders || 0}</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Active</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                      <span>Loading stats...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">{dashboardData?.stats?.activeProducts || 0}</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                  <CardDescription>Monthly</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                      <span>Loading stats...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">${dashboardData?.stats?.monthlyRevenue?.toLocaleString() || 0}</p>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                      <span>Loading orders...</span>
                    </div>
                  ) : dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.recentOrders.slice(0, 5).map((order: RecentOrder) => (
                        <div key={order.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.map((item: OrderItem) => `${item.name} x${item.quantity}`).join(', ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${order.total?.toFixed(2) || 0}</p>
                            <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No recent orders</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Chart placeholder</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Inventory & Sales</CardTitle>
                <CardDescription>Manage your car parts inventory, stock levels, sales, and purchase history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/seller/inventory">
                  <Button className="w-full">
                    <Briefcase className="mr-2 h-4 w-4" />
                    View Inventory & Stock Levels
                  </Button>
                </Link>
                <Link href="/seller/sales">
                  <Button variant="outline" className="w-full">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Sales History (Parts Sold)
                  </Button>
                </Link>
                <Link href="/seller/purchases">
                  <Button variant="outline" className="w-full">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Purchase History (Parts Ordered)
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Store Management</CardTitle>
                <CardDescription>Manage your online store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/seller/products">
                  <Button className="w-full">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Manage Products
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
    </SidebarProvider>
  );
};

export default Profile;