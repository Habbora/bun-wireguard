# Bun WireGuard Manager

Um programa simples em Bun para gerenciar e obter informações do WireGuard.

## 🚀 O que este programa faz?

Este programa permite que você:

- ✅ Liste todas as interfaces WireGuard ativas
- 📊 Veja informações detalhadas de cada interface
- 👥 Monitore os peers conectados
- 📈 Acompanhe estatísticas de transferência
- 🔍 Verifique o status das conexões

## 📋 Pré-requisitos

1. **Bun instalado** - [Instalar Bun](https://bun.sh/)
2. **WireGuard instalado** - [Instalar WireGuard](https://www.wireguard.com/install/)

## 🛠️ Como usar

### 1. Instalar dependências
```bash
bun install
```

### 2. Executar o programa
```bash
bun run index.ts
```

### 3. Usar como módulo
```typescript
import { WireGuardManager } from './index.ts';

const wgManager = new WireGuardManager();

// Listar interfaces
const interfaces = await wgManager.listInterfaces();
console.log(interfaces);

// Obter informações de uma interface específica
const info = await wgManager.getInterfaceInfo('wg0');
console.log(info);
```

## 📖 Explicação do Código

### Estrutura Principal

O programa é dividido em algumas partes importantes:

#### 1. **Interfaces TypeScript**
```typescript
interface WireGuardInterface {
  name: string;
  status: string;
  peers?: WireGuardPeer[];
}

interface WireGuardPeer {
  publicKey: string;
  endpoint?: string;
  allowedIPs?: string[];
  latestHandshake?: string;
  transferRx?: number;
  transferTx?: number;
}
```

Estas interfaces definem a estrutura dos dados que vamos trabalhar.

#### 2. **Classe WireGuardManager**
Esta é a classe principal que contém todos os métodos para interagir com o WireGuard:

- `listInterfaces()` - Lista todas as interfaces
- `getInterfaceInfo()` - Obtém detalhes de uma interface
- `getTransferStats()` - Obtém estatísticas de transferência
- `isWireGuardInstalled()` - Verifica se o WireGuard está instalado

#### 3. **Execução de Comandos**
```typescript
private async runCommand(command: string): Promise<string> {
  const { stdout, stderr } = await execAsync(command);
  return stdout.trim();
}
```

Este método executa comandos do sistema (como `wg show interfaces`) e retorna o resultado.

### Como Funciona

1. **Verificação**: Primeiro verifica se o WireGuard está instalado
2. **Listagem**: Lista todas as interfaces WireGuard ativas
3. **Análise**: Para cada interface, obtém informações detalhadas
4. **Exibição**: Mostra os resultados de forma organizada

## 🔧 Comandos WireGuard Utilizados

O programa usa estes comandos do WireGuard:

- `wg --version` - Verifica se está instalado
- `wg show interfaces` - Lista interfaces
- `wg show <interface>` - Mostra detalhes da interface
- `wg show <interface> dump` - Dados brutos para estatísticas

## 📊 Exemplo de Saída

```
🔍 Verificando informações do WireGuard...

✅ WireGuard está instalado!

📋 Interfaces WireGuard encontradas: wg0

🔍 Analisando interface: wg0
   Status: active
   Peers conectados: 2
   📊 Detalhes dos peers:
      🔑 abc12345...
         Endpoint: 192.168.1.100:51820
         Último handshake: 2 minutes, 15 seconds ago
         Transferência: 1024 B recebidos, 2048 B enviados
      🔑 def67890...
         Endpoint: 10.0.0.50:51820
         Último handshake: 1 minute, 30 seconds ago
         Transferência: 512 B recebidos, 1024 B enviados

   📈 Estatísticas totais:
      Recebido: 1536 bytes
      Enviado: 3072 bytes
```

## 🎯 Para que serve?

Este programa é útil para:

- **Administradores de rede** que precisam monitorar conexões WireGuard
- **Desenvolvedores** que querem integrar monitoramento WireGuard em suas aplicações
- **Usuários** que querem entender melhor como suas conexões VPN estão funcionando

## 🚨 Permissões

⚠️ **Importante**: Este programa precisa de permissões de administrador para acessar informações do WireGuard. Execute com:

```bash
sudo bun run index.ts
```

## 🤝 Contribuindo

Sinta-se à vontade para contribuir com melhorias! Algumas ideias:

- Adicionar suporte para criar/remover interfaces
- Implementar monitoramento em tempo real
- Adicionar interface web
- Suporte para configurações de múltiplos servidores

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.
