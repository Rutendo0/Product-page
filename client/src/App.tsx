import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Products from "@/pages/Products";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/products" component={Products}/>
      <Route path="/about" component={About}/>
      <Route path="/contact" component={Contact}/>
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
