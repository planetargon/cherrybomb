import { createIssue, getJiraProjects } from './jiraService';
import * as vscode from 'vscode';
import * as path from 'path';
import * as dotenv from 'dotenv';

export function activate(context: vscode.ExtensionContext) {
	// on activation, gets all jira projects and makes them available to tagTechDebt extension using getJiraProjects

	const envPath = path.join(context.extensionPath, '.env');
	const result = dotenv.config({ path: envPath });
	if (result.error) {
		console.error('Error loading .env file:', result.error);
	  } else {
		console.log('Environment variables loaded:', result.parsed.JIRA_DOMAIN);
	  }

	  const jiraDomain = process.env.JIRA_DOMAIN;
	  const email = process.env.JIRA_EMAIL;
	  const apiToken = process.env.JIRA_API_TOKEN;
	
	const disposable = vscode.commands.registerCommand('extension.tagTechDebt', async () => {

		// project selection 
		// // user selects jira project from selection dropdown provided by getJiraProjects function

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage("No active editor found. Please open a file.");
			return;
		}

		const selection = editor.selection;
		if (selection.isEmpty) {
			vscode.window.showErrorMessage("Please select some code to tag as technical debt");
			return;
		};

		const selectedText = editor.document.getText(selection);

		const issueSummary = await vscode.window.showInputBox({
			prompt: "Enter a description for this Jira issue",
			placeHolder: "Technical debt tag"
		});

		if (!issueSummary) {
			vscode.window.showErrorMessage("You must enter a summary to create a Jira issue");
			return;
		};

		createIssue(issueSummary, jiraDomain, email, apiToken);

		//
		vscode.window.showInformationMessage('Selected text:', selectedText);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
