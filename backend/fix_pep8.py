#!/usr/bin/env python3
"""
Script pour corriger automatiquement les erreurs PEP8 dans app_fastapi.py
"""
import re
import sys

def fix_pep8_blank_lines(file_path):
    """Ajouter deux lignes vides avant les fonctions décorées."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Correction des espaces entre le décorateur @app.get("/api/health") et la fonction
    pattern1 = r'(@app\.get\("/api/health"\))\n(async def health_check)'
    replacement1 = r'\1\n\n\n\2'
    content = re.sub(pattern1, replacement1, content)
    
    # Correction des espaces entre le décorateur @app.get("/{path:path}") et la fonction
    pattern2 = r'(@app\.get\("/{path:path}"\))\n(async def serve_react)'
    replacement2 = r'\1\n\n\n\2'
    content = re.sub(pattern2, replacement2, content)
    
    # Écrire le contenu corrigé
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"Corrections PEP8 appliquées à {file_path}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = "app_fastapi.py"  # Par défaut
    
    fix_pep8_blank_lines(file_path) 