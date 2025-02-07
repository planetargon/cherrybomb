const axios = require('axios');



const projectKey = 'INTERNS';


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

        //map to get just the project keys
        return activeProjects;
    } catch (error) {
        console.error('Error fetching projects:', error.response ? error.response.data : error.message);
    }
}

export const createIssue = async (title, description, filePathName, jiraDomain, email, apiToken) => {    
    const url = `${jiraDomain}/rest/api/3/issue`;
    console.log('url', url);
    
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
  const issueData = {
    fields: {
      project: {
        key: projectKey
      },
      summary: title,
      description: {
        type: "doc", 
        version: 1,  
        "content": [
          {
            "type": "paragraph",
            "content": [
                {
                    type: "text",
                    text: description
                },
                {
                    type: "text",
                    text: `This tag is located: ${filePathName}`
                }
            ]
          }
        ],
      },
      issuetype: {
        id: '11236' 
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