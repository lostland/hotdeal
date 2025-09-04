import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import HowToFindRealDeals from "@/pages/how-to-find-real-deals";
import BlackFridayGuide from "@/pages/black-friday-guide";
import CreditCardBenefits from "@/pages/credit-card-benefits";
import TravelHotdeals from "@/pages/travel-hotdeals";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/post/how-to-find-real-deals" component={HowToFindRealDeals} />
      <Route path="/post/black-friday-guide" component={BlackFridayGuide} />
      <Route path="/post/credit-card-benefits" component={CreditCardBenefits} />
      <Route path="/post/travel-hotdeals" component={TravelHotdeals} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
