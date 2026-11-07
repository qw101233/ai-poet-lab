# AI Poet Lab · GitHub 仓库创建与推送脚本（一次性工具）
# 用法：powershell -File scripts/publish-github.ps1 -Token <gh_pat>
# 不传 Token 时回退读 $env:TEMP\gh_token4.txt
param(
    [string]$Token = "",
    [string]$RepoName = "ai-poet-lab",
    [string]$Description = "AI 智能诗歌实验室 —— 输入主题与情感，一键生成唐诗、宋词与现代诗，并自动绘制水墨意境配图",
    [string]$RepoPath = ""
)

$ErrorActionPreference = "Stop"

if (-not $Token) {
    $Token = (Get-Content -Raw -Encoding UTF8 "$env:TEMP\gh_token4.txt").Trim()
}
if (-not $RepoPath) {
    $RepoPath = Split-Path -Parent $PSScriptRoot
}

$headers = @{
    Authorization        = "Bearer $Token"
    Accept               = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
    "User-Agent"         = "AI-Poet-Lab"
}

Write-Output "==> 验证 Token"
$user = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
Write-Output "    登录用户: $($user.login)"

Write-Output "==> 检查仓库是否已存在"
$repoUrl = "https://api.github.com/repos/$($user.login)/$RepoName"
$exists = $false
try {
    Invoke-RestMethod -Uri $repoUrl -Headers $headers | Out-Null
    $exists = $true
    Write-Output "    仓库已存在，跳过创建"
} catch {
    Write-Output "==> 创建仓库 $RepoName"
    $body = @{
        name        = $RepoName
        description = $Description
        private    = $false
        auto_init  = $false
        has_issues  = $true
        has_wiki    = $false
        homepage    = ""
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Headers $headers -Method Post -Body $body -ContentType "application/json" | Out-Null
    Write-Output "    创建成功"
}

Write-Output "==> 推送代码"
Push-Location $RepoPath
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
git config http.postBuffer 524288000
$remoteName = "origin"
$existing = @(& git remote)
if ($existing -contains $remoteName) { git remote remove $remoteName }
git remote add $remoteName "https://$($user.login):$Token@github.com/$($user.login)/$RepoName.git"
git push -u $remoteName main
git remote set-url $remoteName "https://github.com/$($user.login)/$RepoName.git"
Pop-Location

Write-Output ""
Write-Output "✓ 完成: https://github.com/$($user.login)/$RepoName"
