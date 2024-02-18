import path from 'path';
import fs from 'fs';
import { Position, TextDocument } from 'vscode';
import { slash, getProjectPath } from './util';
import * as vscode from 'vscode';

const apiJson = require('@ant-design/doc/api/umi.json');

const apiMap = apiJson?.reduce((pre: any, cur: any) => {
  if (cur.properties) {
    cur.properties.forEach((item: any) => {
      if (item.property && item.property.length > 0) {
        item.property.forEach((child: any) => {
          if (child.property && child.property.length > 0) {
            child.property.forEach((sub: any) => {
              pre[sub.title] = sub;
            });
          } else {
            pre[child.title] = child;
          }
        });
      } else {
        pre[item.title] = item;
      }
    });
  }
  return pre;
}, {});

/**
 * 鼠标悬停提示，当鼠标停在package.json的dependencies或者devDependencies时，
 * 自动显示对应包的名称、版本号和许可协议
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
export function provideHover(document: TextDocument, position: Position) {
  const fileName = slash(document.fileName);
  const workDir = getProjectPath(document);
  const word = document.getText(document.getWordRangeAtPosition(position));
  const line = document.lineAt(position);
  if (/\/package\.json$/.test(fileName)) {
    const packageNameRegex = /"([^"]+)":/;

    const matches = line.text.match(packageNameRegex) || [];
    const packageName = matches.length > 1 ? matches?.[1] : word;
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

  const relativePath = slash(path.relative(workDir, fileName));
  if (['config/config.ts', '.umirc.ts'].includes(relativePath)) {
    let api = apiMap[word];

    if (api) {
      return new vscode.Hover(api.md);
    }
  }

  if (
    ['src/app.tsx', 'src/app.ts', 'src/requestErrorConfig.ts'].includes(
      relativePath
    )
  ) {
    if (
      line.text.startsWith('export const ') ||
      line.text.startsWith('export async function ') ||
      line.text.startsWith('export function ')
    ) {
      let api = apiMap[word];
      // hack code
      if (word === 'getInitialState') {
        return new vscode.Hover(apiMap['数据流'].md);
      }
      if (api) {
        return new vscode.Hover(api.md);
      }
    }
  }

  return null;
}
