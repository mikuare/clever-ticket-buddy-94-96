import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { useUpdateCheck } from "./hooks/useUpdateCheck";
import { toast } from "sonner"; // for showing toast banner

const queryClient = new QueryClient();

const App = () => {
  const updateInfo = useUpdateCheck(); // check silently

  // Show toast if update is available
  useEffect(() => {
    if (updateInfo) {
      toast(`New version ${updateInfo.latestVersion} available!`, {
        description: updateInfo.changelog,
        action: {
          label: "Update",
          onClick: () => (window.location.href = updateInfo.apkUrl),
        },
      });
    }
  }, [updateInfo]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster /> {/* shadcn toaster */}
          <Sonner />  {/* sonner toaster */}
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
