#!/bin/bash

echo "🚀 Executando Bun WireGuard Manager..."

# Verifica se o Bun está disponível
if ! command -v bun &> /dev/null; then
    echo "❌ Bun não encontrado no PATH"
    echo "💡 Verifique se o Bun está instalado: bun --version"
    echo "💡 Ou instale: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Verifica se o WireGuard está disponível
if ! command -v wg &> /dev/null; then
    echo "❌ WireGuard não encontrado no PATH"
    echo "💡 Instale o WireGuard: sudo apt install wireguard"
    exit 1
fi

echo "✅ Bun e WireGuard encontrados!"

# Verifica se o usuário tem permissão sudo
if ! sudo -n true 2>/dev/null; then
    echo "🔐 Solicitando permissões de administrador..."
    echo "💡 O programa precisa de privilégios para acessar informações do WireGuard"
fi

# Executa o programa com sudo
echo "🔍 Executando programa..."
sudo bun run index.ts 