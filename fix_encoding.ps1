$utf8 = New-Object System.Text.UTF8Encoding($false)
$fffd = [char]0xFFFD
$broken = [string]$fffd

$files = @('instructor.js', 'coordinator.js', 'core.js', 'app.js', 'admin.js', 'rotc.js')

foreach ($f in $files) {
    $p = "public\js\$f"
    $t = [System.IO.File]::ReadAllText($p, $utf8)
    $orig = $t

    # Multi-FFFD patterns (longer sequences first)
    # Password dots: 10x FFFD -> use bullet •
    $t = $t.Replace($broken * 10, '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;')
    
    # 3x FFFD sequences
    $t = $t.Replace($broken * 3, '-')
    
    # 2x FFFD sequences  
    $t = $t.Replace($broken * 2, '-')
    
    # Single FFFD in known contexts
    # Close button X
    $t = $t.Replace(">${broken}</button>", '>&times;</button>')
    
    # Up/down triangles (stats delta indicators)
    $t = $t.Replace(">${broken} ", '>&#9650; ')
    $t = $t.Replace(">${broken}", '>&#9650;')
    
    # Search placeholder
    $t = $t.Replace("Search${broken}", 'Search...')
    
    # Separator in notification/activity text (middle dot used as bullet separator)
    $t = $t.Replace(" ${broken} ", ' &middot; ')
    
    # Standalone remaining FFFD -> replace with dash
    $t = $t.Replace($broken, '-')
    
    if ($t -ne $orig) {
        [System.IO.File]::WriteAllText($p, $t, $utf8)
        $count = ($orig.ToCharArray() | Where-Object { [int]$_ -eq 0xFFFD }).Count
        Write-Host "Fixed $f - replaced $count FFFD chars"
    }
    else {
        Write-Host "No changes: $f"
    }
}
Write-Host "All done."
