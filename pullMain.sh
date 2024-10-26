<<<<<<< HEAD
#!/bin/bash

# Verificar que se haya pasado un argumento
if [ $# -ne 1 ]; then
    echo "Uso: ./pullMain.sh <nombre-de-la-rama>"
    exit 1
fi

# Obtener el nombre de la rama de la línea de comandos
branch_name=$1

# Cambiar a la rama especificada
git checkout "$branch_name"

# Cambiar a la rama principal
=======
git checkout jose
>>>>>>> jose
git checkout main

# Hacer pull de la rama principal
git pull origin main
<<<<<<< HEAD

# Regresar a la rama especificada
git checkout "$branch_name"

# Hacer merge de la rama principal
=======
git checkout jose
>>>>>>> jose
git merge main

# Instrucciones para resolver conflictos si los hay
echo "Resuelve los conflictos si hay."
