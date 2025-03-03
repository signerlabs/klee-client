import { createKnowledgeItem, deleteKnowledgeItem, getKnowledgeItems } from '@/services'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSortConfig, useSearchConfig } from './use-config'
import { sortKnowledgeItems } from '@/services/helper'

export function useKnowledgeItems() {
  const [sortConfig] = useSortConfig()
  const [searchConfig] = useSearchConfig()
  const sortBy = sortConfig.sortByField.knowledge
  const sortOrder = sortConfig.sortOrderField.knowledge
  const keyword = searchConfig.searchByField.knowledge
  return useQuery({
    queryKey: ['knowledgeItems', sortBy, sortOrder, keyword],
    queryFn: () => getKnowledgeItems({ keyword }).then((knowledge) => sortKnowledgeItems(knowledge, sortBy, sortOrder)),
  })
}

export function useCreateKnowledgeItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createKnowledgeItem,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeItems'] })
    },
  })
}

export function useDeleteKnowledgeItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteKnowledgeItem,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeItems'] })
    },
  })
}
