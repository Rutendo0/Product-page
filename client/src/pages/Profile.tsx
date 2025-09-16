import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Package, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const Profile = () => {
  const { user, logout, isAuthenticated, getToken } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user) return;
      try {
        setLoading(true);
        const token = await getToken();
        if (token) {
          const response = await fetch("/api/orders", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data: Order[] = await response.json();
            setOrders(data);
          } else {
            console.error("Failed to fetch orders");
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user?.id]);

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

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <Badge variant="secondary" className="mt-1">Customer</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Track your purchases</CardDescription>
                </div>
                <Link href="/orders">
                  <Button variant="secondary">View all orders</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4 py-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex justify-between mb-3">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-3 w-72" />
                      </div>
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                      {orders.slice(0, 5).map((order) => (
                        <AccordionItem key={order.id} value={order.id} className="border rounded-lg px-4">
                          <AccordionTrigger className="py-4">
                            <div className="flex items-center justify-between w-full gap-4">
                              <div className="text-left">
                                <p className="font-medium">Order #{order.id.slice(-8)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">${order.total.toFixed(2)}</p>
                                <Badge variant={order.status === 'paid' ? 'default' : 'secondary'} className="mt-1 capitalize">
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pb-3">
                              {order.items.map((item, idx) => (
                                <div key={`${order.id}-${idx}`} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                              <div className="pt-2 border-t mt-3 flex justify-between font-medium">
                                <span>Total</span>
                                <span>${order.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    <div className="flex justify-center">
                      <Link href="/orders">
                        <Button variant="ghost">View all orders</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders yet</p>
                    <Link href="/products">
                      <Button className="mt-4">
                        <Package className="h-4 w-4 mr-2" />
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;