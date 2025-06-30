#!/usr/bin/env bun

import { spawn } from "child_process";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

interface WireGuardInterface {
  name: string;
  status: string;
  publicKey?: string;
  privateKey?: string;
  address?: string;
  listenPort?: number;
  peers?: WireGuardPeer[];
}

interface WireGuardPeer {
  publicKey: string;
  endpoint?: string;
  allowedIPs?: string[];
  latestHandshake?: string;
  transferRx?: number;
  transferTx?: number;
  persistentKeepalive?: number;
}

class WireGuardManager {
  /**
   * Executa um comando no sistema e retorna o resultado
   */
  async runCommand(command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr) {
        console.warn(`Aviso: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
      throw new Error(`Erro ao executar comando: ${error}`);
    }
  }

  /**
   * Verifica se o WireGuard está instalado no sistema
   */
  async isWireGuardInstalled(): Promise<boolean> {
    try {
      await this.runCommand("wg --version");
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Lista todas as interfaces WireGuard disponíveis
   */
  async listInterfaces(): Promise<string[]> {
    try {
      const output = await this.runCommand("wg show interfaces");
      return output.split("\n").filter(line => line.trim());
    } catch (error) {
      console.error("Erro ao listar interfaces:", error);
      return [];
    }
  }

  /**
   * Obtém informações detalhadas de uma interface WireGuard
   */
  async getInterfaceInfo(interfaceName: string): Promise<WireGuardInterface | null> {
    try {
      // Usa aspas simples para escapar o nome da interface com espaços
      const output = await this.runCommand(`wg show '${interfaceName}'`);
      const lines = output.split("\n");
      
      const wgInterface: WireGuardInterface = {
        name: interfaceName,
        status: "active",
        peers: []
      };

      let currentPeer: WireGuardPeer | null = null;

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith("public key:")) {
          if (currentPeer) {
            wgInterface.peers!.push(currentPeer);
          }
          currentPeer = {
            publicKey: trimmedLine.split(":")[1]?.trim() || ""
          };
        } else if (trimmedLine.startsWith("endpoint:")) {
          if (currentPeer) {
            currentPeer.endpoint = trimmedLine.split(":")[1]?.trim();
          }
        } else if (trimmedLine.startsWith("allowed ips:")) {
          if (currentPeer) {
            currentPeer.allowedIPs = trimmedLine.split(":")[1]?.trim().split(", ") || [];
          }
        } else if (trimmedLine.startsWith("latest handshake:")) {
          if (currentPeer) {
            currentPeer.latestHandshake = trimmedLine.split(":")[1]?.trim();
          }
        } else if (trimmedLine.startsWith("transfer:")) {
          if (currentPeer) {
            const transfer = trimmedLine.split(":")[1]?.trim() || "";
            const [rx, tx] = transfer.split(", ");
            currentPeer.transferRx = parseInt(rx?.split(" ")[0] || "0");
            currentPeer.transferTx = parseInt(tx?.split(" ")[0] || "0");
          }
        } else if (trimmedLine.startsWith("persistent keepalive:")) {
          if (currentPeer) {
            currentPeer.persistentKeepalive = parseInt(trimmedLine.split(":")[1]?.trim() || "0");
          }
        }
      }

      if (currentPeer) {
        wgInterface.peers!.push(currentPeer);
      }

      return wgInterface;
    } catch (error) {
      console.error(`Erro ao obter informações da interface ${interfaceName}:`, error);
      return null;
    }
  }

  /**
   * Obtém o status de todas as interfaces WireGuard
   */
  async getAllInterfacesStatus(): Promise<WireGuardInterface[]> {
    const interfaces = await this.listInterfaces();
    const results: WireGuardInterface[] = [];

    for (const interfaceName of interfaces) {
      const info = await this.getInterfaceInfo(interfaceName);
      if (info) {
        results.push(info);
      }
    }

    return results;
  }

  /**
   * Obtém estatísticas de transferência de uma interface
   */
  async getTransferStats(interfaceName: string): Promise<{ rx: number; tx: number } | null> {
    try {
      // Usa aspas simples para escapar o nome da interface com espaços
      const output = await this.runCommand(`wg show '${interfaceName}' dump`);
      const lines = output.split("\n");
      
      let totalRx = 0;
      let totalTx = 0;

      for (const line of lines) {
        const parts = line.split("\t");
        if (parts.length >= 7) {
                  totalRx += parseInt(parts[6] || "0") || 0;
        totalTx += parseInt(parts[7] || "0") || 0;
        }
      }

      return { rx: totalRx, tx: totalTx };
    } catch (error) {
      console.error(`Erro ao obter estatísticas da interface ${interfaceName}:`, error);
      return null;
    }
  }
}

// Função principal para demonstrar o uso
async function main() {
  console.log("🔍 Verificando informações do WireGuard...\n");

  const wgManager = new WireGuardManager();

  // Verifica se o WireGuard está instalado
  const isInstalled = await wgManager.isWireGuardInstalled();
  if (!isInstalled) {
    console.log("❌ WireGuard não está instalado ou não está disponível no PATH");
    console.log("💡 Instale o WireGuard primeiro: https://www.wireguard.com/install/");
    return;
  }

  console.log("✅ WireGuard está instalado!\n");

  const output = await wgManager.runCommand("wg show");
  console.log(output);

  // Lista todas as interfaces
  const interfaces = await wgManager.listInterfaces();
  
  if (interfaces.length === 0) {
    console.log("📭 Nenhuma interface WireGuard encontrada");
    return;
  }

  // Obtém informações detalhadas de cada interface
  for (const interfaceName of interfaces) {
    console.log(`🔍 Analisando interface: ${interfaceName}`);
    
    const info = await wgManager.getInterfaceInfo(interfaceName);
    if (info) {
      console.log(`   Status: ${info.status}`);
      console.log(`   Peers conectados: ${info.peers?.length || 0}`);
      
      if (info.peers && info.peers.length > 0) {
        console.log("   📊 Detalhes dos peers:");
        for (const peer of info.peers) {
          console.log(`      🔑 ${peer.publicKey.substring(0, 8)}...`);
          if (peer.endpoint) {
            console.log(`         Endpoint: ${peer.endpoint}`);
          }
          if (peer.latestHandshake) {
            console.log(`         Último handshake: ${peer.latestHandshake}`);
          }
          if (peer.transferRx !== undefined && peer.transferTx !== undefined) {
            console.log(`         Transferência: ${peer.transferRx} B recebidos, ${peer.transferTx} B enviados`);
          }
        }
      }
    }

    // Obtém estatísticas de transferência
    const stats = await wgManager.getTransferStats(interfaceName);
    if (stats) {
      console.log(`   📈 Estatísticas totais:`);
      console.log(`      Recebido: ${stats.rx} bytes`);
      console.log(`      Enviado: ${stats.tx} bytes`);
    }
    
    console.log("");
  }
}

// Executa o programa se for chamado diretamente
if (import.meta.main) {
  main().catch(console.error);
}

export { WireGuardManager };
export type { WireGuardInterface, WireGuardPeer };
