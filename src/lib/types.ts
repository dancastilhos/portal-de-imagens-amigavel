
export interface Component {
  ssm: string;
  crowdstrike: string;
  deepsecurity?: string;
  splunk: string;
  tenable: string;
  zabbix?: string;
  others?: string;
}

export interface BlockDevice {
  device_name: string;
  ebs: {
    delete_on_termination: string;
    volume_size: number;
    volume_type: string;
    throughput: number;
    iops: number;
  };
}

export interface AMIVersion {
  version: string;
  imageName: string;
  validation: {
    test: boolean;
  };
  release: {
    org: string;
    source_ami_id: string;
    deprecate: boolean;
  };
  components: Component;
  block_device?: BlockDevice[];
}

export interface FormData {
  os: string;
  currentVersion: string;
  imageName: string;
  test: boolean;
  sourceAmiId: string;
  org: string[];
  deprecate: boolean;
  ssm: string;
  crowdstrike: string;
  deepsecurity: string;
  splunk: string;
  tenable: string;
  zabbix: string;
  others: string;
  volumeSize: number;
}

export type OSType = 
  | "amzn-linux-2" 
  | "amzn-linux-2023" 
  | "centos-7" 
  | "centos-8" 
  | "debian11" 
  | "debian12" 
  | "ubuntu20" 
  | "ubuntu22" 
  | "ubuntu24" 
  | "windows-2019" 
  | "windows-2022";

export interface OSOption {
  id: OSType;
  name: string;
  logoPath: string;
  description: string;
}

export interface DiskConfig {
  size: number;
  name: string;
}

export interface NetworkConfig {
  name: string;
  type: string;
}

export interface VMwareFormData {
  vcenterServer: string;
  vcenterUser: string;
  vcenterPassword: string;
  validateCerts: boolean;
  vmName: string;
  templateName: string;
  datacenterName: string;
  clusterName: string;
  environment?: string;
  serverFunction?: string;
  disks: DiskConfig[];
  networks: NetworkConfig[];
  memoryMb: number;
  numCpus: number;
  powerOn: boolean;
}

// New interfaces for hostname generator
export interface HostnameRecord {
  id?: number;
  code: string;
  hostname: string;
  domain: string;
  os: string;
  environment: string;
  server_function: string;
  node: string;
  site: string;
  ip: string;
  sec_ip: string;
  updated_by: string;
  system: string;
  description: string;
  object: string;
  alias: string;
  status: string;
  project: string;
  owner: string;
  updatetime?: string;
}

export interface HostnameFormData {
  os: string;
  environment: string;
  serverFunction: string;
  node: string;
  site: string;
  domain: string;
  system: string;
  description: string;
  project: string;
  owner: string;
  status: string;
  object?: string;
  alias?: string;
}
