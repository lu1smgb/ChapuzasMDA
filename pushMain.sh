#!/bin/bash

# Verificar que se haya pasado un argumento
if [ $# -ne 1 ]; then
    echo "Uso: ./pushMain.sh <nombre-de-la-rama>"
    exit 1
fi

# Obtener el nombre de la rama de la línea de comandos
branch_name=$1

# Cambiar a la rama principal
git checkout main

# Hacer pull de la rama principal
git pull origin main
<<<<<<< HEAD

# Hacer merge de la rama especificada en la rama principal
git merge "$branch_name"

# Instrucciones para resolver conflictos si los hay
echo "Si hay conflictos, resuélvelos antes de continuar."

# Comprobar si hay conflictos
if [ $? -ne 0 ]; then
    echo "Conflictos encontrados durante el merge."
    exit 1
fi

# Agregar cambios y hacer commit
git add .
git commit -m "Merge $branch_name -> main"
git push origin main

# Regresar a la rama especificada
git checkout "$branch_name"

echo "Merge completado y vuelto a la rama $branch_name."
=======
git merge jose
#Resolver conflictos
git add .
git commit -m "Merge jose->main"
git push origin main
git checkout jose
>>>>>>> jose
