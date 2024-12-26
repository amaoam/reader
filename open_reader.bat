@echo off
echo 正在启动中文阅读器...
echo.

REM 尝试使用Microsoft Edge
echo 尝试使用Microsoft Edge打开...
start msedge "file:///%~dp0index.html"
if %errorlevel% equ 0 (
    echo 成功使用Edge打开！
    goto :end
)

REM 如果Edge失败，尝试Chrome
echo 尝试使用Chrome打开...
start chrome "file:///%~dp0index.html"
if %errorlevel% equ 0 (
    echo 成功使用Chrome打开！
    goto :end
)

REM 如果Chrome失败，尝试Firefox
echo 尝试使用Firefox打开...
start firefox "file:///%~dp0index.html"
if %errorlevel% equ 0 (
    echo 成功使用Firefox打开！
    goto :end
)

REM 如果特定浏览器都失败，使用默认浏览器
echo 使用系统默认浏览器打开...
start "" "file:///%~dp0index.html"
if %errorlevel% equ 0 (
    echo 成功使用默认浏览器打开！
) else (
    echo 打开失败，请手动打开index.html文件
    pause
)

:end
timeout /t 2 >nul 