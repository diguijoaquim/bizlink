#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Limpando cache do projeto...');

// Diretórios para limpar
const dirsToClean = [
  'node_modules/.vite',
  'dist',
  '.vite',
  '.cache'
];

// Limpar diretórios
dirsToClean.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Removendo: ${dir}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

// Limpar arquivos de lock
const lockFiles = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml'
];

lockFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`Removendo: ${file}`);
    fs.unlinkSync(fullPath);
  }
});

console.log('✅ Cache limpo com sucesso!');
console.log('📝 Execute: npm install && npm run dev');
