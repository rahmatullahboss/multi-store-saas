import { ActionFunctionArgs, json } from '@remix-run/cloudflare';
import { handleAgentChatAction } from '~/services/agent-chat.server';

export async function action(args: ActionFunctionArgs) {
  if (args.request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  return handleAgentChatAction(args);
}


export default function() {}
