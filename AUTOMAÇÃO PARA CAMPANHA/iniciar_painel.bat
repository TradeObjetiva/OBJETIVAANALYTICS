@echo off
title Sistema de Pontuacao de Campanha - Trade MKT
cd /d "%~dp0"
echo ========================================================
echo   INICIANDO PAINEL DE PONTUACAO DE CAMPANHA (TRADE MKT)
echo ========================================================
echo.
echo Abrindo o servidor e iniciando a interface...
start http://127.0.0.1:5000
python app.py
pause
