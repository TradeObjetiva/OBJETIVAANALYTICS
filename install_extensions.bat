@echo off
echo ===================================================
echo   INSTALADOR DE EXTENSOES DO VS CODE
echo ===================================================
echo.
echo Instalando extensoes recomendadas para o Objetiva Analytics...
echo.

call code --install-extension dbaeumer.vscode-eslint
call code --install-extension esbenp.prettier-vscode
call code --install-extension ritwickdey.liveserver
call code --install-extension mikestead.dotenv
call code --install-extension mechatroner.rainbow-csv
call code --install-extension GrapeCity.gc-excelviewer
call code --install-extension christian-kohler.path-intellisense
call code --install-extension formulahendry.auto-close-tag
call code --install-extension formulahendry.auto-rename-tag

echo.
echo ===================================================
echo   INSTALACAO CONCLUIDA COM SUCESSO!
echo ===================================================
echo.
pause
