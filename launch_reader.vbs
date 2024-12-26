Option Explicit

' 创建对象
Dim objShell, objFSO, strPath, strURL, strMessage

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' 获取当前路径
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
strURL = "file:///" & Replace(strPath & "\index.html", "\", "/")

' 尝试启动浏览器
On Error Resume Next

' 尝试Edge
Err.Clear
objShell.Run "msedge """ & strURL & """", 1, False
If Err.Number = 0 Then
    strMessage = "成功使用Edge打开阅读器！"
    WScript.Quit
End If

' 尝试Chrome
Err.Clear
objShell.Run "chrome """ & strURL & """", 1, False
If Err.Number = 0 Then
    strMessage = "成功使用Chrome打开阅读器！"
    WScript.Quit
End If

' 尝试Firefox
Err.Clear
objShell.Run "firefox """ & strURL & """", 1, False
If Err.Number = 0 Then
    strMessage = "成功使用Firefox打开阅读器！"
    WScript.Quit
End If

' 使用默认浏览器
Err.Clear
objShell.Run "cmd /c start """ & strURL & """", 1, False
If Err.Number = 0 Then
    strMessage = "成功使用默认浏览器打开阅读器！"
Else
    strMessage = "无法启动浏览器，请手动打开index.html文件。"
End If

' 清理对象
Set objShell = Nothing
Set objFSO = Nothing

' 显示结果
WScript.Echo strMessage 