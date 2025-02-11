import { createIssue, getJiraProjects } from './jiraService';
import * as vscode from 'vscode';
import * as path from 'path';

function getWebviewContent(data: {
	selectedText: string;
	filePathName: string;
	lineSpan: string;
	jiraProjectKeys: Array<{ label: string; description: string }>;
  }): string {
	// Serialize the initial data so it can be used inside the webview.
	const initialData = JSON.stringify(data);
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tag Technical Debt</title>
  <style>
    body { width: 60%; font-family: sans-serif; padding: 20px 60px; }
    input, select, textarea { margin: 8px 0; padding: 12px; border: 1px solid #ccc; }
    button { padding: 15px 20px; margin-top: 12px; text-transform: uppercase; font-weight: bold; color: #f6f7f8; background-color: #FF6B6B; border: none; cursor: pointer; }
    label { font-weight: bold; }
	button:hover { background-color: #1b5b76; }
	#issueForm { display: flex; flex-direction: column; }
  </style>
</head>
<body>
  <h1>Tag Technical Debt</h1>
  <form id="issueForm">
    <label for="project">Select Jira Project:</label>
    <select id="project" name="project"></select>
    
    <label for="title">Issue Title:</label>
    <input type="text" id="title" name="title" placeholder="Enter issue title" required>
    
    <label for="description">Issue Description:</label>
    <textarea id="description" name="description" placeholder="Enter issue description" rows="4" required></textarea>
    
    <button type="submit">Submit</button>
  </form>
  <script>
    window.addEventListener('DOMContentLoaded', function() {
      const vscode = acquireVsCodeApi();
      const initialData = ${initialData};

      const selectedProject = document.getElementById('project');
      if (!selectedProject) {
        console.error('The <select> element with id "project" was not found.');
        return;
      }
      initialData.jiraProjectKeys.forEach(project => {
        const option = document.createElement('option');
        option.value = project.label;
        option.text = project.label + " - " + project.description;
        selectedProject.appendChild(option);
      });

      const form = document.getElementById('issueForm');
      form.addEventListener('submit', event => {
        event.preventDefault();
        const selectedProject = document.getElementById('project').value;
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        vscode.postMessage({
          command: 'submit',
          data: { selectedProject, title, description }
        });
      });
    });
  </script>
</body>
</html>`;
  };


export function activate(context: vscode.ExtensionContext) {
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarItem.text = '$(smiley) Tag Tech Debt';
	statusBarItem.tooltip = 'Highlight some code and click to create a tech-debt Jira issue.';
	statusBarItem.command = 'extension.tagTechDebt';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);
	  
	  const disposable = vscode.commands.registerCommand('extension.tagTechDebt', async () => {
		const jiraProjectKeys = await getJiraProjects();
		if (!jiraProjectKeys || jiraProjectKeys.length === 0) {
			vscode.window.showErrorMessage("No Jira projects found. Please contact your cherrybomb admin to ensure proper Jira API integration.");
			return;
		}

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
		const startLine = selection.start.line;
		const endLine = selection.end.line;
		const lineSpan = `This selection begins on line ${startLine} and ends on line ${endLine}`;

		const filePath = editor.document.fileName;
		const folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
		if (!folder) {
			vscode.window.showErrorMessage("File is not in a workspace.");
			return filePath; 
		  }
		const folderPath = folder.uri.fsPath;
		const relativePath = path.relative(folderPath, filePath);
		const filePathName = path.join(path.basename(folderPath), relativePath);

		const panel = vscode.window.createWebviewPanel(
			'tagTechDebtForm', // Unique identifier for this webview type.
			'Tag Technical Debt', // Title displayed on the panel tab.
			vscode.ViewColumn.One,
			{
			  enableScripts: true,
			  retainContextWhenHidden: false
			}
		  );

		const initialData = {
			selectedText,
			filePathName,
			lineSpan,
			jiraProjectKeys // Expecting an array of objects with properties like 'label' and 'description'
		  };

		panel.webview.html = getWebviewContent(initialData);

		panel.webview.onDidReceiveMessage(
			async message => {
			  switch (message.command) {
				case 'submit':
				  // The webview sends back the selected project, title, and description.
				  const { selectedProject, title, description } = message.data;
				  // Trigger your issue creation function with the collected data.
				  try {
					await createIssue(title, description, filePathName, selectedProject, selectedText, lineSpan);
					vscode.window.showInformationMessage('Issue created successfully!');
				  } catch (error) {
					vscode.window.showErrorMessage('Error creating issue. See console for details.');
					console.error(error);
				  }
				  // Close the webview.
				  panel.dispose();
				  break;
			  }
			},
			undefined,
			context.subscriptions
		  );
		});
		context.subscriptions.push(disposable);
}

export function deactivate() {}
