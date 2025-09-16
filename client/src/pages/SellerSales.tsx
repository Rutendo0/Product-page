import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Calendar, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Sale {
  id: string;
  createdAt: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface SalesStats {
  totalRevenue: number;
  totalSales: number;
  monthlyRevenue: number;
}

export default function SellerSales() {
  const { getToken } = useAuth();
  const { toast } = useToast();

  const { data: salesData, isLoading, error, refetch } = useQuery({
    queryKey: ["seller-sales"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No token available");

      const response = await fetch("/api/seller/sales", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sales");
      }

      const data = await response.json();
      return data as { stats: SalesStats; sales: Sale[] };
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load sales",
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
            <CardTitle>Error Loading Sales</CardTitle>
            <CardDescription>Failed to fetch your sales data. Please try again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = salesData?.stats || { totalRevenue: 0, totalSales: 0, monthlyRevenue: 0 };
  const sales = salesData?.sales || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sales</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Last 10 sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length > 0 ? (
            <div className="space-y-4">
              {sales.slice(0, 10).map((sale) => (
                <div key={sale.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Sale #{sale.id.slice(-8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                    <div className="text-sm">
                      {sale.items.map((item) => (
                        <div key={item.name}>{item.name} x {item.quantity}</div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${sale.total.toFixed(2)}</p>
                    <Badge className="mt-2">Completed</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No sales yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}