import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold?: number;
  description: string;
}

export default function SellerInventory() {
  const { getToken } = useAuth();
  const { toast } = useToast();

  const { data: products, isLoading, error, refetch } = useQuery<Product[]>({
    queryKey: ["seller-inventory"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No token available");

      const response = await fetch("/api/seller/inventory", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }

      return response.json();
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load inventory",
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
            <CardTitle>Error Loading Inventory</CardTitle>
            <CardDescription>Failed to fetch your inventory. Please try again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lowStockProducts = products?.filter(p => p.stock < 10) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>
      {lowStockProducts.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">Low Stock Alert: {lowStockProducts.length} products need restocking</span>
          </div>
        </div>
      )}
      <div className="space-y-6">
        {products && products.length > 0 ? (
          products.map((product: Product) => (
            <Card key={product.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.category}</CardDescription>
                </div>
                <Badge variant="secondary">Stock: {product.stock}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Price: ${product.price}</span>
                  <span>Sold: {product.sold || 0}</span>
                </div>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                {product.stock < 10 && (
                  <Badge variant="destructive" className="mr-auto">
                    Low Stock
                  </Badge>
                )}
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Restock
                </button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Inventory</CardTitle>
              <CardDescription>Add products to manage your inventory.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}