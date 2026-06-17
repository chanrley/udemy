# --- Funções Git ---
# Remove aliases nativos que conflitam com nossas funções
if (Test-Path Alias:gcb) { Remove-Item Alias:gcb -Force }   # Get-Clipboard
if (Test-Path Alias:gc)  { Remove-Item Alias:gc  -Force }   # Get-Content
if (Test-Path Alias:gp)  { Remove-Item Alias:gp  -Force }   # Get-ItemProperty
if (Test-Path Alias:gl)  { Remove-Item Alias:gl  -Force }   # Get-Location

function gs { git status }
function ga { git add . }
function gc { param([string]$m) git commit -m $m }
function gp { git push }
function gl { git log --oneline --graph --decorate --all }
function gpl { git pull }
function gb { git branch }
function gcb { param([string]$b) git checkout $b }

# git update branches + locals + merge release na branch atual
function gubl {
    $original = git rev-parse --abbrev-ref HEAD
    if (-not $original) { Write-Error "Não está num repositório git"; return }

    git fetch --all
    if ($LASTEXITCODE -ne 0) { return }

    $branches = git branch --format='%(refname:short)'
    foreach ($b in $branches) {
        if (-not $b) { continue }
        Write-Host ">> $b" -ForegroundColor Cyan
        git checkout $b
        if ($LASTEXITCODE -ne 0) { continue }
        git pull
    }

    git checkout $original
    git merge origin/release
}

# git update: recria branches target locais (integ/homolog/release) e sincroniza branch de trabalho com release
function gu {
    param([string]$branch)

    if (-not $branch) { $branch = git rev-parse --abbrev-ref HEAD }
    if (-not $branch) { Write-Error "Não está num repositório git"; return }

    # 1. Atualiza refs remotas
    git fetch --all
    if ($LASTEXITCODE -ne 0) { return }

    # 2. Remova suas branches target locais (sem medo, vamos recriá-las!)
    git checkout --detach
    git branch -D integ
    git branch -D homolog
    git branch -D release

    # 3. Crie uma nova conexão com a branch atualizada
    git checkout release
    git pull

    # 4. Sincronize sua branch de trabalho
    git checkout $branch
    git pull origin release
}
