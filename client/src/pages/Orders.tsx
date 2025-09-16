import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface Order {
  id: string;
  subtotal: number;
  paymentMethod: string;
  deliver: boolean;
  location?: string;
  fullName: string;
  phone: string;
  email: string;
  notes?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  createdAt: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

const Orders = () => {
  const { getToken, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No token available");

      const response = await fetch("/api/orders", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      return response.json();
    },
    // Only run when we have an auth token function and user is signed in
    enabled: isAuthenticated && typeof getToken === "function",
    staleTime: 60000,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Loading orders...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      
      {(!orders || orders.length === 0) ? (
        <Card>
          <CardHeader>
            <CardTitle>No Orders Yet</CardTitle>
            <CardDescription>
              You haven't placed any orders. Start shopping to track your purchases!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="destructive" onClick={() => navigate('/products')}>
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                  <CardDescription>
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant={order.status === 'delivered' ? 'default' : order.status === 'shipped' ? 'secondary' : 'outline'}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Items: {order.items.length}</span>
                  <span>Total: ${order.subtotal.toFixed(2)}</span>
                </div>
                {order.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>{item.quantity} x ${item.price.toFixed(2)}</span>
                  </div>
                ))}
                {order.deliver && order.location && (
                  <div className="text-sm text-muted-foreground">
                    Delivery to: {order.location}
                  </div>
                )}
                {order.notes && (
                  <div className="text-sm text-muted-foreground">
                    Notes: {order.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;