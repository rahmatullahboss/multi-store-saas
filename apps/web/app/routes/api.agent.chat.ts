import { ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { handleAgentChatAction } from '~/services/agent-chat.server';

export async function action(args: ActionFunctionArgs) {
  if (args.request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  return handleAgentChatAction(args);
}


export default function() {}
