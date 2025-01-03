# 中文阅读器 (Chinese Reader)

一个优雅、功能丰富的在线文本阅读器，专为中文读者设计。

## ✨ 特色功能

### 📚 书籍管理
- 支持导入和管理多本 TXT 格式的电子书
- 智能书架管理，按阅读状态分类（全部、在读、已读完、已收藏）
- 自动保存阅读进度，随时继续上次阅读
- 阅读历史记录和统计

### 📖 阅读体验
- 自适应页面布局，支持全屏阅读
- 可调节字体大小、行间距和页面边距
- 多种预设背景颜色，护眼模式
- 支持深色/浅色主题切换
- 平滑的翻页效果
- 精确的阅读进度显示

### 📝 笔记功能
- 支持选中文本添加笔记
- 笔记分类管理（普通、重要、疑问、想法、标记）
- 支持为笔记添加标签
- 笔记导出功能
- 笔记搜索和过滤

### 🔍 搜索功能
- 全文搜索
- 高亮显示搜索结果
- 书籍搜索
- 笔记搜索

### ⌨️ 快捷键支持
- `←/→` : 上一页/下一页
- `Ctrl + B` : 显示/隐藏书架
- `Ctrl + N` : 显示/隐藏笔记
- `Ctrl + T` : 切换主题
- `F11` : 全屏模式

### 🎯 其他功���
- 阅读完成提醒和鼓励
- 阅读时长统计
- 自动保存设置
- 响应式设计，支持移动设备

## 🚀 快速开始

1. 下载项目文件
2. 双击运行 `launch_reader.vbs` 或 `open_reader.bat`
3. 将 TXT 文件拖入阅读器窗口，或点击"选择文件"按钮导入
4. 开始享受阅读！

## 💻 使用说明

### 导入书籍
- 直接将 TXT 文件拖放到阅读器窗口
- 点击"选择文件"按钮选择 TXT 文件
- 点击书架中的"导入书籍"按钮批量导入

### 阅读设置
- 点击工具栏的"Aa"按钮调整字体
- 点击"⚙️"按钮打开设置面板
- 在设置面板中可以调整：
  - 背景颜色（预设或自定义）
  - 字体大小
  - 行间距
  - 页面边距

### 笔记管理
1. 选中文本后双击可快速添加笔记
2. 在笔记面板中可以：
   - 查看所有笔记
   - 按分类筛选笔记
   - 编辑和删除笔记
   - 导出笔记

## 🛠️ 技术实现

- 纯原生 JavaScript 实现，无需任何框架
- 使用 HTML5 和 CSS3 特性
- localStorage 实现数据持久化
- 响应式设计，适配多种设备
- 模块化的代码结构，易于维护和扩展

## 🔜 未来计划

- [ ] 支持更多文件格式（EPUB、PDF等）
- [ ] 添加书签功能
- [ ] 支持云端同步
- [ ] 添加阅读统计和数据分���
- [ ] 支持自定义主题
- [ ] 添加目录解析功能
- [ ] 支持多语言界面
- [ ] 添加朗读功能

## 🤝 参与贡献

欢迎贡献代码或提出建议！您可以：

1. Fork 本项目
2. 创建新的功能分支
3. 提交您的更改
4. 创建 Pull Request

## 📄 开源协议

本项目采用 MIT 协议开源，详见 [LICENSE](LICENSE) 文件。

## 🌟 推广建议

### 如何分享这个阅读器

1. **社交媒体分享**
   - 在微信、微博等平台分享使用体验
   - 制作简短的演示视频
   - 分享到技术社区（如掘金、知乎）

2. **技术社区推广**
   - GitHub 开源
   - 发布到 Chrome 应用商店
   - 分享到开源中国
   - 在 V2EX 等技术社区分享

3. **实用价值推广**
   - 强调无需安装的便利性
   - 突出隐私保护特性
   - 展示跨平台使用优势

4. **教育领域推广**
   - 向学校和教育机构推荐
   - 制作教程视频
   - 收集用户反馈持续改进

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 Issue
- 发送邮件至：[您的邮箱]
- 关注微信公众号：[公众号名称]

感谢使用中文阅读器！

## 📥 安装说明

### 方法一：直接下载使用（推荐）

1. 下载阅读器压缩包：[中文阅读器.zip]
2. 解压到任意位置（如：D:\中文阅读器）
3. 双击运行 `launch_reader.vbs` 或 `open_reader.bat`
4. 开始使用！

### 方法二：手动安装

1. 创建一个新文件夹（如：D:\中文阅读器）
2. 复制以下文件到文件夹中：
   - `index.html`
   - `reader.js`
   - `styles.css`
   - `launch_reader.vbs`
   - `open_reader.bat`
   - `sample.txt`（可选的示例文件）

### 系统要求
- Windows 7/8/10/11
- 支持的浏览器：
  - Chrome 90+
  - Firefox 88+
  - Edge 90+
  - Opera 76+

### 常见问题

1. **无法打开阅读器？**
   - 确保已安装现代浏览器（推荐使用 Chrome）
   - 检查是否有杀毒软件拦截
   - 尝试使用管理员权限运行

2. **文件打不开？**
   - 确保文件是 UTF-8 编码的 TXT 文件
   - 文件名避免使用特殊字符

3. **设置保存不了？**
   - 检查浏览器是否允许本地存储
   - 清理浏览器缓存后重试

### 便携版制作方法

想要制作便携版本（如U盘随身携带）：

1. 创建文件夹 `中文阅读器_便携版`
2. 复制所有必需文件到该文件夹
3. 将文件夹复制到U盘即可
4. 在任何电脑上插入U盘后运行即可使用

### 分发建议

分享给他人时，建议：

1. 将所有文件打包为 zip 压缩包
2. 提供完整的安装说明
3. 附带一个示例 TXT 文件
4. 说明系统要求和注意事项 