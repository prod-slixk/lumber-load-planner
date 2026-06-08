/**
 * Cloud project CRUD — used when a user is signed in.
 * All operations are scoped to the authenticated user via RLS.
 * Falls through to an error result rather than throwing — callers handle it.
 */

import { supabase } from './supabase'
import type { CalculationResult, SavedProject } from '../types'

// ─── Row → SavedProject ───────────────────────────────────────────────────────

function rowToSaved(row: {
  id: string
  name: string
  result: unknown
  purchased_items: string[]
  created_at: string
  updated_at: string
}): SavedProject {
  return {
    id: row.id,
    name: row.name,
    result: row.result as CalculationResult,
    purchasedItems: row.purchased_items,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ─── Operations ───────────────────────────────────────────────────────────────

export async function loadProjects(): Promise<SavedProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, result, purchased_items, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[LLP] loadProjects:', error.message)
    return []
  }
  return (data ?? []).map(rowToSaved)
}

export async function saveProject(
  name: string,
  result: CalculationResult,
  userId: string
): Promise<SavedProject | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ name, result: result as unknown as import('./database.types').Json, user_id: userId })
    .select('id, name, result, purchased_items, created_at, updated_at')
    .single()

  if (error || !data) {
    console.error('[LLP] saveProject:', error?.message)
    return null
  }
  return rowToSaved(data)
}

export async function updatePurchasedItems(
  projectId: string,
  purchasedItems: string[]
): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .update({ purchased_items: purchasedItems })
    .eq('id', projectId)

  if (error) console.error('[LLP] updatePurchasedItems:', error.message)
  return !error
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) console.error('[LLP] deleteProject:', error.message)
  return !error
}
