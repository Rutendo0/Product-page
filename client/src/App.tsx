import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Products from "@/pages/Products";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Products}/>
      <Route path="/products" component={Products}/>
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
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
