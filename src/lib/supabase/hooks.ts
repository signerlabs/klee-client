import { useSupabaseSession } from '@/pages/SupabaseProvider'
import { useQuery } from '@tanstack/react-query'
import supabase from '.'
import { getFreeChatCount } from '@/services'

export function useUser() {
  const [session] = useSupabaseSession()
  const { data: user } = useQuery({
    queryKey: ['user', session?.user?.id],
    queryFn: async () => {
      if (!supabase) return null
      return (await supabase.auth.getUser()).data.user
    },
  })

  if (!session?.user.id) return null
  return user
}

export function useFreeChatCount() {
  return useQuery({
    queryKey: ['freeChatCount'],
    queryFn: () => getFreeChatCount(),
  })
}
