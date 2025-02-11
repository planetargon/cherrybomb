# `cherrybomb`
`cherrybomb` is a Visual Studio Code extension designed to help you quickly tag sections of code as technical debt and automatically create Jira issues in corresponding Jira projects. It streamlines the process of capturing technical debt by integrating seamlessly into your development workflow, reducing context switching and ensuring that important code quality issues are tracked directly in Jira.

## Features
* ### Quick Tagging:

    Highlight code in the editor and click the status bar icon to mark it as technical debt.

* ### Jira Integration:
    
    Automatically create a Jira issue with details such as the highlighted code, file path, and line numbers.

* ### Interactive Webview Form:

    Upon activation, a webview form is presented that allows you to select a Jira project, enter an issue title and description, and review contextual information (e.g., file name and line span).

* ### Private Distribution:

    Designed for internal use, `cherrybomb` can be shared privately within your organization without publishing it to the public VS Code Marketplace.

## When and Why to Use `cherrybomb`
* ### Technical Debt Management:

    Use `cherrybomb` to capture and track technical debt directly from your code editor. This makes it easier for teams to prioritize refactoring and maintain code quality.

* ### Seamless Workflow:

    Instead of manually switching to Jira and copy‑pasting code snippets and context, `cherrybomb` allows you to create issues with a few clicks, ensuring all relevant context is attached automatically.

* ### Internal Process Standardization:

    If your organization has a defined process for managing technical debt, `cherrybomb` provides a consistent and efficient way to integrate that process directly into developers’ daily workflow.

## Setup Instructions
### Prerequisites
* Visual Studio Code (version 1.70.0 or higher recommended)
* Node.js and npm installed
* A Jira account with API access (Jira Cloud is recommended)

### Installation

1. Clone the Repository:

    ```
    git clone https://your-internal-repository/cherrybomb.git
    cd cherrybomb
    ```

2. Install Dependencies:
    ```
    npm install
    ```

3. Configure Environment Variables:

    Create a .env file in the root of the extension with the following content:
    ```
    JIRA_DOMAIN=https://your-jira-instance.atlassian.net
    JIRA_EMAIL=your-email@example.com
    JIRA_API_TOKEN=your-jira-api-token
    ```

4. Compile the Extension (if using TypeScript):
    ```
    npm run compile
    ```
5. Package the Extension:

    If you have installed the VSCE tool globally:
    ```
    vsce package
    ```
    Or using npx (if you haven’t installed it globally):
    ```
    npx vsce package
    ```
    This creates a .vsix file (e.g., `cherrybomb`-0.0.1.vsix).

6. Install the VSIX File in VS Code:

* Open VS Code.
* Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS) and select **Extensions: Install from VSIX…**.
* Browse to and select the generated .vsix file.

    Alternatively, you can drag and drop the .vsix file onto the VS Code window.

## How to Use `cherrybomb`
1. Open VS Code:
    
    Once installed, `cherrybomb` automatically activates on startup. A status bar item with a smiley icon and the label "Tag Tech Debt" will appear on the left side of the status bar.

2. Select Code:

    In any open file, highlight the code you want to tag as technical debt.

3. Trigger the Extension:

    Click the "Tag Tech Debt" status bar item. This launches the `cherrybomb` command, which gathers context (such as the selected text, file name, and line numbers) and opens an interactive webview form.

4. Fill Out the Webview Form:

    * Project Selection: Choose a Jira project from the dropdown list (populated with available active projects from Jira).
    * Issue Title & Description: Enter the title and description for the Jira issue.
    * Contextual Information: The form displays read-only data (file name and line span) to help you verify the context.
5. Submit:
    Click the Submit button in the webview form. `cherrybomb` then calls the Jira API to create an issue in the selected Jira project using the collected information. You will receive a confirmation message upon successful creation.

## When/Why to Use `cherrybomb`
### When:

* You’re working on a codebase and identify sections of code that need refactoring or further review.
* You want to seamlessly track technical debt without leaving your editor.

### Why:

* It reduces manual steps, minimizes context switching, and ensures consistent tracking of technical debt issues.
* It helps maintain code quality by integrating directly with your project’s issue tracking system (Jira).
* It standardizes the process of capturing technical debt across your engineering team.

## Troubleshooting
### Environment Variables:
* If the extension fails to load Jira configuration, verify that your .env file is in the extension’s root and correctly formatted.

### Jira API Errors:
* If issues occur during Jira issue creation, check your Jira credentials, API token, and ensure that the issue type and project settings in your Jira instance are valid.

### Webview Issues:
* If the webview form isn’t displaying correctly or the dropdown isn’t responsive, open the Developer Tools (via **Developer: Toggle Developer Tools** in VS Code) to inspect console logs and verify that the DOM is fully loaded.

## Contributing
If you would like to contribute to `cherrybomb`, please fork the repository and submit a pull request. For any issues or feature requests, please contact the maintainers at [your support channel/email].

## License
This extension is licensed under the MIT License.

> cherrybomb` was created by [Ben Parisot](https://github.com/BenParisot).