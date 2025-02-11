const axios = require('axios');
import * as path from 'path';
import * as dotenv from 'dotenv';

// Adjust the path as necessary so that it correctly locates your .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const jiraDomain = process.env.JIRA_DOMAIN;
const projectKey = 'INTERNS';
const email = process.env.JIRA_EMAIL;
const apiToken = process.env.JIRA_API_TOKEN;
const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

if (!jiraDomain || !email || !apiToken) {
  throw new Error('Missing Jira configuration in your .env file.');
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
        
        const activeProjects = response.data.values.filter((project) => {
            return project.projectCategory && project.projectCategory.id === '10101';
        })

        const projectKeys = activeProjects.map((project) => {
            return {
                label: project.key,
                description: project.name
            };
        })
        return projectKeys;
    } catch (error) {
        console.error('Error fetching projects:', error.response ? error.response.data : error.message);
    }
}

export const createIssue = async (title, description, filePathName, selectedProject, selectedText, lineSpan) => {    
    const url = `${jiraDomain}/rest/api/3/issue`;

    const formattedDescription = {
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
            },
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
              },
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
    
  const issueData = {
    fields: {
      project: {
        key: selectedProject.label
      },
      fixVersions: [
        {"name":"via_cherrybomb"}
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
  } catch (error) {
    console.error('Error creating issue:', error.response ? error.response.data : error.message);
  }
}