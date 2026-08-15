# Improve compressor strength + friendly progress labels
$f = 'D:\AI\All TOols Folder\src\utils\gifEngine.ts'
$c = Get-Content $f -Raw -Encoding utf8

# 1. Friendly progress label - hide technical pass descriptions
$c = $c -replace 'Pass \$\{passIndex\} — \$\{describePass\(cfg\)\}', 'Compressing GIF'
$c = $c -replace 'Pass \$\{passIndex\} - \$\{describePass\(cfg\)\}', 'Compressing GIF'

# 2. Deepen adaptive resolution search: 5 -> 10 iterations, spread progress
$c = $c -replace 'for \(let k = 0; k < 5; k\+\+\) \{\r?\n        const last = lastOutcome\(\);', "for (let k = 0; k < 10; k++) {`n        const last = lastOutcome();"
$c = $c -replace 'const out = await runPass\(cfg, 58 \+ k \* 3\);', 'const out = await runPass(cfg, 58 + k * 2);'

# 3. Faster convergence margin tuning: undershoot more aggressively
$c = $c -replace 'const margin = last\.bytes > targetBytes \? 0\.9 : 1\.08;', 'const margin = last.bytes > targetBytes ? 0.82 : 1.05;'

# 4. clawBack a bit more persistent
$c = $c -replace 'for \(let k = 0; k < 4; k\+\+\) \{\r?\n            const fit = bestFit\(\);', "for (let k = 0; k < 5; k++) {`n            const fit = bestFit();"

# 5. Intermediate passes may use lossy up to bound when needed (stronger compression)
$c = $c -replace 'const cfg: PassConfig = \{\r?\n            colors: 256,\r?\n            interval: 1,\r?\n            scale,\r?\n            lossy: 0,\r?\n        \};', "const cfg: PassConfig = {`n            colors: 256,`n            interval: 1,`n            scale,`n            lossy: k >= 5 ? bounds.maxLossy : 0,`n        };"

Set-Content -Path $f -Value $c -NoNewline -Encoding utf8
Write-Output 'STRENGTH-IMPROVED'