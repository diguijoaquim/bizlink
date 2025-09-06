import { useState } from "react";
import { Grid3X3, List, Users, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/AppLayout";
import { InfiniteFeed } from "@/components/InfiniteFeed";

export default function Explore() {
  const [viewMode, setViewMode] = useState<"feed" | "grid" | "list">("feed");
  const [activeTab, setActiveTab] = useState("all");

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="w-full px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">Explorar</h1>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="all" className="flex items-center gap-2">
                      <Grid3X3 className="h-4 w-4" />
                      Todos
                    </TabsTrigger>
                    <TabsTrigger value="services" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Serviços
                    </TabsTrigger>
                    <TabsTrigger value="companies" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Empresas
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Usuários
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant={viewMode === "feed" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("feed")}
                    className="rounded-r-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all" className="flex items-center gap-1 text-xs">
                    <Grid3X3 className="h-3 w-3" />
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="services" className="flex items-center gap-1 text-xs">
                    <Briefcase className="h-3 w-3" />
                    Serviços
                  </TabsTrigger>
                  <TabsTrigger value="companies" className="flex items-center gap-1 text-xs">
                    <Building2 className="h-3 w-3" />
                    Empresas
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-1 text-xs">
                    <Users className="h-3 w-3" />
                    Usuários
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          {viewMode === "feed" ? (
            <InfiniteFeed />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid3X3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Modo de visualização em desenvolvimento
              </h3>
              <p className="text-muted-foreground mb-4">
                Use o modo "Feed" para uma experiência completa de rede social.
              </p>
              <Button onClick={() => setViewMode("feed")}>
                Voltar ao Feed
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}