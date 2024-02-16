// 'vscode' 模块包含了 VS Code 的扩展性 API
// 导入该模块并使用别名 vscode 在下面的代码中引用它
import * as vscode from 'vscode';
import { provideDefinition } from './jump-to-npm';
import {
  provideCompletionItems,
  resolveCompletionItem,
} from './umi-config-completion';
import { provideHover } from './props-hover';

// 当你的扩展被激活时，该方法会被调用
// 当你的扩展第一次执行命令时，它会被激活
export function activate(context: vscode.ExtensionContext) {
  // 使用控制台输出诊断信息 (console.log) 和错误信息 (console.error)
  // 这行代码只会在你的扩展被激活时执行一次
  console.log('恭喜，你的扩展 "qixian-test" 现在已激活！');

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(['json'], {
      provideDefinition: provideDefinition as any,
    })
  );
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      [
        'typescript',
        'javascript',
        'javascriptreact',
        'typescriptreact',
        'json',
      ],
      {
        resolveCompletionItem,
        provideCompletionItems,
      },
      '.'
    )
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      [
        'typescript',
        'javascript',
        'javascriptreact',
        'typescriptreact',
        'json',
      ],
      {
        provideHover,
      }
    )
  );
}

// 当你的扩展被停用时，该方法会被调用
export function deactivate() {}
