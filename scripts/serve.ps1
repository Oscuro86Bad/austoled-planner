param([int]$Port = 8080)

$root = Split-Path -Parent $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
  $listener.Start()
} catch {
  Write-Error "Impossibile avviare il server sulla porta $Port. Prova un'altra porta: .\scripts\serve.ps1 -Port 8081"
  exit 1
}

Write-Host "AUSTOLED PLANNER su http://localhost:$Port/ (Ctrl+C per fermare)"

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.ico'  = 'image/x-icon'
  '.txt'  = 'text/plain; charset=utf-8'
  '.md'   = 'text/markdown; charset=utf-8'
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $request = $context.Request
  $response = $context.Response

  try {
    $relative = [Uri]::UnescapeDataString($request.Url.AbsolutePath)
    if ($relative -eq '/' -or $relative -eq '') { $relative = '/index.html' }

    $file = [IO.Path]::GetFullPath((Join-Path $root $relative.TrimStart('/').Replace('/', '\')))
    $rootFull = [IO.Path]::GetFullPath($root)

    if ($file.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path $file -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($file)
      $ext = [IO.Path]::GetExtension($file).ToLowerInvariant()
      $response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $response.ContentLength64 = $bytes.Length
      $response.Headers.Add('Cache-Control', 'no-cache')
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $response.StatusCode = 404
      $body = [Text.Encoding]::UTF8.GetBytes('File non trovato')
      $response.ContentType = 'text/plain; charset=utf-8'
      $response.ContentLength64 = $body.Length
      $response.OutputStream.Write($body, 0, $body.Length)
    }
  } catch {
    $response.StatusCode = 500
  } finally {
    $response.Close()
  }
}
