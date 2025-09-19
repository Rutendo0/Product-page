import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Package, ShoppingCart, Mail, Calendar, Settings, CheckCircle, Clock, XCircle, Truck, Palette, Globe, Shield, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'shipped':
      return <Truck className="h-4 w-4 text-blue-500" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const Profile = () => {
  const { user, logout, isAuthenticated, getToken } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");

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

  // Settings functions
  const handleClearBrowsingData = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast({
      title: "Data Cleared",
      description: "Your browsing data has been cleared successfully.",
    });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast({
      title: "Language Updated",
      description: `Language changed to ${value === 'en' ? 'English' : 'Spanish'}.`,
    });
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${value === 'light' ? 'Light' : 'Dark'}.`,
    });
  };

  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked);
    toast({
      title: "Notification Settings Updated",
      description: `Email notifications ${checked ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleDeleteAccount = () => {
    // This would normally make an API call to delete the account
    toast({
      title: "Account Deletion",
      description: "Account deletion is not implemented yet. Please contact support.",
      variant: "destructive",
    });
  };

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
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-muted-foreground mt-1">Manage your account and view your orders</p>
          </div>
          <Button variant="outline" onClick={logout} className="hover:bg-destructive hover:text-destructive-foreground transition-colors">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your personal details and account overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold">{user.username}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    <Badge variant="secondary" className="mt-1">Customer Account</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">
                      ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">Member</p>
                    <p className="text-sm text-muted-foreground">Since Registration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Recent Orders
                  </CardTitle>
                  <CardDescription>Track and manage your purchases</CardDescription>
                </div>
                <Link href="/orders">
                  <Button variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                    View all orders
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4 py-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="border rounded-lg p-4 animate-pulse">
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
                        <AccordionItem key={order.id} value={order.id} className="border rounded-lg px-4 hover:border-primary/50 transition-colors">
                          <AccordionTrigger className="py-4 hover:no-underline">
                            <div className="flex items-center justify-between w-full gap-4">
                              <div className="text-left">
                                <p className="font-medium">Order #{order.id.slice(-8)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                              <div className="text-right space-y-1">
                                <p className="font-semibold">${order.total.toFixed(2)}</p>
                                <div className="flex items-center gap-1 justify-end">
                                  {getStatusIcon(order.status)}
                                  <Badge variant={order.status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                                    {order.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pb-3">
                              {order.items.map((item, idx) => (
                                <div key={`${order.id}-${idx}`} className="flex justify-between items-center text-sm bg-muted/30 p-2 rounded">
                                  <span className="text-muted-foreground">{item.name}</span>
                                  <div className="text-right">
                                    <span className="font-medium">× {item.quantity}</span>
                                    <span className="ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                              <div className="pt-3 border-t flex justify-between font-medium text-base">
                                <span>Total</span>
                                <span>${order.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    <div className="flex justify-center pt-4">
                      <Link href="/orders">
                        <Button variant="ghost" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                          View all orders →
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="relative">
                      <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-xl"></div>
                    </div>
                    <p className="text-lg font-medium mb-2">No orders yet</p>
                    <p className="text-sm mb-6">Start your shopping journey today!</p>
                    <Link href="/products">
                      <Button className="hover:scale-105 transition-transform">
                        <Package className="h-4 w-4 mr-2" />
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your account preferences and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive order updates and promotions</p>
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={handleEmailNotificationsChange}
                    />
                  </div>

                  {/* Language Preference */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                      </div>
                    </div>
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Theme Preference */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Palette className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-muted-foreground">Choose your visual theme</p>
                      </div>
                    </div>
                    <Select value={theme} onValueChange={handleThemeChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Browsing Data */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Clear Browsing Data</p>
                        <p className="text-sm text-muted-foreground">Remove stored data and preferences</p>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Clear Data
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Clear Browsing Data</DialogTitle>
                          <DialogDescription>
                            This will remove all locally stored data including preferences, cached items, and session information.
                            This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {}}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleClearBrowsingData}>
                            Clear Data
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Account Deletion */}
                  <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 hover:bg-destructive/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <Trash2 className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">Delete Account</p>
                        <p className="text-sm text-muted-foreground">Permanently delete your account</p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    Settings are saved locally. Advanced account management features (password change, profile updates) require backend support and will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;