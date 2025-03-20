
import { AMIVersion, Component, FormData } from "./types";

/**
 * Generates the next version number based on the current version
 */
export function generateNextVersion(currentVersion: string): string {
  // Parse the current version and increment by 1.0
  const versionNumber = parseFloat(currentVersion);
  const nextVersion = (versionNumber + 1.0).toFixed(1);
  return nextVersion;
}

/**
 * Transforms form data into an AMI version block
 */
export function createAMIVersionBlock(formData: FormData): AMIVersion {
  const nextVersion = generateNextVersion(formData.currentVersion);
  
  // Create components object
  const components: Component = {
    ssm: formData.ssm,
    crowdstrike: formData.crowdstrike,
    splunk: formData.splunk,
    tenable: formData.tenable
  };
  
  // Add optional components if they have values
  if (formData.deepsecurity) components.deepsecurity = formData.deepsecurity;
  if (formData.zabbix) components.zabbix = formData.zabbix;
  if (formData.others) components.others = formData.others;
  
  return {
    version: nextVersion,
    imageName: formData.imageName,
    validation: {
      test: formData.test
    },
    release: {
      org: formData.org.join(','),
      source_ami_id: formData.sourceAmiId,
      deprecate: formData.deprecate
    },
    components,
    block_device: [
      {
        device_name: "/dev/sda1",
        ebs: {
          delete_on_termination: "true",
          volume_size: formData.volumeSize || 30,
          volume_type: "gp3",
          throughput: 125,
          iops: 3000
        }
      }
    ]
  };
}

/**
 * Transforms an AMI version block into Terragrunt HCL format
 */
export function formatToTerragrunt(amiVersion: AMIVersion): string {
  const { version, imageName, validation, release, components, block_device } = amiVersion;
  
  // Format components
  const componentsStr = Object.entries(components)
    .map(([key, value]) => `          ${key} = "${value}"`)
    .join('\n');
  
  // Format block device if available
  let blockDeviceStr = '';
  if (block_device && block_device.length > 0) {
    const device = block_device[0];
    blockDeviceStr = `
        block_device = [
          {
            device_name = "${device.device_name}"
            ebs = {
              delete_on_termination = "${device.ebs.delete_on_termination}"
              volume_size           = ${device.ebs.volume_size}
              volume_type           = "${device.ebs.volume_type}"
              throughput            = ${device.ebs.throughput}
              iops                  = ${device.ebs.iops}
            }
          }
        ]`;
  }
  
  // Format the full HCL block
  return `
    "${version}" = {
      "${imageName}" = {
        validation = {
          test = ${validation.test}
        }
        release = {
          org = "${release.org}"
          source_ami_id = "${release.source_ami_id}"
          deprecate = ${release.deprecate}
        }
        componets = {
${componentsStr}
        }${blockDeviceStr}
      }
    }`;
}

/**
 * Creates a complete terragrunt.hcl file with the new AMI version block
 */
export function createFullTerragruntHCL(osType: string, amiVersion: AMIVersion): string {
  // Determinar a variável principal com base no tipo de OS
  let osVariable = "";
  
  if (osType.includes("windows")) {
    osVariable = osType === "windows-2019" ? "win_19" : "win_22";
  } else if (osType.includes("amzn")) {
    osVariable = osType === "amzn-linux-2" ? "amzn_linux_2" : "amzn_linux_2023";
  } else if (osType.includes("centos")) {
    osVariable = osType === "centos-7" ? "centos_7" : "centos_8";
  } else if (osType.includes("debian")) {
    osVariable = osType === "debian11" ? "debian_11" : "debian_12";
  } else if (osType.includes("ubuntu")) {
    if (osType === "ubuntu20") osVariable = "ubuntu_20";
    else if (osType === "ubuntu22") osVariable = "ubuntu_22";
    else if (osType === "ubuntu24") osVariable = "ubuntu_24";
  }
  
  const amiVersionBlock = formatToTerragrunt(amiVersion);
  
  return `include "root" {
  path = find_in_parent_folders()
  expose = true
}

dependency "bucket" {
  config_path = "../../../s3/ami-management"
}

inputs = {
  ${osVariable} = {${amiVersionBlock}
  }
  environment = include.root.locals.env
  bucket_name = dependency.bucket.outputs.bucket_name
}`;
}

/**
 * Mock function to simulate sending data to a backend
 */
export async function submitToBackend(formData: FormData): Promise<{ success: boolean; message: string }> {
  // This would normally be an API call
  console.log("Submitting data to backend:", formData);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return success response (in a real app, this would be from the server)
  return {
    success: true,
    message: `Successfully created new version ${generateNextVersion(formData.currentVersion)} for ${formData.os}`
  };
}
