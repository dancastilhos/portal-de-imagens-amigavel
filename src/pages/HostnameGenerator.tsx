
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Database, List, CheckCircle2, XCircle } from "lucide-react";
import HostnameTable from "@/components/hostname/HostnameTable";
import HostnameForm from "@/components/hostname/HostnameForm";
import { HostnameRecord } from "@/lib/types";
import { hostnameDbService } from "@/services/hostnameDatabase";
import PortalButton from "@/components/PortalButton";

const HostnameGenerator = () => {
  const [hostnames, setHostnames] = useState<HostnameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [dbConnection, setDbConnection] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: "Verificando conexão com o banco de dados..."
  });
  const [hostnameCount, setHostnameCount] = useState<number>(0);

  const testDatabaseConnection = async () => {
    try {
      const result = await hostnameDbService.testConnection();
      setDbConnection(result);
    } catch (error) {
      console.error("Erro ao testar conexão com o banco de dados:", error);
      setDbConnection({
        connected: false,
        message: "Erro ao conectar com o banco de dados"
      });
    }
  };

  const fetchHostnameCount = async () => {
    try {
      const count = await hostnameDbService.getHostnameCount();
      setHostnameCount(count);
    } catch (error) {
      console.error("Erro ao buscar contagem de hostnames:", error);
    }
  };

  const fetchHostnames = async () => {
    setIsLoading(true);
    try {
      const data = await hostnameDbService.getAllHostnames();
      setHostnames(data);
    } catch (error) {
      console.error("Error fetching hostnames:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testDatabaseConnection();
    fetchHostnameCount();
    
    if (activeTab === "list") {
      fetchHostnames();
    }
  }, [activeTab]);

  const handleSaveHostname = (hostname: HostnameRecord) => {
    setHostnames([hostname, ...hostnames]);
    setActiveTab("list");
    // Atualizar a contagem de hostnames após adicionar um novo
    fetchHostnameCount();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="bg-white border-b border-border">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="animate-text-appear flex items-center">
              <div className="mr-4">
                <img 
                  src="/lovable-uploads/de4049d4-86cc-4abe-a276-91e83e974ee7.png" 
                  alt="BTG Pactual Logo" 
                  className="h-52 w-auto"
                />
              </div>
              <div>
                <div className="chip bg-blue-500/10 text-blue-600">HOSTNAME GENERATOR</div>
                <div className="flex items-center mt-1">
                  <h1 className="text-3xl font-semibold">Hostname Generator</h1>
                </div>
                <p className="text-muted-foreground mt-1">
                  Create and manage standardized hostnames for your infrastructure
                </p>
              </div>
            </div>
            <PortalButton />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Status do Banco de Dados:</span>
            <div className="flex items-center">
              {dbConnection.connected ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span>Conectado ao MariaDB</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span>{dbConnection.message}</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            Total de registros no banco: {hostnameCount}
          </div>
        </div>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-6xl mx-auto"
        >
          <TabsList className="mb-8">
            <TabsTrigger value="create" className="flex items-center gap-1">
              <Server className="h-4 w-4" />
              Create Hostname
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <List className="h-4 w-4" />
              Hostname List
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="animate-fade-in">
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <HostnameForm onSave={handleSaveHostname} />
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="animate-fade-in">
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Hostname Database
                </h2>
                <div className="text-sm text-muted-foreground">
                  {hostnameCount} entradas encontradas na tabela CREATE_HOSTNAME
                </div>
              </div>
              <HostnameTable hostnames={hostnames} isLoading={isLoading} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BTG Pactual - Hostname Generator
            </p>
            <div className="flex items-center mt-4 md:mt-0">
              <span className={`text-xs ${dbConnection.connected ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                {dbConnection.connected ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Conectado ao HOSTNAME_GEN MariaDB database
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Não conectado ao banco de dados
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HostnameGenerator;
