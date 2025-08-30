#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔐 Limpando cache de usuários autenticados...');

// Diretórios específicos para usuários autenticados
const authCacheDirs = [
  'node_modules/.vite',
  'dist',
  '.vite',
  '.cache',
  'src/.auth-cache'
];

// Limpar diretórios de cache de autenticação
authCacheDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Removendo cache de auth: ${dir}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

// Limpar localStorage simulado (para desenvolvimento)
const localStorageFile = path.join(process.cwd(), '.localStorage.json');
if (fs.existsSync(localStorageFile)) {
  console.log('Removendo localStorage simulado');
  fs.unlinkSync(localStorageFile);
}

// Limpar arquivos de sessão
const sessionFiles = [
  '.session',
  '.auth-token',
  '.user-cache'
];

sessionFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`Removendo arquivo de sessão: ${file}`);
    fs.unlinkSync(fullPath);
  }
});

console.log('✅ Cache de autenticação limpo com sucesso!');
console.log('📝 Execute: npm run dev');
console.log('🔑 Faça login novamente após a limpeza');
