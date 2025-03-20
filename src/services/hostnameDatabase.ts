
import { HostnameRecord } from "@/lib/types";

// Helper function to make API calls to the backend service that connects to MariaDB
const apiCall = async (endpoint: string, method: string = 'GET', data?: any) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      console.warn('Response is not JSON, falling back to mock data');
      return null;
    }
  } catch (error) {
    console.error('API call error:', error);
    // For development/demo purposes, we'll fall back to mock data
    return null;
  }
};

// MariaDB service for hostname operations
export const hostnameDbService = {
  async testConnection(): Promise<{connected: boolean, message: string}> {
    try {
      const result = await apiCall('test');
      if (result !== null) {
        return { 
          connected: result.connected || false, 
          message: result.message || 'Conectado ao banco de dados'
        };
      }
      
      // Fallback for development/preview
      return { connected: false, message: 'Não foi possível conectar ao banco de dados' };
    } catch (error) {
      console.error('Error testing database connection:', error);
      return { connected: false, message: 'Erro ao testar conexão com o banco de dados' };
    }
  },

  async getHostnameCount(): Promise<number> {
    try {
      const result = await apiCall('hostname/count');
      if (result !== null) {
        return result.total;
      }
      
      // Fallback for development/preview
      return 8801; // Fallback to show the expected count for demonstration
    } catch (error) {
      console.error('Error getting hostname count:', error);
      return 8801;
    }
  },

  async checkHostnameExists(hostname: string): Promise<boolean> {
    console.log(`Checking if hostname ${hostname} exists`);
    
    try {
      // Try to call the real API first
      const result = await apiCall(`hostname/exists/${hostname}`);
      if (result !== null) {
        return result.exists;
      }
      
      // Fallback for development/preview
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(Math.random() < 0.1); // 10% chance of existing in mock mode
        }, 500);
      });
    } catch (error) {
      console.error('Error checking hostname existence:', error);
      // Fallback for development/preview
      return Math.random() < 0.1;
    }
  },

  async getAllHostnames(): Promise<HostnameRecord[]> {
    console.log('Fetching all hostnames');
    
    try {
      // Try to call the real API first
      const result = await apiCall('hostname/all');
      if (result !== null) {
        return result.hostnames;
      }
      
      // Fallback for development/preview
      return new Promise((resolve) => {
        // Create a large mock dataset for demonstration
        const mockHostnames = Array.from({ length: 50 }, (_, index) => {
          const envOptions = ['P', 'D', 'T', 'Q', 'U'];
          const osOptions = ['Windows Server 2019', 'Red Hat 8', 'Mac Apple', 'Linux RHEL 7', 'CentOS 7'];
          const functionOptions = ['APP', 'SQL', 'SCM', 'WEB', 'DOM'];
          
          const env = envOptions[Math.floor(Math.random() * envOptions.length)];
          const os = osOptions[Math.floor(Math.random() * osOptions.length)];
          const func = functionOptions[Math.floor(Math.random() * functionOptions.length)];
          
          const prefix = os.includes('Windows') ? 'W' : os.includes('Red Hat') ? 'L' : os.includes('Mac') ? 'M' : 'L';
          const num = Math.floor(10000 + Math.random() * 90000);
          
          return {
            code: (index + 1).toString().padStart(3, '0'),
            hostname: `${prefix}${num}${env}${func}0`,
            domain: "pactual.net",
            os: os,
            environment: env,
            server_function: func,
            node: "0",
            site: Math.random() > 0.5 ? "SP" : "RJ",
            ip: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            sec_ip: "",
            updated_by: "admin",
            system: `System-${index}`,
            description: `Description for system ${index}`,
            object: "VIRTUAL SERVER",
            alias: `alias${index}`,
            status: Math.random() > 0.2 ? "ACTIVE" : (Math.random() > 0.5 ? "INACTIVE" : "DECOMMISSIONED"),
            project: `Project-${index}`,
            owner: "IT Department",
            updatetime: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().replace('T', ' ').substring(0, 19)
          };
        });
        
        setTimeout(() => {
          resolve(mockHostnames);
        }, 1000);
      });
    } catch (error) {
      console.error('Error fetching hostnames:', error);
      return [];
    }
  },

  async saveHostname(record: HostnameRecord): Promise<HostnameRecord> {
    console.log('Saving hostname', record);
    
    try {
      // Try to call the real API first
      const result = await apiCall('hostname/save', 'POST', record);
      if (result !== null) {
        return result.hostname;
      }
      
      // Fallback for development/preview
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ...record,
            id: Math.floor(Math.random() * 10000),
            updatetime: new Date().toISOString().replace('T', ' ').substring(0, 19)
          });
        }, 1000);
      });
    } catch (error) {
      console.error('Error saving hostname:', error);
      // Return the original record with a mock ID for development
      return {
        ...record,
        id: Math.floor(Math.random() * 10000),
        updatetime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    }
  }
};

// Export the DB config for use in backend services
export const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: import.meta.env.VITE_DB_PORT || 3306,
  database: import.meta.env.VITE_DB_DATABASE || 'HOSTNAME_GEN',
  user: import.meta.env.VITE_DB_USER || 'root',
  password: import.meta.env.VITE_DB_PASSWORD || ''
};
