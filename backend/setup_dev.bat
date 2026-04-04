@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0setup_dev.ps1" %*
endlocal
