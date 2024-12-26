@echo off
echo 正在打包中文阅读器...

:: 创建临时文件夹
mkdir temp_package

:: 复制必需文件
copy index.html temp_package\
copy reader.js temp_package\
copy styles.css temp_package\
copy launch_reader.vbs temp_package\
copy open_reader.bat temp_package\
copy sample.txt temp_package\
copy README.md temp_package\

:: 创建压缩包
powershell Compress-Archive -Path temp_package\* -DestinationPath 中文阅读器.zip -Force

:: 清理临时文件
rmdir /s /q temp_package

echo 打包完成！生成文件：中文阅读器.zip
pause 