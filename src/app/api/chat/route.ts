import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { areas } from '@/lib/seed-data';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Build context about all areas
function buildAreaContext() {
  return areas.map(area => `
এলাকা: ${area.name_bn} (${area.name})
স্কোর: ${area.scores.overall_score}/100
নিরাপত্তা: ${area.scores.safety_score}/100
অবকাঠামো: ${area.scores.infrastructure_score}/100
বসবাসযোগ্যতা: ${area.scores.livability_score}/100
যোগাযোগ: ${area.scores.accessibility_score}/100
সারসংক্ষেপ: ${area.ai_summary || 'তথ্য নেই'}
ভালো দিক: ${area.good_things?.join(', ') || 'তথ্য নেই'}
সমস্যা: ${area.problems?.join(', ') || 'তথ্য নেই'}
সতর্কতা: ${area.alerts?.join(', ') || 'কোনো সতর্কতা নেই'}
যাদের জন্য উপযুক্ত: ${area.best_for?.join(', ') || 'সবার জন্য'}
যাদের জন্য উপযুক্ত নয়: ${area.not_ideal_for?.join(', ') || 'বিশেষ কেউ না'}
  `).join('\n---\n');
}

const SYSTEM_PROMPT = `আপনি "এলাকা AI" - চট্টগ্রাম শহরের এলাকা সম্পর্কে তথ্য দেওয়ার জন্য একটি বাংলা ভাষার সহায়ক।

আপনার কাছে চট্টগ্রামের বিভিন্ন এলাকার তথ্য আছে। ব্যবহারকারীর প্রশ্নের উত্তর দিন এবং উপযুক্ত এলাকা সুপারিশ করুন।

গুরুত্বপূর্ণ নির্দেশনা:
1. সবসময় বাংলায় উত্তর দিন (ব্যবহারকারী ইংরেজিতে জিজ্ঞাসা করলেও)
2. এলাকার নাম বাংলায় দিন, পাশে ইংরেজি নাম ব্র্যাকেটে
3. স্কোর এবং সংখ্যা উল্লেখ করুন
4. ভালো দিক এবং সমস্যা উভয়ই বলুন - সৎ থাকুন
5. পরিবার, ব্যাচেলর, বাজেট ইত্যাদির জন্য আলাদা সুপারিশ দিন
6. উত্তর সংক্ষিপ্ত এবং তথ্যবহুল রাখুন
7. যদি কোনো এলাকা সম্পর্কে তথ্য না থাকে, সরাসরি বলুন

এখানে চট্টগ্রামের এলাকাগুলোর তথ্য:

${buildAreaContext()}
`;

export async function POST(request: NextRequest) {
  try {
    const { message, language } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      // Fallback to simulated response if no API key
      return NextResponse.json({
        response: getFallbackResponse(message, language),
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || 'দুঃখিত, উত্তর দিতে সমস্যা হচ্ছে।';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    );
  }
}

// Fallback response when no API key
function getFallbackResponse(message: string, language: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('পরিবার') || lowerMessage.includes('family') || lowerMessage.includes('বাচ্চা')) {
    const familyAreas = areas
      .filter((a) => a.scores.safety_score >= 80)
      .sort((a, b) => b.scores.livability_score - a.scores.livability_score)
      .slice(0, 3);

    return `পরিবারের জন্য সেরা এলাকাগুলো হলো:

${familyAreas.map((a, i) => `${i + 1}. **${a.name_bn}** (স্কোর: ${a.scores.overall_score}/100)
   - ${a.ai_summary?.slice(0, 100)}...`).join('\n\n')}

এই এলাকাগুলো নিরাপদ, স্কুল কাছে এবং শান্ত পরিবেশ আছে।`;
  }

  if (lowerMessage.includes('নিরাপদ') || lowerMessage.includes('safe') || lowerMessage.includes('safety')) {
    const safeAreas = areas
      .sort((a, b) => b.scores.safety_score - a.scores.safety_score)
      .slice(0, 3);

    return `সবচেয়ে নিরাপদ এলাকাগুলো:

${safeAreas.map((a, i) => `${i + 1}. **${a.name_bn}** (নিরাপত্তা স্কোর: ${a.scores.safety_score}/100)
   - ${a.good_things?.slice(0, 2).join(', ')}`).join('\n\n')}`;
  }

  if (lowerMessage.includes('বাজেট') || lowerMessage.includes('budget') || lowerMessage.includes('সস্তা') || lowerMessage.includes('cheap')) {
    const budgetAreas = areas
      .filter((a) => a.best_for?.some((b) => b.includes('বাজেট') || b.includes('কম')))
      .slice(0, 3);

    if (budgetAreas.length > 0) {
      return `কম বাজেটে থাকার জন্য:

${budgetAreas.map((a, i) => `${i + 1}. **${a.name_bn}** (স্কোর: ${a.scores.overall_score}/100)
   - ${a.ai_summary?.slice(0, 80)}...`).join('\n\n')}`;
    }
  }

  return `আমি চট্টগ্রামের ${areas.length}টি এলাকা সম্পর্কে তথ্য দিতে পারি। আপনি জিজ্ঞাসা করতে পারেন:

- পরিবারের জন্য কোন এলাকা ভালো?
- সবচেয়ে নিরাপদ এলাকা কোনটি?
- কম বাজেটে কোথায় থাকা যায়?
- কোন এলাকায় জলাবদ্ধতা কম?

আপনার প্রশ্ন করুন!`;
}
