@echo off
echo ==========================================
echo   OBJETIVA ANALYTICS - SINCRONIZADOR
echo ==========================================
echo.
echo Adicionando alterações...
git add .
echo.
echo Criando ponto de restauração...
set commit_msg="Sincronização automatica: %date% %time%"
git commit -m %commit_msg%
echo.
echo Enviando para o GitHub...
git push origin main
echo.
echo ==========================================
echo   SINCRONIZACAO CONCLUIDA!
echo ==========================================
echo.
pause
