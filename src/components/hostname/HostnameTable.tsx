
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { HostnameRecord } from "@/lib/types";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface HostnameTableProps {
  hostnames: HostnameRecord[];
  isLoading: boolean;
}

const HostnameTable = ({ hostnames, isLoading }: HostnameTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar os hostnames com base no termo de busca
  const filteredHostnames = hostnames.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.hostname.toLowerCase().includes(searchLower) ||
      record.domain.toLowerCase().includes(searchLower) ||
      record.environment.toLowerCase().includes(searchLower) ||
      record.server_function.toLowerCase().includes(searchLower) ||
      record.ip.toLowerCase().includes(searchLower) ||
      (record.site && record.site.toLowerCase().includes(searchLower)) ||
      (record.system && record.system.toLowerCase().includes(searchLower))
    );
  });

  // Calcular o total de páginas
  const totalPages = Math.ceil(filteredHostnames.length / itemsPerPage);

  // Obter os hostnames para a página atual
  const currentHostnames = filteredHostnames.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportToExcel = () => {
    if (hostnames.length === 0) {
      return;
    }

    // Create header row
    const headers = ['Hostname', 'Domain', 'OS', 'Environment', 'Function', 'Site', 'IP', 'Status', 'Project', 'Owner'];
    
    // Create data rows
    const rows = hostnames.map(record => [
      record.hostname,
      record.domain,
      record.os,
      record.environment,
      record.server_function,
      record.site,
      record.ip,
      record.status,
      record.project,
      record.owner
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `hostname_list_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hostnames.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Nenhum registro de hostname encontrado
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="w-full max-w-sm">
          <Input
            type="text"
            placeholder="Buscar hostnames..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full"
          />
        </div>
        <Button 
          onClick={exportToExcel} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Exportar para Excel
        </Button>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hostname</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Function</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentHostnames.map((record, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono">{record.hostname}</TableCell>
                  <TableCell>{record.domain}</TableCell>
                  <TableCell>{record.os}</TableCell>
                  <TableCell>{record.environment}</TableCell>
                  <TableCell>{record.server_function}</TableCell>
                  <TableCell>{record.site}</TableCell>
                  <TableCell>{record.ip}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      record.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell>{record.project}</TableCell>
                  <TableCell>{record.owner}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredHostnames.length)} de {filteredHostnames.length} registros
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Lógica para mostrar páginas ao redor da página atual
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                  }
                  if (currentPage > totalPages - 2) {
                    pageNum = totalPages - 5 + i + 1;
                  }
                }
                if (pageNum <= totalPages) {
                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-9 h-9 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-1">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-9 h-9 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostnameTable;
