// Reference: https://github.com/Azure/fetch-event-source/blob/main/src/fetch.ts
import { localRequest } from '@/lib/request'
import { IConversation, IFetchEventSourceInit, IFetchFreeMessageCountResponse } from '@/types'
import { getBytes, getLines, getMessages } from '@/lib/parse'
import { KyHeadersInit } from 'ky/distribution/types/options'
import supabase from '@/lib/supabase'

const LastEventId = 'last-event-id'

export async function chatStream(
  data: { question: string; conversation_id: IConversation['id'] },
  { onmessage, onerror }: IFetchEventSourceInit = {},
) {
  const headers: KyHeadersInit = {
    accept: 'text/event-stream',
  }

  try {
    const response = await localRequest.post('chat/rot/chat', {
      json: data,
      headers,
    })
    if (!response.body) {
      throw new Error('no response.')
    }

    await getBytes(
      response.body,
      getLines(
        getMessages(
          (id) => {
            if (id) {
              // store the id and send it back on the next retry:
              headers[LastEventId] = id
            } else {
              // don't send the last-event-id header anymore:
              delete headers[LastEventId]
            }
          },
          () => {},
          onmessage,
        ),
      ),
    )
  } catch (error) {
    onerror?.(error as Error)
  }
}

// get free chat count
export async function getFreeChatCount(): Promise<number> {
  try {
    if (!supabase) return 0
    const { data, error } = await supabase.functions.invoke<IFetchFreeMessageCountResponse>(
      'userService-fetchFreeMessageCount',
    )
    if (error) {
      throw error
    }
    if (!data) {
      throw new Error('get free chat count failed.')
    }
    return data.count
  } catch (error) {
    console.error(error)
    return 0
  }
}
