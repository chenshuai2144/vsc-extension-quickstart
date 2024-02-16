/**
 * 跳转到定义示例，本示例支持package.json中dependencies、devDependencies跳转到对应依赖包。
 */
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as util from './util';
import { CancellationToken, Position, TextDocument } from 'vscode';

/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
export function provideDefinition(document: TextDocument, position: Position) {
  const fileName = util.slash(document.fileName);
  const workDir = util.slash(path.dirname(fileName));
  const word = document.getText(document.getWordRangeAtPosition(position));
  const line = document.lineAt(position);

  // 只处理package.json文件
  if (/\/package\.json$/.test(fileName)) {
    try {
      const json = JSON.parse(document.getText());
      const dependencies = json.dependencies || {};
      const devDependencies = json.devDependencies || {};
      const packageNameRegex = /"([^"]+)":/;
      const matches = line.text.match(packageNameRegex) || [];
      const packageName = matches.length > 1 ? matches?.[1] : word;
      if (!dependencies[packageName] && !devDependencies[packageName]) {
        return;
      }

      // 因为运行环境问题，不能用 resolve
      // const destPath = require.resolve(`${packageName}`);
      let destPath = `${workDir}/node_modules/${packageName.replace(
        /"/g,
        ''
      )}/package.json`;

      if (!fs.existsSync(destPath)) {
        return '';
      }
      return new vscode.Location(
        vscode.Uri.file(destPath),
        new vscode.Position(0, 0)
      );
    } catch (error) {
      console.log(error);
    }
  }
}
