param(
  [Parameter(Mandatory=$true)]
  [string]$BackendApiKey
)

$orig = $env:BACKEND_API_KEY
$env:BACKEND_API_KEY = $BackendApiKey

Write-Host "Building with BACKEND_API_KEY set for this session..."
npm run build

# restore
if ($orig) { $env:BACKEND_API_KEY = $orig } else { Remove-Item Env:\BACKEND_API_KEY -ErrorAction SilentlyContinue }
Write-Host "Build finished. BACKEND_API_KEY restored." 
