import axios from 'axios';
import { NextRequest } from 'next/server';

const generateCoursePrompt = (subject: string) => `
Create a JSON course structure for "${subject}" with the following details:
{
  "title": "Course Title for ${subject}",
  "units": [
    { "title": "Unit 1 Title for ${subject}", "description": "Description for Unit 1" },
    { "title": "Unit 2 Title for ${subject}", "description": "Description for Unit 2" },
    { "title": "Unit 3 Title for ${subject}", "description": "Description for Unit 3" }
  ]
}
Criteria: Only valid JSON, content in SUBJECT'S LANGUAGE. Structural text (title, etc) in English. 3 units with descriptions. Ensure titles are specific to ${subject}.
`;

const generateUnitPrompt = (subject: string, unitTitle: string) => `
Create a JSON structure for the unit titled "${unitTitle}" with the following details:
{
  "title": "${unitTitle}",
  "description": "Description for ${unitTitle}",
  "lessons": [
    { "title": "Lesson 1 Title", "order": 1 },
    { "title": "Lesson 2 Title", "order": 2 },
    { "title": "Lesson 3 Title", "order": 3 },
    { "title": "Lesson 4 Title", "order": 4 },
    { "title": "Lesson 5 Title", "order": 5 }
  ]
}
Criteria: Only valid JSON, content in SUBJECT'S LANGUAGE. Structural text (title, etc) in English. 5 lessons. Ensure lesson titles are specific to ${unitTitle}.
`;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const cleanAndParseJSON = (content: string): unknown => {
  try {
    const cleaned = content.replace(/[^\x20-\x7E]/g, '');
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      console.warn('No valid JSON object found in the content');
      return null;
    }
    
    const jsonContent = cleaned.substring(startIndex, endIndex + 1);
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('JSON parsing error:', error);
    return null;
  }
};

const makeRateLimitedRequest = async (prompt: string, apiKey: string, maxRetries = 3, baseDelay = 1000): Promise<unknown> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`API Request Attempt ${attempt + 1}/${maxRetries} for prompt:`, prompt);
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      interface GeminiResponse {
        candidates?: Array<{
          content?: {
            parts?: Array<{
              text?: string;
            }>;
          };
        }>;
      }
      const geminiResponse = response.data as GeminiResponse;
      const content = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content || typeof content !== 'string') {
        throw new Error('No valid response content from Gemini');
      }
      
      console.log('API Response:', content);

      const parsedContent = cleanAndParseJSON(content);
      if (parsedContent) {
        return parsedContent;
      } else {
        throw new Error('Failed to parse JSON content');
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 503) {
          console.warn('Service unavailable, retrying...');
        } else {
          console.error(`Received error ${error.response.status}: ${error.response.data}`);
        }
      }

      if (attempt < maxRetries - 1) {
        const delayTime = baseDelay * Math.pow(2, attempt);
        console.log(`Retrying in ${delayTime}ms...`);
        await delay(delayTime);
      }
    }
  }

  throw new Error(`Max retries reached. Last error: ${lastError?.message}`);
};

interface GeneratedLesson {
  title: string;
  order: number;
}

interface GeneratedUnit {
  title: string;
  description: string;
  lessons: GeneratedLesson[];
  order?: number;
}

interface GeneratedCourse {
  title: string;
  units: GeneratedUnit[];
}

async function generateOutline(subject: string, onProgress: (progress: number) => void): Promise<GeneratedCourse> {
  try {
    console.log('[generateOutline] Starting generation for subject:', subject);
    const courseJSON = await makeRateLimitedRequest(generateCoursePrompt(subject), process.env.GEMINI_API_KEY as string) as GeneratedCourse;
    console.log('[generateOutline] Initial course structure:', JSON.stringify(courseJSON, null, 2));
    onProgress(33); // Initial progress update

    if (courseJSON?.units) {
      // Add order to units
      for (let i = 0; i < courseJSON.units.length; i++) {
        const unit = courseJSON.units[i];
        console.log(`[generateOutline] Generating unit ${i + 1}/${courseJSON.units.length}:`, unit.title);
        
        const unitJSON = await makeRateLimitedRequest(
          generateUnitPrompt(subject, unit.title),
          process.env.GEMINI_API_KEY as string
        ) as GeneratedUnit;

        if (unitJSON) {
          // Ensure lessons array is properly structured
          const lessons = unitJSON.lessons?.map((lesson, index) => ({
            title: lesson.title,
            order: lesson.order || index + 1
          })) || [];

          // Merge the generated unit data while preserving the order
          courseJSON.units[i] = {
            title: unit.title,
            description: unitJSON.description || unit.description,
            lessons: lessons,
            order: i + 1,
          };
          console.log(`[generateOutline] Updated unit ${i + 1}:`, JSON.stringify(courseJSON.units[i], null, 2));
        }
        
        // Update progress after each unit generation
        onProgress(33 + ((i + 1) / courseJSON.units.length) * 67);
      }
    }

    console.log('[generateOutline] Final course structure:', JSON.stringify(courseJSON, null, 2));
    return courseJSON;
  } catch (error) {
    console.error('[generateOutline] Error:', error);
    throw error;
  }
}


export function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  try {
    const subject = request.nextUrl.searchParams.get('subject');
    
    if (!subject) {
      return new Response(JSON.stringify({ success: false, error: 'Missing subject parameter' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    void (async () => {
      try {
        const outline = await generateOutline(subject, (progress) => {
          void writer.write(encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`));
        });

        await writer.write(encoder.encode(`data: ${JSON.stringify({ 
          success: true,
          outline,
          headers: {
            'Cache-Control': 's-maxage=1, stale-while-revalidate'
          }
        })}\n\n`));
      } catch (error) {
        console.error('[GET] Error during generation:', error);
        if (error instanceof Error) {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ success: false, error: error.message })}\n\n`));
        } else {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ success: false, error: 'An unknown error occurred' })}\n\n`));
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json() as { prompt: string };
    
    if (!body.prompt?.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'Missing prompt field' }), { status: 400 });
    }

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Send initial progress
    await writer.write(encoder.encode(`data: ${JSON.stringify({ progress: 0 })}\n\n`));

    void (async () => {
      try {
        const outline = await generateOutline(body.prompt.trim(), (progress) => {
          void writer.write(encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`));
        });
        await writer.write(encoder.encode(`data: ${JSON.stringify({ success: true, outline })}\n\n`));
      } catch (error) {
        console.error('Error in POST /api/generate-outline:', error);
        if (error instanceof Error) {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ success: false, error: error.message })}\n\n`));
        } else {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ success: false, error: 'An unknown error occurred' })}\n\n`));
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in POST /api/generate-outline:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), { status: 500 });
  }
}