# Genera le icone PNG dell'app da un disegno vettoriale equivalente a icons/icon.svg.
# Uso:  powershell -ExecutionPolicy Bypass -File scripts/make-icons.ps1
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$iconsDir = Join-Path $root 'icons'
New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = [float]($r * 2)
  if ($d -gt $w) { $d = $w }
  if ($d -gt $h) { $d = $h }
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-Icon([int]$size, [string]$file, [bool]$maskable) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

  $scale = $size / 512.0
  $rect = New-Object System.Drawing.Rectangle -ArgumentList 0, 0, $size, $size
  $bgA = [System.Drawing.Color]::FromArgb(255, 11, 18, 32)
  $bgB = [System.Drawing.Color]::FromArgb(255, 20, 41, 74)
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList $rect, $bgA, $bgB, ([single]45)

  if ($maskable) {
    $g.FillRectangle($bgBrush, $rect)
  } else {
    $bgPath = New-RoundedPath 0 0 $size $size ($size * 0.22)
    $g.FillPath($bgBrush, $bgPath)
    $bgPath.Dispose()
  }
  $bgBrush.Dispose()

  $margin = 88 * $scale
  $gap = 32 * $scale
  $tile = 152 * $scale
  $radius = 26 * $scale
  $lineWidth = [float][Math]::Max(1, 3 * $scale)

  $positions = @(
    @($margin, $margin),
    @(($margin + $tile + $gap), $margin),
    @($margin, ($margin + $tile + $gap)),
    @(($margin + $tile + $gap), ($margin + $tile + $gap))
  )

  $tileTop = [System.Drawing.Color]::FromArgb(255, 125, 211, 252)
  $tileBottom = [System.Drawing.Color]::FromArgb(255, 29, 78, 216)
  $linePen = New-Object System.Drawing.Pen -ArgumentList ([System.Drawing.Color]::FromArgb(51, 255, 255, 255)), $lineWidth

  foreach ($pos in $positions) {
    $tx = [float]$pos[0]
    $ty = [float]$pos[1]
    $tileRect = New-Object System.Drawing.RectangleF -ArgumentList $tx, $ty, $tile, $tile
    $tileBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList $tileRect, $tileTop, $tileBottom, ([single]90)
    $tilePath = New-RoundedPath $tx $ty $tile $tile $radius
    $g.FillPath($tileBrush, $tilePath)

    $mx = [float]($tx + $tile / 2)
    $my = [float]($ty + $tile / 2)
    $g.DrawLine($linePen, $mx, $ty, $mx, ($ty + $tile))
    $g.DrawLine($linePen, $tx, $my, ($tx + $tile), $my)

    # Riflesso interno al singolo pannello (il gioco tra i pannelli resta scuro).
    $shineRect = New-Object System.Drawing.RectangleF -ArgumentList $tx, $ty, $tile, $tile
    $shineA = [System.Drawing.Color]::FromArgb(70, 255, 255, 255)
    $shineB = [System.Drawing.Color]::FromArgb(0, 255, 255, 255)
    $shineBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList $shineRect, $shineA, $shineB, ([single]90)
    $g.FillPath($shineBrush, $tilePath)
    $shineBrush.Dispose()

    $tilePath.Dispose()
    $tileBrush.Dispose()
  }

  $linePen.Dispose()

  $g.Dispose()
  $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host ("Creato {0} ({1}x{1})" -f $file, $size)
}

New-Icon 192 (Join-Path $iconsDir 'icon-192.png') $false
New-Icon 512 (Join-Path $iconsDir 'icon-512.png') $false
New-Icon 512 (Join-Path $iconsDir 'maskable-512.png') $true
New-Icon 180 (Join-Path $iconsDir 'apple-touch-icon.png') $true
Write-Host 'Icone generate.'
