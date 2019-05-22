// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "MarkdownFormat" is now active!');
  let documentFormatter = new DocumentFormatter();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('markdown', {
    provideDocumentFormattingEdits(document) {
      let content = documentFormatter.updateDocument(document);
      vscode.window.showInformationMessage('MD格式化完毕!');
      return [new vscode.TextEdit(documentFormatter.current_document_range(document), content)];
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.reFormat', () => {
    let editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
      return;
    }
    let doc = editor.document;

    // Only update status if an Markdown file
    if (doc.languageId !== "markdown") {
      return;
    }
    editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
      return;
    }

    let content = documentFormatter.updateDocument(doc);
    editor.edit((editorBuilder) => {
      editorBuilder.replace(documentFormatter.current_document_range(doc), content);
    });
    // Display a message box to the user
    vscode.window.showInformationMessage('MD格式化完毕!');
  }));
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;

class DocumentFormatter {
  /**
   * 更新文档
   */
  updateDocument(document) {
    // 获取配置
    const config = vscode.workspace.getConfiguration("MarkdownFormat");
    // 按照每行进行搞定
    let content = document.getText(this.current_document_range(document));
    let lines = [];
    let tag = true;
    // 每行操作
    lines = content.split("\n").map((line) => {
      line = line.replace(/(.*)[\r\n]$/g, "$1").replace(/(\s*$)/g, "");
      // 忽略代码块
      if (line.trim().search("```") === 0) {
        tag = !tag;
        if (tag) {
          return line + "\n";
        } else {
          return "\n" + line;
        }
      } else if (tag) {
        // 忽略 @import 语法
        if (line.trim().search(/^@import /) == -1) {
          let line_tmp = "";
          // 使用行中代码块为分割
          line.split(/(`.*?`)/).forEach(element => {
            if (element.search(/(`.*`)/) == -1) {
              // 修复 markdown 链接所使用的标点。
              if (config.get("line")) {
                element = element.replace(/[『\[]([^』\]]+)[』\]][『\[]([^』\]]+)[』\]]/g, "[$1]($2)");
                element = element.replace(/[『\[]([^』\]]+)[』\]][（(]([^』)]+)[）)]/g, "[$1]($2)");
              }
              // 注释处理
              if (config.get("note")) {
                if (element.trim().search(/^<!--.*-->$/) != -1) {
                  // 注释前后加入空行
                  element = element.replace(/(^\s*<!--.*-->)([\r\n]*)/, "\n$1\n");
                }
              }
              // 忽略链接以及注释格式
              if (!element.match(/(\[.*\])(\(.*\))/g) && !element.match(/(^\s*<.*>$)/g)) {
                // 替换全角数字
                if (config.get("replaceFullNums")) {
                  content = this.replaceFullNums(content);
                }
                // 替换全角英文和标点
                if (config.get("replaceFullChars")) {
                  content = this.replaceFullChars(content);
                }
                // 汉字后的标点符号，转成全角符号。
                if (config.get("replacePunctuations")) {
                  element = this.replacePunctuations(element);
                }
                // 汉字与其前后的英文字符、英文标点、数字间增加空白。
                if (config.get("cn")) {
                  element = element.replace(/([\u4e00-\u9fa5\u3040-\u30FF])([a-zA-Z0-9@&=\[\$\%\^\-\+(\/\\])/g, '$1 $2');
                  element = element.replace(/([a-zA-Z0-9!&;=\]\,\.\:\?\$\%\^\-\+\)\/\\])([\u4e00-\u9fa5\u3040-\u30FF])/g, "$1 $2");
                }
              }
            }
            line_tmp += element;
          });
          // 标题处理
          if (config.get("title")) {
            if (line_tmp.trim().search(/(^#{1,6}.*)([\r\n]*)/) != -1) {
              // 标题后加入一个空格
              if (line_tmp.trim().search(/(^#{1,6}\s+)([\r\n]*)/) == -1) {
                line_tmp = line_tmp.trim().replace(/(^#{1,6})(.*)/, "$1 $2");
              } else {
                line_tmp = line_tmp.trim().replace(/(^#{1,6})\s+(.*)/, "$1 $2");
              }
              // 标题前后加入空行
              line_tmp = line_tmp.trim().replace(/(^#{1,6}.*)([\r\n]*)/, "\n$1\n");
            }
          }
          line = line_tmp;
        }

      }
      return line;
    });

    let i = 1;
    content = "";
    lines.join("\n").split("\n").forEach(line => {
      if (line.trim().length === 0) {
        if (i == 0) {
          content += "\n";
        }
        i += 1;
      } else {
        i = 0;
      }
      if (i == 0) {
        content += line.replace(/(.*)[\r\n]$/g, "$1") + "\n";
      }
    });
    content = content.trim() + "\n";
    return content;
  }
  /**
   * 当前文档范围
   */
  current_document_range(doc) {
    let start = new vscode.Position(0, 0);
    let end = new vscode.Position(doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length);
    let range = new vscode.Range(start, end);
    return range;
  }
  /**
   * 替换汉字后标点
   */
  replacePunctuations(content) {
    // 汉字后的标点符号，转成全角符号。
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\.($|\s*)/g, '$1。');
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]),\s*/g, '$1，');
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]);\s*/g, '$1；');
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])!\s*/g, '$1！');
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]):\s*/g, '$1：');
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\?\s*/g, '$1？');
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\\\s*/g, '$1、');
    // 圆括号（）
    content = content.replace(/\(([\u4e00-\u9fa5\u3040-\u30FF])/g, '（$1');
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\)/g, '$1）');
    // 方括号【】
    content = content.replace(/\[([\u4e00-\u9fa5\u3040-\u30FF])/g, '【$1');
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF。！])\]/g, '$1】');
    // 尖括号《》
    content = content.replace(/<([\u4e00-\u9fa5\u3040-\u30FF])/g, '《$1');
    content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF。！])>/g, '$1》');
    content = content.replace(/。\{3,}/g, '......');
    content = content.replace(/([！？])$1{3,}/g, '$1$1$1');
    content = content.replace(/([。，；：、“”『』〖〗《》])\1{1,}/g, '$1');
    return content;
  }
  /**
   * 替换全角数字
   */
  replaceFullNums(content) {
    content = content.replace("０", "0");
    content = content.replace("１", "1");
    content = content.replace("２", "2");
    content = content.replace("３", "3");
    content = content.replace("４", "4");
    content = content.replace("５", "5");
    content = content.replace("６", "6");
    content = content.replace("７", "7");
    content = content.replace("８", "8");
    content = content.replace("９", "9");
    return content;
  }
  /**
   * 替换全角英文和标点
   */
  replaceFullChars(content) {
    // 全角英文和标点。
    content = content.replace("Ａ", "A");
    content = content.replace("Ｂ", "B");
    content = content.replace("Ｃ", "C");
    content = content.replace("Ｄ", "D");
    content = content.replace("Ｅ", "E");
    content = content.replace("Ｆ", "F");
    content = content.replace("Ｇ", "G");
    content = content.replace("Ｈ", "H");
    content = content.replace("Ｉ", "I");
    content = content.replace("Ｊ", "J");
    content = content.replace("Ｋ", "K");
    content = content.replace("Ｌ", "L");
    content = content.replace("Ｍ", "M");
    content = content.replace("Ｎ", "N");
    content = content.replace("Ｏ", "O");
    content = content.replace("Ｐ", "P");
    content = content.replace("Ｑ", "Q");
    content = content.replace("Ｒ", "R");
    content = content.replace("Ｓ", "S");
    content = content.replace("Ｔ", "T");
    content = content.replace("Ｕ", "U");
    content = content.replace("Ｖ", "V");
    content = content.replace("Ｗ", "W");
    content = content.replace("Ｘ", "X");
    content = content.replace("Ｙ", "Y");
    content = content.replace("Ｚ", "Z");
    content = content.replace("ａ", "a");
    content = content.replace("ｂ", "b");
    content = content.replace("ｃ", "c");
    content = content.replace("ｄ", "d");
    content = content.replace("ｅ", "e");
    content = content.replace("ｆ", "f");
    content = content.replace("ｇ", "g");
    content = content.replace("ｈ", "h");
    content = content.replace("ｉ", "i");
    content = content.replace("ｊ", "j");
    content = content.replace("ｋ", "k");
    content = content.replace("ｌ", "l");
    content = content.replace("ｍ", "m");
    content = content.replace("ｎ", "n");
    content = content.replace("ｏ", "o");
    content = content.replace("ｐ", "p");
    content = content.replace("ｑ", "q");
    content = content.replace("ｒ", "r");
    content = content.replace("ｓ", "s");
    content = content.replace("ｔ", "t");
    content = content.replace("ｕ", "u");
    content = content.replace("ｖ", "v");
    content = content.replace("ｗ", "w");
    content = content.replace("ｘ", "x");
    content = content.replace("ｙ", "y");
    content = content.replace("ｚ", "z");
    content = content.replace("＠", "@");
    return content;
  }
}
