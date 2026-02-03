'use client'

import { Trash2, Eye, FileEdit } from 'lucide-react'

interface BulkActionsBarProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkDelete: () => void
  deleteLabel?: string
  isLoading?: boolean
  onBulkSetActive?: () => void
  onBulkSetDraft?: () => void
  bulkStatusLoading?: boolean
}

/**
 * Bar shown when one or more rows are selected. Shows count, bulk delete, and optional bulk status buttons.
 */
export default function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  deleteLabel = 'Խմբային ջնջում',
  isLoading = false,
  onBulkSetActive,
  onBulkSetDraft,
  bulkStatusLoading = false
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-amber-50 border-b border-amber-200">
      <span className="text-sm font-medium text-neutral-800">
        Ընտրված է <strong>{selectedCount}</strong>
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {onBulkSetActive && (
          <button
            type="button"
            onClick={onBulkSetActive}
            disabled={bulkStatusLoading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg disabled:opacity-50"
          >
            <Eye className="h-4 w-4" />
            Դնել ակտիվ
          </button>
        )}
        {onBulkSetDraft && (
          <button
            type="button"
            onClick={onBulkSetDraft}
            disabled={bulkStatusLoading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-700 bg-neutral-200 hover:bg-neutral-300 rounded-lg disabled:opacity-50"
          >
            <FileEdit className="h-4 w-4" />
            Դնել սևագիր
          </button>
        )}
        <button
          type="button"
          onClick={onClearSelection}
          className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
        >
          Չեղարկել ընտրությունը
        </button>
        <button
          type="button"
          onClick={onBulkDelete}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {deleteLabel}
        </button>
      </div>
    </div>
  )
}
