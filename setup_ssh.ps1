$sshDir = "$HOME\.ssh"
if (!(Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir
}

$keyPath = "$sshDir\id_rsa"
if (Test-Path $keyPath) {
    Remove-Item $keyPath
    Remove-Item "$keyPath.pub"
}

ssh-keygen -t rsa -b 4096 -C "pattamalayalam@gmail.com" -f $keyPath -N "" -q
