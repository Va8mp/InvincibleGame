param(
    [int]$Port = 8000
)

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Start()
} catch {
    Write-Host "Could not start the server on port $Port."
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "This usually means something else is already using that port."
    Read-Host "Press Enter to close"
    exit 1
}

Write-Host "Serving '$root'"
Write-Host "Game URL: http://localhost:$Port/index.html"
Write-Host ""
Write-Host "Keep this window open while you play. Close it when you're done."
Write-Host ""

$mimeTypes = @{
    ".html"  = "text/html"
    ".htm"   = "text/html"
    ".js"    = "application/javascript"
    ".css"   = "text/css"
    ".json"  = "application/json"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".gif"   = "image/gif"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".mp3"   = "audio/mpeg"
    ".wav"   = "audio/wav"
    ".ogg"   = "audio/ogg"
    ".otf"   = "font/otf"
    ".ttf"   = "font/ttf"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
    } catch {
        break
    }

    $request  = $context.Request
    $response = $context.Response

    $localPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
    if ($localPath -eq "/") { $localPath = "/index.html" }

    $relative = $localPath.TrimStart("/") -replace "/", [System.IO.Path]::DirectorySeparatorChar
    $filePath = Join-Path $root $relative

    if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $contentType = $mimeTypes[$ext]
        if (-not $contentType) { $contentType = "application/octet-stream" }
        $response.ContentType = $contentType
        $fileInfo = Get-Item $filePath
        $lastModified = $fileInfo.LastWriteTimeUtc.ToString("R")
        $etag = '"' + $fileInfo.Length + '-' + $fileInfo.LastWriteTimeUtc.Ticks + '"'

        # Large immutable game assets should stay in the browser cache between launches.
        if ($ext -in @('.mp3', '.wav', '.ogg', '.png', '.jpg', '.jpeg', '.gif', '.otf', '.ttf', '.woff', '.woff2')) {
            $response.Headers['Cache-Control'] = 'public, max-age=31536000, immutable'
        } else {
            $response.Headers['Cache-Control'] = 'no-cache'
        }
        $response.Headers['ETag'] = $etag
        $response.Headers['Last-Modified'] = $lastModified

        if ($request.Headers['If-None-Match'] -eq $etag) {
            $response.StatusCode = 304
            $response.OutputStream.Close()
            continue
        }
        try {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } catch {
            $response.StatusCode = 500
        }
    } else {
        $response.StatusCode = 404
        $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
        $response.OutputStream.Write($notFound, 0, $notFound.Length)
    }

    $response.OutputStream.Close()
}

$listener.Stop()
