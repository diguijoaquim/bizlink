#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando build para Vercel...');

// Limpar cache antes do build
console.log('🧹 Limpando cache...');
try {
  execSync('npm run clear-cache', { stdio: 'inherit' });
} catch (error) {
  console.log('Cache já limpo ou erro na limpeza');
}

// Verificar se o dist existe e remover
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  console.log('🗑️ Removendo build anterior...');
  fs.rmSync(distPath, { recursive: true, force: true });
}

// Build para produção
console.log('🔨 Executando build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}

// Verificar se os arquivos foram gerados corretamente
console.log('🔍 Verificando arquivos gerados...');
const distFiles = fs.readdirSync(distPath);
const jsFiles = distFiles.filter(file => file.endsWith('.js') || file.endsWith('.mjs'));
const cssFiles = distFiles.filter(file => file.endsWith('.css'));

console.log(`📁 Total de arquivos: ${distFiles.length}`);
console.log(`📜 Arquivos JS/MJS: ${jsFiles.length}`);
console.log(`🎨 Arquivos CSS: ${cssFiles.length}`);

// Verificar se há arquivos JS
if (jsFiles.length === 0) {
  console.error('❌ Nenhum arquivo JavaScript foi gerado!');
  process.exit(1);
}

console.log('🎉 Build para Vercel concluído com sucesso!');
console.log('📤 Faça deploy na Vercel agora');
