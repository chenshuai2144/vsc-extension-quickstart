import path from 'path';
import fs from 'fs';
import { Position, TextDocument } from 'vscode';
import { slash } from './util';
import * as vscode from 'vscode';
/**
 * 鼠标悬停提示，当鼠标停在package.json的dependencies或者devDependencies时，
 * 自动显示对应包的名称、版本号和许可协议
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
export function provideHover(document: TextDocument, position: Position) {
  const fileName = slash(document.fileName);
  const workDir = path.dirname(fileName);
  const word = document.getText(document.getWordRangeAtPosition(position));
  const packageNameRegex = /"([^"]+)":/;
  const line = document.lineAt(position);
  const matches = line.text.match(packageNameRegex) || [];
  const packageName = matches.length > 1 ? matches?.[1] : word;
  if (/\/package\.json$/.test(fileName)) {
    let destPath = `${workDir}/node_modules/${packageName.replace(
      /"/g,
      ''
    )}/package.json`;

    if (fs.existsSync(destPath)) {
      const content = require(destPath);
      return new vscode.Hover(
        `* **名称**：${content.name}\n* **当前安装版本**：${content.version}`
      );
    }
  }
}
