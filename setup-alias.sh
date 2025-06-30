#!/bin/bash

echo "🔧 Configurando alias para facilitar o uso..."

# Adiciona o alias ao .bashrc
echo 'alias wg-monitor="sudo bun run index.ts"' >> ~/.bashrc

# Adiciona o alias ao .zshrc se existir
if [ -f ~/.zshrc ]; then
    echo 'alias wg-monitor="sudo bun run index.ts"' >> ~/.zshrc
fi

# Recarrega o shell
source ~/.bashrc

echo "✅ Alias configurado!"
echo "💡 Agora você pode usar: wg-monitor"
echo "💡 Ou ainda: sudo bun run index.ts" 