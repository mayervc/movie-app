#!/bin/bash

# Script para configurar el repositorio en GitHub
# Ejecuta este script en tu terminal: bash SETUP_GITHUB.sh

echo "🎬 Configurando repositorio de Movie App para GitHub..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paso 1: Inicializar Git
echo -e "${BLUE}📦 Paso 1: Inicializando Git...${NC}"
if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git ya está inicializado${NC}"
else
    git init
    echo -e "${GREEN}✅ Git inicializado${NC}"
fi
echo ""

# Paso 2: Verificar configuración de Git
echo -e "${BLUE}👤 Paso 2: Verificando configuración de Git...${NC}"
echo "Usuario: $(git config user.name)"
echo "Email: $(git config user.email)"
echo ""

# Paso 3: Agregar archivos
echo -e "${BLUE}📝 Paso 3: Agregando archivos al staging...${NC}"
git add .
echo -e "${GREEN}✅ Archivos agregados${NC}"
echo ""

# Paso 4: Crear commit inicial
echo -e "${BLUE}💾 Paso 4: Creando commit inicial...${NC}"
git commit -m "Initial commit: Movie App frontend"
echo -e "${GREEN}✅ Commit inicial creado${NC}"
echo ""

# Paso 5: Cambiar nombre de rama a main
echo -e "${BLUE}🌿 Paso 5: Configurando rama principal...${NC}"
git branch -M main
echo -e "${GREEN}✅ Rama principal configurada como 'main'${NC}"
echo ""

echo -e "${GREEN}✨ ¡Listo! Tu repositorio local está configurado.${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo ""
echo "1. Ve a https://github.com y crea un nuevo repositorio llamado 'movie-app'"
echo "2. NO inicialices con README, .gitignore o licencia (ya los tenemos)"
echo "3. Después de crear el repositorio, ejecuta estos comandos:"
echo ""
echo -e "${BLUE}   git remote add origin https://github.com/TU-USUARIO/movie-app.git${NC}"
echo -e "${BLUE}   git push -u origin main${NC}"
echo ""
echo -e "${YELLOW}💡 Reemplaza 'TU-USUARIO' con tu usuario de GitHub${NC}"
echo ""
echo "Para más detalles, revisa el archivo GITHUB_SETUP.md"
