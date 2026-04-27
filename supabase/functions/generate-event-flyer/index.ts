// deno-lint-ignore-file no-explicit-any
declare const Deno: {
  env: { get: (key: string) => string | undefined };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

// @ts-ignore Deno runtime supports URL imports; workspace TS does not resolve them.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPPORTED_IMAGE_SIZES = new Set(['1024x1024', '1024x1536', '1536x1024', 'auto']);
const PRIMARY_IMAGE_MODEL = Deno.env.get('OPENAI_IMAGE_MODEL') || 'gpt-image-1.5';
const FALLBACK_IMAGE_MODEL = 'dall-e-3';

const buildPrompt = (content: Record<string, string>) => {
  const lines = [
    `Title: ${content.title || ''}`,
    `Subtitle: ${content.subtitle || ''}`,
    `Date: ${content.date || ''}`,
    `Time: ${content.time || ''}`,
    `Venue: ${content.venue || ''}`,
    `Organizer: ${content.organizer || ''}`,
    `Stalls: ${content.stalls || ''}`,
    `Sponsors: ${content.sponsors || ''}`,
    `CTA: ${content.cta || ''}`,
  ];

  return [
    'Create a high-quality colorful event flyer design for social media.',
    'Canvas: 1024x1024 square.',
    'Style: modern, vibrant gradients, bold typography, clear hierarchy, clean spacing.',
    'Must be fully readable and polished with balanced layout.',
    'Do not include watermarks, logos, brand names, or random extra text.',
    'Include these exact details in the design:',
    ...lines,
  ].join('\n');
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const openaiKey = Deno.env.get('OPENAI_API_KEY') || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase environment variables.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization') || '';
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as {
      size?: string;
      content?: Record<string, string>;
      meta?: Record<string, string>;
    };
    const content = body?.content || {};
    const requestedSize = body?.size || '1024x1024';
    const size = SUPPORTED_IMAGE_SIZES.has(requestedSize) ? requestedSize : '1024x1024';

    if (!content.title || !content.date || !content.venue) {
      return new Response(JSON.stringify({ error: 'Missing required flyer content fields.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildPrompt(content);

    const createImageWithModel = async (model: string) => {
      const quality = model === 'dall-e-3' ? 'hd' : 'high';
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model,
          prompt,
          size,
          quality,
        }),
      });
      const json = await response.json();
      return { response, json, model };
    };

    const attempts = [await createImageWithModel(PRIMARY_IMAGE_MODEL)];
    const noModelAccess = (result: { response: Response; json: any }) =>
      !result.response.ok && String(result.json?.error?.message || '').includes('does not have access to model');

    if (noModelAccess(attempts[0]) && PRIMARY_IMAGE_MODEL !== FALLBACK_IMAGE_MODEL) {
      attempts.push(await createImageWithModel(FALLBACK_IMAGE_MODEL));
    }

    const openaiResult = attempts[attempts.length - 1];
    if (!openaiResult.response.ok) {
      const allNoModelAccess = attempts.every(noModelAccess);
      const triedModels = attempts.map((a) => a.model);
      const actionableError = allNoModelAccess
        ? `No accessible image model for this OpenAI project. Tried models: ${triedModels.join(
            ', ',
          )}. Set OPENAI_IMAGE_MODEL to a model your project can access, or use an API key from a project with image model access.`
        : openaiResult.json?.error?.message || 'OpenAI generation failed.';
      return new Response(
        JSON.stringify({
          error: actionableError,
          provider: openaiResult.json,
          model: openaiResult.model,
          triedModels,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const first = openaiResult.json?.data?.[0];
    const imageBase64 = first?.b64_json || null;
    const imageUrl = first?.url || null;

    if (!imageBase64 && !imageUrl) {
      return new Response(JSON.stringify({ error: 'No image payload returned by provider.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        imageBase64,
        imageUrl,
        size,
        model: openaiResult.model,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error?.message || 'Unexpected flyer generation error.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

