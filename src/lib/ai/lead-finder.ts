/**
 * AI-Driven Lead Finder using Perplexity
 * Automatically finds and qualifies leads based on target market criteria
 */

interface LeadFinderParams {
  companyName: string;
  industry: string;
  targetMarket: string;
  description: string;
  count?: number; // How many leads to find
}

interface FoundLead {
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  phone: string;
  email?: string;
  source: string;
}

export async function findLeadsWithAI(params: LeadFinderParams): Promise<FoundLead[]> {
  const { companyName, industry, targetMarket, description, count = 10 } = params;

  try {
    // Call Blackbox API with Perplexity model for deep research
    const response = await fetch('https://api.blackbox.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BLACKBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'blackboxai/perplexity/sonar-reasoning-pro', // Advanced reasoning model for better lead research
        messages: [
          {
            role: 'system',
            content: `You are a B2B lead research specialist. Your job is to find real, qualified leads based on the target criteria provided. 

IMPORTANT: 
- Find REAL companies and contacts, not fictional ones
- Include actual phone numbers in international format (e.g., +33123456789)
- Verify the contacts match the target criteria
- Prioritize decision makers (CEOs, CTOs, VPs)
- Return data in valid JSON format only`
          },
          {
            role: 'user',
            content: `Find ${count} qualified leads for this company:

Company: ${companyName}
Industry: ${industry}
Product/Service: ${description}
Target Market: ${targetMarket}

Search for companies and decision makers that match this target profile. For each lead, find:
- First name and last name of decision maker
- Their company name
- Their title/role
- Phone number (international format)
- Email (if available)
- Source URL where you found them

Return ONLY a JSON array with this exact structure:
[
  {
    "firstName": "John",
    "lastName": "Doe",
    "company": "Acme Corp",
    "title": "CEO",
    "phone": "+33123456789",
    "email": "john@acme.com",
    "source": "https://acme.com/about"
  }
]

Search the web for real companies matching the criteria. Be thorough and accurate.`
          }
        ],
        temperature: 0.3, // Lower temperature for more factual results
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';

    // Extract JSON from response (handle markdown code blocks)
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }

    // Parse the leads
    const leads: FoundLead[] = JSON.parse(jsonContent);

    // Validate and clean the data
    const validLeads = leads.filter(lead => 
      lead.firstName && 
      lead.lastName && 
      lead.company && 
      lead.phone &&
      lead.phone.match(/^\+\d{10,15}$/) // Valid international phone format
    );

    console.log(`Found ${validLeads.length} valid leads out of ${leads.length} total`);

    return validLeads;

  } catch (error) {
    console.error('Error finding leads with AI:', error);
    
    // Fallback: Return demo leads for testing
    return generateDemoLeads(params);
  }
}

/**
 * Fallback: Generate demo leads if Perplexity fails
 * Uses the test number provided by user
 */
function generateDemoLeads(params: LeadFinderParams): FoundLead[] {
  // For demo purposes, create a lead with the user's test number
  return [
    {
      firstName: 'Guillaume',
      lastName: 'Deramchi',
      company: 'Test Company',
      title: 'CEO',
      phone: '+33766830375',
      email: 'guillaume@test.com',
      source: 'Demo lead for testing',
    },
  ];
}

/**
 * Alternative: Use Perplexity for targeted company research
 */
export async function researchCompany(companyName: string): Promise<{
  description: string;
  keyPeople: Array<{ name: string; title: string; phone?: string }>;
  industry: string;
  size: string;
}> {
  try {
    const response = await fetch('https://api.blackbox.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BLACKBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'blackboxai/perplexity/sonar-reasoning-pro', // Advanced reasoning model for better company research
        messages: [
          {
            role: 'user',
            content: `Research the company "${companyName}" and provide:
1. Brief description
2. Key decision makers (names, titles, contact info if available)
3. Industry
4. Company size

Return as JSON:
{
  "description": "...",
  "keyPeople": [{"name": "...", "title": "...", "phone": "..."}],
  "industry": "...",
  "size": "..."
}`
          }
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    }

    return JSON.parse(jsonContent);

  } catch (error) {
    console.error('Error researching company:', error);
    throw error;
  }
}
