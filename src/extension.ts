// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Configuration } from './configuration';
import * as FuncAnalizer from './funcInfoAnalizer';
import * as fs from 'fs';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

		
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cppcomment" is now active!');
	console.log('Configuration.CompleteParamType = ' + Configuration.CompleteParamType);
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let c1 = vscode.commands.registerCommand('extension.GenerateCppComment', () => {

		// TSLint made me do this but I thought it's not necessary
		if (!vscode.window.activeTextEditor)
			return;
				
			//locale.json
		
		const config = vscode.workspace.getConfiguration();
		console.log(vscode.env.language);
		

		vscode.window.activeTextEditor.edit((editBuilder: vscode.TextEditorEdit) => {
			
			// Get active editor and ensure it exists
			var editor = vscode.window.activeTextEditor;
			if (!editor) return;

			// Check the current language. Must be Cpp
			var lang = editor.document.languageId;
			if (lang != 'cpp') {		
				vscode.window.showInformationMessage('Cpp Comment Generator only works in cpp files.');
				return;
			}

			// Prepare
			var selection = editor.selection;
			var selectedText = editor.document.getText(selection);
			var padLeftSpaceCnt = 0;
			
			if (selectedText == "") {
				var cursorPos = selection.active;
				selectedText = editor.document.lineAt(cursorPos.line).text;

				// Get how much space on the function's left
				for (var i = 0; i < selectedText.length; i++){
					if (selectedText[i] == " ") {
						padLeftSpaceCnt++;
					} else {
						break;
					}
				}
			} else {
				padLeftSpaceCnt += selection.start.character;
				// Get how much space on the function's left
				for (var i = 0; i < selectedText.length; i++){
					if (selectedText[i] == " ") {
						padLeftSpaceCnt++;
					} else {
						break;
					}
				}
			}



			
			var textToInsert = FuncAnalizer.GenerateFuncComment(selectedText,padLeftSpaceCnt);
			var startLine = selection.start.line - 1;
			
			// If the function locates on the 1st line, then add \n to the end of inserting text
			if (startLine < 0) {
				startLine = 0;
				textToInsert = textToInsert + "\n";
			}
			
			// Get the position of insertion
			var lastCharIndex = editor.document.lineAt(startLine).text.length;
			var pos:vscode.Position;
			if ((lastCharIndex > 0) && (startLine !=0)) {
				pos = new vscode.Position(startLine, lastCharIndex);
				textToInsert = '\n' + textToInsert; 	
			}
			else {
				pos = new vscode.Position(startLine, 0);
			}

			// Insert comment
			editBuilder.insert(pos, textToInsert);
		});
	});


	context.subscriptions.push(c1);
}

// this method is called when your extension is deactivated
export function deactivate() {}
