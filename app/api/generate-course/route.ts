import axios from 'axios';
import { NextRequest } from 'next/server';

import { createCourseFromJSON } from '@/db/queries';

interface CourseOutline {
  title: string;
  units: {
    title: string;
    lessons: {
      title: string;
      challenges?: Array<{
        type: "SELECT" | "ASSIST";
        question: string;
        options: Array<{
          text: string;
          correct: boolean;
        }>;
      }>;
    }[];
  }[];
}

interface CourseJSON {
  title: string;
  imageSrc: string;
  units: Array<{
    title: string;
    description: string;
    lessons: Array<{
      title: string;
      challenges: Array<{
        type: "SELECT" | "ASSIST";
        question: string;
        options: Array<{
          text: string;
          correct: boolean;
        }>;
      }>;
    }>;
  }>;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const cleanAndParseJSON = (content: string): unknown => {
  try {
    // Remove any potential Unicode control characters
    // eslint-disable-next-line no-control-regex
    const cleaned = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    // Find the first '{' and last '}'
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      console.warn('No valid JSON object found in the content');
      return null;
    }
    
    // Extract the JSON content
    const jsonContent = cleaned.substring(startIndex, endIndex + 1);
    
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('JSON parsing error:', error);
    return null;
  }
};

const generateImage = async (prompt: string, style?: string): Promise<string> => {
  const baseUrl = 'https://pollinations.ai/p/';
  const defaultStyle = 'conceptual_isometric_world_of_pollinations_ai_surreal_hyperrealistic_digital_garden';
  
  const imageStyle = style || defaultStyle;
  const encodedPrompt = encodeURIComponent(prompt);
  
  const imageUrl = `${baseUrl}${imageStyle}/${encodedPrompt}`;
  
  // Wait for image to be created
  await fetch(imageUrl);
  
  return imageUrl;
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
      
      if (attempt < maxRetries - 1) {
        const delayTime = baseDelay * Math.pow(2, attempt);
        console.log(`Retrying in ${delayTime}ms...`);
        await delay(delayTime);
      }
    }
  }

  throw new Error(`Max retries reached. Last error: ${lastError?.message}`);
};

const generateLessonChallengesPrompt = (subject: string, unitTitle: string, lessonTitle: string) => `
Create a JSON structure for 10 challenges for the lesson "${lessonTitle}" in the unit "${unitTitle}" for the subject "${subject}".
Each challenge should have:
- A "type" field that is either "SELECT" or "ASSIST"
- A "question" field with the challenge question
- An "options" array with 3 options for SELECT type, or 1 correct answer for ASSIST type
- Each option should have "text" and "correct" (boolean) fields

Example format:
{
  "challenges": [
    {
      "type": "SELECT",
      "question": "What is...",
      "options": [
        { "text": "Option 1", "correct": true },
        { "text": "Option 2", "correct": false },
        { "text": "Option 3", "correct": false }
      ]
    },
    {
      "type": "ASSIST",
      "question": "Explain...",
      "options": [
        { "text": "Correct answer", "correct": true }
      ]
    }
  ]
}

Make the content specific to ${subject} and ${lessonTitle}.
`;

async function geminiApiCall(
  subject: string,
  imageSrc: string,
  teacherId: string,
  isPublic: boolean,
  price: number,
  outline: CourseOutline,
  onProgress: (progress: number) => void,
  aiStyle?: string
): Promise<string> {
  try {
    console.log('Using provided outline to generate course structure...');
    
    // Generate course image if using AI images
    const courseImageSrc = imageSrc || await generateImage(outline.title, aiStyle);
    
    const courseJSON: CourseJSON = {
      title: outline.title,
      imageSrc: courseImageSrc,
      units: outline.units.map(unit => ({
        ...unit,
        description: `Unit about ${unit.title}`,
        lessons: unit.lessons.map(lesson => ({
          ...lesson,
          challenges: []
        }))
      }))
    };
    onProgress(10);

    // Generate challenges for each lesson
    for (let i = 0; i < courseJSON.units.length; i++) {
      const unit = courseJSON.units[i];
      for (let j = 0; j < unit.lessons.length; j++) {
        const lesson = unit.lessons[j];
        console.log(`Generating challenges for lesson ${j + 1} in unit ${i + 1}: ${lesson.title}`);
        
        const challengesResponse = await makeRateLimitedRequest(
          generateLessonChallengesPrompt(subject, unit.title, lesson.title),
          process.env.GEMINI_API_KEY as string
        ) as { challenges: Array<{ type: "SELECT" | "ASSIST"; question: string; options: { text: string; correct: boolean; }[] }> };
        
        if (challengesResponse?.challenges) {
          courseJSON.units[i].lessons[j].challenges = challengesResponse.challenges;
        }

        // Calculate progress: 10% initial + 90% for lessons
        const totalLessons = courseJSON.units.reduce((sum, u) => sum + u.lessons.length, 0);
        const completedLessons = i * unit.lessons.length + j + 1;
        onProgress(10 + (completedLessons / totalLessons) * 90);

        await delay(1000); // Rate limiting
      }
    }

    // Create the course in the database
    console.log('Creating course in database...');
    const createdCourseId = await createCourseFromJSON(courseJSON, teacherId, isPublic, price);
    onProgress(100);

    return createdCourseId.toString();
  } catch (error) {
    console.error('Error in geminiApiCall:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json() as {
      subject: string;
      outline: CourseOutline;
      settings: {
        targetAudience: string;
        imageSource: string;
        aiStyle?: string;
        licenseType?: string;
      };
    };

    if (!body.subject || !body.outline) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    void (async () => {
      try {
        const courseId = await geminiApiCall(
          body.subject,
          body.settings.imageSource === 'ai' ? '' : 'default-image.jpg',
          'teacher_id', // TODO: Get from auth
          false,
          0,
          body.outline,
          (progress) => {
            void writer.write(encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`));
          },
          body.settings.aiStyle
        );
        void writer.write(encoder.encode(`data: ${JSON.stringify({ courseId })}\n\n`));
      } catch (error) {
        console.error('Error in POST /api/generate-course:', error);
        if (error instanceof Error) {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
        } else {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'An unknown error occurred' })}\n\n`));
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
    console.error('Error in POST /api/generate-course:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
