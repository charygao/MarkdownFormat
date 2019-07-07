# MarkdownFormat README

MD 格式化 插件

<https://marketplace.visualstudio.com/items?itemName=liushilive.markdownformat>

我自己用的挺好的，主要用于格式化 MD 文档。

如果你有其他的想法可以告诉我。

## 已经实现功能

* 标题前后加入空行

* 标题后加入一个空格

* 文档最末尾一空行

* 中英文符号替换

* 汉字后的标点符号，转成全角符号。

* 全角数字 转半角

* 全角英文和标点 转半角

* 汉字后的标点符号，转成全角符号。

* 修复 markdown 链接所使用的标点。

* 汉字与其前后的英文字符、英文标点、数字间增加空白。

* 保持代码块不受影响，代码块前后增加一空行 ` ``` `

* `<!-- -->` 注释前后增加一空行

* 保持链接原样不受影响  `()[]`

## 配置

支持个性化配置`格式化的规则`。

```json
{
  // 汉字与其前后的英文字符、英文标点、数字间增加空白
  "MarkdownFormat.cn": true,

  // 修复 markdown 链接所使用的标点
  "MarkdownFormat.line": true,

  // 全角英文和 @ 符号替换为半角
  "MarkdownFormat.replaceFullChars": true,

  // 全角数字替换为半角
  "MarkdownFormat.replaceFullNums": true,

  // 汉字后的标点符号，转成全角符号
  "MarkdownFormat.replacePunctuations": true,

  // 标题处理：标题后加入一个空格、标题前后加入空行
  "MarkdownFormat.title": true,

  // 注释处理：注释前后加入空行
  "MarkdownFormat.note": true
}
```

## 键盘快捷键

>已添加文件格式化绑定，无需绑定快捷键，使用系统格式化文件快捷键即可。

使用以下内容在 `keybindings.json` 中嵌入格式化快捷方式。替换为您的首选键绑定。

```json
{
  "key": "ctrl+alt+l",
  "command": "extension.reFormat",
  "when": "editorLangId == markdown && !editorReadonly"
}
```

<liushilive@outlook.com>

## 更改

* 0.0.10 版本 新增 `<!-- -->` 注释前后增加一空行
* 0.0.11 版本 忽略行内代码格式化
* 0.0.12 版本 添加文件格式化绑定
* 0.0.13 版本
  * 新增：忽略 `@import` 语法格式化
  * 修改：忽略注释、代码块中的格式化
  * 修复：标题中存在行内代码导致错误换行
* 0.0.14 版本
  * 去除格式化提示
* 0.0.15 版本
  * 去除代码片段多行精简，保留代码原有格式
* 0.0.16 版本
  * 英文与其前后的英文标点、数字间增加空白

**Enjoy!**
