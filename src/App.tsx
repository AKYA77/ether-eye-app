import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Whitelist from "./pages/Whitelist";
import Scanner from "./pages/Scanner";
import TradeDetail from "./pages/TradeDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-10 flex items-center border-b border-border bg-surface-1 px-2 shrink-0">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <span className="ml-3 text-[10px] text-muted-foreground uppercase tracking-widest">
                  Solana Direct-Pair Arbitrage Backtester
                </span>
              </header>
              <Routes>
                <Route path="/" element={<Settings />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/whitelist" element={<Whitelist />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/trade/:id" element={<TradeDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
