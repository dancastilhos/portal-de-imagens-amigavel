
import { hostnameDbService } from "@/services/hostnameDatabase";
import { OSType } from "@/lib/types";

// Function to get the OS prefix based on the OS name
export const getOSPrefix = (os: string | OSType): string => {
  const osLower = os.toLowerCase();
  
  if (osLower.includes('windows')) return 'W';
  if (osLower.includes('mac') && osLower.includes('apple')) return 'M';
  if (osLower.includes('appliance')) return 'A';
  if (osLower.includes('cifs') || osLower.includes('storage')) return 'D';
  if (osLower.includes('enclosure')) return 'E';
  if (osLower.includes('solaris 10') || (osLower.includes('solaris') && !osLower.includes('11'))) return 'S';
  if (osLower.includes('solaris 11')) return 'L';
  if (osLower.includes('vmware')) return 'V';
  if (osLower.includes('freebsd')) return 'F';
  // All linux variants
  if (osLower.includes('linux') || 
      osLower.includes('centos') || 
      osLower.includes('rhel') ||
      osLower.includes('ubuntu') || 
      osLower.includes('debian') || 
      osLower.includes('amzn')) return 'L';
  
  // Default to 'L' if no match (most common)
  return 'L';
};

// Generate a unique number for the hostname
// Instead of random numbers, we'll fetch all existing hostnames with the same OS prefix,
// environment, and server function to ensure sequential numbering
export const generateSequentialNumber = async (
  osPrefix: string,
  environment: string,
  serverFunction: string
): Promise<number> => {
  try {
    // Get all existing hostnames
    const allHostnames = await hostnameDbService.getAllHostnames();
    
    // Filter hostnames with the same OS prefix, environment, and server function
    const matchingHostnames = allHostnames.filter(hostname => {
      const hostnameStr = hostname.hostname;
      return (
        hostnameStr.startsWith(osPrefix) &&
        hostnameStr.includes(environment) &&
        hostnameStr.includes(serverFunction)
      );
    });
    
    if (matchingHostnames.length === 0) {
      // If no existing hostnames match, start with a random 5-digit number
      return Math.floor(10000 + Math.random() * 90000);
    }
    
    // Extract the numeric part (5 digits after the prefix) from each hostname
    const numbers = matchingHostnames.map(hostname => {
      const hostnameStr = hostname.hostname;
      const numericPart = hostnameStr.substring(1, 6);
      return parseInt(numericPart, 10);
    });
    
    // Find the highest number and increment by 1
    const highestNumber = Math.max(...numbers);
    return highestNumber + 1;
  } catch (error) {
    console.error("Error generating sequential number:", error);
    // Fallback to random number
    return Math.floor(10000 + Math.random() * 90000);
  }
};

export const generateHostname = async (
  os: string | OSType,
  environment: string,
  serverFunction: string,
  node: string = "0"
): Promise<string> => {
  // Get the OS prefix based on the operating system
  const osPrefix = getOSPrefix(os);
  
  // Generate a sequential number based on existing hostnames
  const sequentialNumber = await generateSequentialNumber(osPrefix, environment, serverFunction);
  
  // Format: [OS Type][5-digit number][Environment][Server Function][Sequential Number]
  let hostname = `${osPrefix}${sequentialNumber}${environment}${serverFunction}${node}`;
  
  // Check if the hostname already exists in the database
  const exists = await hostnameDbService.checkHostnameExists(hostname);
  
  // If the hostname already exists, generate a new one recursively
  if (exists) {
    console.log(`Hostname ${hostname} already exists, generating a new one`);
    return generateHostname(os, environment, serverFunction, node);
  }
  
  return hostname;
};
