function s { shutdown -s -t 1 }
function r { shutdown -r -t 1 }
# --- Carrega módulos do profile ---

# Carrega todos os arquivos profile.*.ps1 ao lado deste profile.
$profileDir = Split-Path -Parent $PSCommandPath
Get-ChildItem -Path $profileDir -Filter 'profile.*.ps1' -ErrorAction SilentlyContinue |
    Sort-Object Name |
    ForEach-Object { . $_.FullName }


