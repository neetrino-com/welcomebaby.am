'use client'

interface TabItem {
  value: string
  label: string
}

interface AdminTabsProps {
  tabs: TabItem[]
  activeValue: string
  onChange: (value: string) => void
  className?: string
}

/**
 * Tab navigation for admin sections. Preserve active in URL when used with searchParams.
 */
export default function AdminTabs({
  tabs,
  activeValue,
  onChange,
  className = ''
}: AdminTabsProps) {
  return (
    <div
      className={`flex gap-1 p-1 bg-neutral-100 rounded-xl border border-neutral-200 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={activeValue === tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeValue === tab.value
              ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
