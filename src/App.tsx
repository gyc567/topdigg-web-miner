import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { HelmetProvider } from "react-helmet-async";
import Layout from "./components/layout/Layout";
import BlogIndex from "./pages/BlogIndex";
import BlogPost from "./pages/BlogPost";
import ColumnPage from "./pages/ColumnPage";
import TwitterIndex from "./pages/TwitterIndex";
import TwitterPost from "./pages/TwitterPost";
import ExternalLinks from "./pages/ExternalLinks";
import "./i18n";
import { LanguageInitializer } from "./components/LanguageInitializer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <LanguageInitializer />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/twitter" element={<TwitterIndex />} />
              <Route path="/twitter/:slug" element={<TwitterPost />} />
              <Route path="/columns/:id" element={<ColumnPage />} />
              <Route path="/external-links" element={<ExternalLinks />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
