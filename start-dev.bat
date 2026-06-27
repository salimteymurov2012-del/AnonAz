@echo off
cd /d "C:\Users\User\Desktop\AnonAZ\backend"
start /B "" "C:\Program Files\nodejs\node.exe" index.js
echo Backend started on :4000
cd /d "C:\Users\User\Desktop\AnonAZ"
"C:\Program Files\nodejs\npm.cmd" run dev
