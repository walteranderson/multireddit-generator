export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api')) {
      return new Response(null, { status: 404 });
    }

    const prompt = url.searchParams.get('prompt');
    if (!prompt) {
      return Response.json({ message: 'Missing prompt' }, { status: 400 })
    }

    const [res, err] = await promptAI(env, prompt);
    if (err) {
      console.error('error prompting ai', err);
      return Response.json(null, { status: 500 })
    }
    return Response.json(res)
  },
} satisfies ExportedHandler<Env>;

type PromptAIResponse =
  [string[], null]
  | [null, Error]
async function promptAI(env: Env, prompt: string): Promise<PromptAIResponse> {
  try {
    const res = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      response_format: {
        type: 'json_schema',
        json_schema: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      },
      messages: [
        {
          role: 'system',
          content: 'You are a JSON REST API. The task is to generate a list of valid subreddits on the website Reddit  that matches the given prompt.',
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    if (res instanceof ReadableStream) {
      console.error('Why did I get a ReadableStream?', res);
      return [null, new Error('unexpected readable stream')];
    }

    if (!res.response) {
      return [null, new Error('no response')];
    }

    const items = (res.response as unknown as { items: string[] }).items;
    return [items, null];
  } catch (err) {
    return [null, err as Error];
  }
}
