@echo off
echo %1 %2
set size=%2

D:\ware\ImageMagick\convert.exe -background none D:\space\vc_player\src\img\%1.svg -resize %size% D:\space\vc_player\src\img\%1.png
rem convert.bat stop_btn 48x48