import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Products from "@/pages/Products";
import Cart from "@/pages/Cart";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import SellerRegister from "@/pages/SellerRegister";
import VerifyEmail from "@/pages/VerifyEmail";
import Profile from "@/pages/Profile";
import Orders from "@/pages/Orders";
import SellerDashboard from "@/pages/SellerDashboard";
import Header from "@/components/layouts/Header";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Products}/>
      <Route path="/products" component={Products}/>
      <Route path="/cart" component={Cart}/>
      <Route path="/login" component={Login}/>
      <Route path="/register" component={Register}/>
      <Route path="/seller-register" component={SellerRegister}/>
      <Route path="/verify-email" component={VerifyEmail}/>
      <Route path="/search" component={Products}/>
      <Route path="/profile" component={Profile}/>
      <Route path="/orders" component={Orders}/>
      <Route path="/seller/:subpage" component={SellerDashboard}/>
      <Route path="/seller" component={SellerDashboard}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        <Router />
      </div>
      <Toaster />
    </div>
  );
}

export default App;
