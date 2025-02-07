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
        return activeProjects;
    } catch (error) {
        console.error('Error fetching projects:', error.response ? error.response.data : error.message);
    }
}

export const createIssue = async (description, jiraDomain, email, apiToken) => {    
    const url = `${jiraDomain}/rest/api/3/issue`;
    console.log('url', url);
    
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
  const issueData = {
    fields: {
      project: {
        key: projectKey
      },
      summary: description,
      description: {
        type: "doc", 
        version: 1,  
        "content": [
          {
            "content": [
              {
                "text": description,
                "type": "text"
              }
            ],
            "type": "paragraph"
          }
        ],
      },
      issuetype: {
        id: '11236' 
      },
      labels: [
        'tech_debt',
        'bug',
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