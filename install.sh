#!/bin/bash

echo "🚀 Configurando ambiente Bun WireGuard..."

# Verifica se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script precisa ser executado como root (sudo)"
    echo "💡 Execute: sudo ./install.sh"
    exit 1
fi

echo "✅ Executando como root"

# Instala o Bun se não estiver instalado
if ! command -v bun &> /dev/null; then
    echo "📦 Instalando Bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
    echo "✅ Bun instalado!"
else
    echo "✅ Bun já está instalado"
fi

# Configura o PATH para o usuário atual
echo "🔧 Configurando PATH..."
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verifica se o WireGuard está instalado
if ! command -v wg &> /dev/null; then
    echo "📦 Instalando WireGuard..."
    
    # Detecta a distribuição Linux
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt update
        apt install -y wireguard
    elif [ -f /etc/redhat-release ]; then
        # RHEL/CentOS/Fedora
        yum install -y wireguard-tools
    elif [ -f /etc/arch-release ]; then
        # Arch Linux
        pacman -S --noconfirm wireguard-tools
    else
        echo "❌ Distribuição não suportada para instalação automática"
        echo "💡 Instale o WireGuard manualmente: https://www.wireguard.com/install/"
    fi
else
    echo "✅ WireGuard já está instalado"
fi

# Instala dependências do projeto
echo "📦 Instalando dependências do projeto..."
bun install

echo "🎉 Configuração concluída!"
echo "💡 Execute: bun run index.ts" 