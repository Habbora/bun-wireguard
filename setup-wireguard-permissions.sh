#!/bin/bash

echo "🔧 Configurando permissões WireGuard para usuário sem sudo..."

# Verifica se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script precisa ser executado como root"
    echo "💡 Execute: sudo ./setup-wireguard-permissions.sh"
    exit 1
fi

echo "✅ Executando como root"

# Verifica se o comando wg existe
if [ ! -f /usr/bin/wg ]; then
    echo "❌ WireGuard não encontrado em /usr/bin/wg"
    echo "💡 Instale o WireGuard primeiro: sudo apt install wireguard"
    exit 1
fi

# Verifica se o sistema suporta capabilities
if ! command -v setcap &> /dev/null; then
    echo "❌ Sistema não suporta capabilities"
    echo "💡 Instale: sudo apt install libcap2-bin"
    exit 1
fi

echo "📦 Instalando libcap2-bin se necessário..."
apt update && apt install -y libcap2-bin

# Configura capabilities para o comando wg
echo "🔐 Configurando capabilities para WireGuard..."
setcap cap_net_admin+ep /usr/bin/wg

# Verifica se funcionou
if getcap /usr/bin/wg | grep -q "cap_net_admin"; then
    echo "✅ Capabilities configuradas com sucesso!"
else
    echo "❌ Erro ao configurar capabilities"
    exit 1
fi

# Configura permissões do dispositivo tun
echo "🔧 Configurando permissões do dispositivo tun..."
if [ -e /dev/net/tun ]; then
    chmod 666 /dev/net/tun
    echo "✅ Permissões do /dev/net/tun configuradas"
else
    echo "⚠️ Dispositivo /dev/net/tun não encontrado"
fi

# Cria grupo wireguard se não existir
if ! getent group wireguard > /dev/null 2>&1; then
    echo "👥 Criando grupo wireguard..."
    groupadd wireguard
fi

# Adiciona usuário ao grupo wireguard
echo "👤 Adicionando usuário ao grupo wireguard..."
usermod -aG wireguard alisson

echo ""
echo "🎉 Configuração concluída!"
echo "💡 Faça logout e login novamente para aplicar as mudanças"
echo "💡 Ou execute: newgrp wireguard"
echo ""
echo "🔍 Para testar:"
echo "   wg show interfaces"
echo "   bun run index.ts" 