import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "./components/layout/Layout";
import "./i18n";
import { LanguageInitializer } from "./components/LanguageInitializer";

const Index = lazy(() => import("./pages/Index"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const TwitterIndex = lazy(() => import("./pages/TwitterIndex"));
const TwitterPost = lazy(() => import("./pages/TwitterPost"));
const ColumnPage = lazy(() => import("./pages/ColumnPage"));
const ExternalLinks = lazy(() => import("./pages/ExternalLinks"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <HelmetProvider>
    <TooltipProvider>
      <LanguageInitializer />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</div>}>
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
          </Suspense>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </HelmetProvider>
);

export default App;
