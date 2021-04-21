'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { camelCase, startCase } from 'lodash';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "generate-from-protos" is now active!',
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  // let disposableMapper = vscode.commands.registerCommand(
  //   'extension.generateMapper',
  //   () => {
  //     // The code you place here will be executed every time your command is executed

  //     const editor = vscode.window.activeTextEditor;
  //     if (!editor) {
  //       return;
  //     }
  //     let code = ``;
  //     let reverse: boolean = false;

  //     for (let selection of editor.selections) {
  //       reverse = selection.isReversed;
  //     }

  //     let selections: vscode.Selection[];
  //     if (reverse) {
  //       selections = editor.selections.reverse();
  //     } else {
  //       selections = editor.selections;
  //     }

  //     for (let selection of selections) {
  //       code += editor.document.getText(selection);
  //       code += `\n`;
  //     }

  //     let text = code;

  //     if (text.length < 1) {
  //       vscode.window.showErrorMessage('No selected properties.');
  //       return;
  //     }

  //     try {
  //       var mapper = createMapper(text);
  //       editor.edit((e) =>
  //         e.insert(selections[selections.length - 1].end, mapper),
  //       );
  //     } catch (error) {
  //       console.log(error);
  //       vscode.window.showErrorMessage(
  //         'Something went wrong! Try that the properties are in this format: "private String name;"',
  //       );
  //     }
  //   },
  // );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposableModel = vscode.commands.registerCommand(
    'extension.generateModel',
    () => {
      // The code you place here will be executed every time your command is executed

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      let code = ``;
      let reverse: boolean = false;

      for (let selection of editor.selections) {
        reverse = selection.isReversed;
      }

      let selections: vscode.Selection[];
      if (reverse) {
        selections = editor.selections.reverse();
      } else {
        selections = editor.selections;
      }

      for (let selection of selections) {
        code += editor.document.getText(selection);
        code += `\n`;
      }

      let text = code;

      if (text.length < 1) {
        vscode.window.showErrorMessage('No selected properties.');
        return;
      }

      try {
        var model = createModel(text);
        // editor.edit((e) =>
        //   e.insert(selections[selections.length - 1].end, model),
        // );
        vscode.env.clipboard.writeText(model);
        // vscode.env.clipboard.readText().then((text)=>{
        //   clipboard_content = text;
        //   /* code */
        // });
      } catch (error) {
        console.log(error);
        vscode.window.showErrorMessage(
          'Something went wrong! look in the vscode developer tools"',
        );
      }
    },
  );
  let disposableService = vscode.commands.registerCommand(
    'extension.generateModel',
    () => {
      // The code you place here will be executed every time your command is executed

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      let code = ``;
      let reverse: boolean = false;

      for (let selection of editor.selections) {
        reverse = selection.isReversed;
      }

      let selections: vscode.Selection[];
      if (reverse) {
        selections = editor.selections.reverse();
      } else {
        selections = editor.selections;
      }

      for (let selection of selections) {
        code += editor.document.getText(selection);
        code += `\n`;
      }

      let text = code;

      if (text.length < 1) {
        vscode.window.showErrorMessage('No selected properties.');
        return;
      }

      try {
        var model = createService(text);
        vscode.env.clipboard.writeText(model);
      } catch (error) {
        console.log(error);
        vscode.window.showErrorMessage(
          'Something went wrong! look in the vscode developer tools"',
        );
      }
    },
  );

  context.subscriptions.push(disposableModel);
  context.subscriptions.push(disposableService);
}

function pascalCase(str: string) {
  return startCase(camelCase(str)).replace(/ /g, '');
}

const grpcTypesMap = {
  double: 'number',
  float: 'number',
  int32: 'number',
  int64: 'number',
  uint32: 'number',
  uint64: 'number',
  sint32: 'number',
  sint64: 'number',
  fixed32: 'number',
  fixed64: 'number',
  sfixed32: 'number',
  sfixed64: 'number',
  bool: 'boolean',
  string: 'string',
  bytes: 'string',
};

function createModel(textProperties: string) {
  let rows = textProperties
    .split('\n')
    .map((x) =>
      x
        .replace(/ \=.*$/, '')
        .replace(/[{}]/, '')
        .trim(),
    )
    .filter((x) => {
      const length = x.split(' ').length;
      return !(length < 2 || length > 4);
    })
    .filter((x) => x);
  const sortedRows = rows.sort((a, b) =>
    a.split(' ').reverse()[0] < b.split(' ').reverse()[0] ? -1 : 1,
  );
  // let properties: Array<string> = [];
  let properties = '';
  let className = '';
  let camelClassName = '';
  let interfaces = '';
  let constructors = '';
  let getters = '';
  let tests = '';

  sortedRows.forEach((r) => {
    const row = r.split(' ').reverse();
    const [property, type, ...rules] = row;

    if (type === 'message') {
      className = pascalCase(property);
      camelClassName = camelCase(property);
    } else {
      let t = Object.keys(grpcTypesMap).includes(type)
        ? grpcTypesMap[type as keyof typeof grpcTypesMap]
        : type.split('.').pop();
      const repeated = rules.includes('repeated');
      if (repeated) {
        t += '[]';
      }
      const optional = rules.includes('optional') ? '?' : '';
      const optionalReturnType = rules.includes('optional')
        ? ' | undefined'
        : '';

      const prop = camelCase(property);
      interfaces += `  ${prop}${optional}: ${t};\r\n`;
      properties += `  private ${prop}${optional}: ${t};\r\n`;
      constructors += `    this.${prop} = ${camelClassName}.${prop};\r\n`;
      getters += `  public get${pascalCase(
        prop,
      )}(): ${t}${optionalReturnType} {\r\n`;
      getters += `    return this.${prop};\r\n`;
      getters += `  }\r\n\r\n`;

      tests += `  it('New Set/Get ${prop}', async () => {\r\n`;
      tests += `    const ${camelClassName}Props: ${className}Props = {\r\n`;
      tests += `      ${prop}: ,\r\n`;
      tests += `    };\r\n\r\n`;
      tests += `    const ${camelClassName} = new ${className}(${camelClassName}Props);\r\n`;
      tests += `    await expect(${camelClassName}.get${pascalCase(
        prop,
      )}()).toEqual(${camelClassName}Props.${prop});\r\n`;
      tests += `  });\r\n\r\n`;
    }
  });

  const model = `
export interface ${className}Props {
${interfaces}}

export class ${className} {
${properties}

  constructor(${camelClassName}: ${className}Props) {
${constructors}  }

${getters}}
`;

  const test = `
import { ${className}, ${className}Props } from './${className}';
describe('${className} Model', () => {
${tests}
})
`;

  const generatedCode = `${model} \r\n ${test}`;

  return generatedCode;
}

function createService(textProperties: string) {
  let rows = textProperties
    .split('\n')
    .map((x) => x.replace(/[{};]/, '').trim())
    .filter((x) => x);

  const interfaceRow = rows.shift();
  const interfaceMatch = interfaceRow?.match(/interface (\w+)(<(.*)>)?/);
  const [, interfaceName, interfaceType] = interfaceMatch ?? [];

  const functions = rows
    .map((r) => `  async ${r} {\r\n\r\n  }\r\n\r\n`)
    .join('');

  const generatedCode = `
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ${interfaceName} implements ${interfaceName}${
    interfaceType ?? ''
  } {
${functions}}
`;

  return generatedCode;
}

// this method is called when your extension is deactivated
export function deactivate() {}
