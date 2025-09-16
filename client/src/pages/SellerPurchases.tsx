import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Truck, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PurchaseItem {
  name: string;
  quantity: number;
  price: number;
}

interface Purchase {
  id: string;
  supplier: string;
  createdAt: string;
  total: number;
  status: 'pending' | 'received' | 'paid';
  items: PurchaseItem[];
}

export default function SellerPurchases() {
  const { getToken } = useAuth();
  const { toast } = useToast();

  const { data: purchases, isLoading, error, refetch } = useQuery<Purchase[]>({
    queryKey: ["seller-purchases"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No token available");

      const response = await fetch("/api/seller/purchases", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch purchases");
      }

      return response.json();
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load purchases",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Purchases</CardTitle>
            <CardDescription>Failed to fetch your purchases. Please try again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Purchases</h1>
      <div className="space-y-6">
        {purchases && purchases.length > 0 ? (
          purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Purchase #{purchase.id.slice(-8)}</CardTitle>
                  <CardDescription>
                    From {purchase.supplier} on {new Date(purchase.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant={purchase.status === 'received' ? 'default' : purchase.status === 'paid' ? 'secondary' : 'outline'}>
                  {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Items: {purchase.items.length}</span>
                  <span>Total: ${purchase.total.toFixed(2)}</span>
                </div>
                {purchase.items.map((item) => (
                  <div key={item.name} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>{item.quantity} x ${item.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                    View Details
                  </button>
                  {purchase.status === 'pending' && (
                    <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                      Mark Received
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Purchases</CardTitle>
              <CardDescription>No purchase orders yet.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}