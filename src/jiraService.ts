const axios = require('axios');
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

const jiraDomain = process.env.JIRA_DOMAIN;
const projectKey = 'INTERNS';
const email = process.env.JIRA_EMAIL;
const apiToken = process.env.JIRA_API_TOKEN;
const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

if (!jiraDomain || !email || !apiToken) {
  throw new Error('Missing Jira configuration in your .env file.');
}

interface JiraProject {
  key: string;
  name: string;
  projectCategory?: {
    id: string;
  };
}

interface JiraResponse {
  data: {
    values: JiraProject[];
  };
}

interface IssueDescriptionContent {
  type: string;
  text?: string;
  marks?: { type: string }[];
  content?: IssueDescriptionContent[];
}

interface IssueDescription {
  type: string;
  version: number;
  content: IssueDescriptionContent[];
}

interface IssueData {
  fields: {
    project: {
      key: string;
    };
    fixVersions: { name: string }[];
    summary: string;
    description: IssueDescription;
    issuetype: {
      name: string;
    };
    labels: string[];
  };
}

export const getJiraProjects = async () => {
    const url = `${jiraDomain}/rest/api/3/project/search/`;
    
    try {
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            }
        });

        const activeProjects = (response as JiraResponse).data.values.filter((project: JiraProject) => {
          return project.projectCategory && project.projectCategory.id === '10101';
        });

        const projectKeys = activeProjects.map((project) => {
            return {
                label: project.key,
                description: project.name
            };
        })
        return projectKeys;
    } catch (error: any) {
        console.error('Error fetching projects:', error.response ? error.response.data : error.message);
    }
}

export const createIssue = async (
  title: string,
  description: string,
  filePathName: string,
  selectedProject: string,
  selectedText: string,
  lineSpan: string
): Promise<void> => {
  const url = `${jiraDomain}/rest/api/3/issue`;

  const formattedDescription: IssueDescription = {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Description: ",
            marks: [{ type: "strong" }]
          },
          {
            type: "text",
            text: description
          }
        ]
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "File Location: ",
            marks: [{ type: "strong" }]
          },
          {
            type: "text",
            text: `This tag is located in: ${filePathName}`
          }
        ]
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Linespan: ",
            marks: [{ type: "strong" }]
          },
          {
            type: "text",
            text: lineSpan
          }
        ]
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tagged Code: ",
            marks: [{ type: "strong" }]
          }
        ]
      },
      {
        type: "codeBlock",
        content: [
          {
            type: "text",
            text: selectedText
          }
        ]
      }
    ]
  };

  const issueData: IssueData = {
    fields: {
      project: {
        key: selectedProject
      },
      fixVersions: [
        { name: "via_cherrybomb" }
      ],
      summary: title,
      description: formattedDescription,
      issuetype: {
        name: 'Task'
      },
      labels: [
        'tech_debt',
        'via_cherrybomb'
      ]
    }
  };

  try {
    const response = await axios.post(url, issueData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    });
    console.log('Issue created successfully:', response.data);
  } catch (error: any) {
    console.error('Error creating issue:', error.response ? error.response.data : error.message);
  }
}