import * as React from 'react'
import { Search, X, MapPin, Building2, Layers, ChevronRight, Loader2 } from 'lucide-react'
import { useGisSearch } from '@/hooks/use-gis'

interface GisSearchProps {
    onSelectFeature: (result: {
        id: string
        title: string
        type: 'parcel' | 'project' | 'district'
        coordinates: [number, number]
        properties: any
    }) => void
}

export function GisSearch({ onSelectFeature }: GisSearchProps) {
    const [query, setQuery] = React.useState('')
    const [isOpen, setIsOpen] = React.useState(false)
    const searchRef = React.useRef<HTMLDivElement>(null)

    const { data: results = [], isLoading } = useGisSearch(query)

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (res: (typeof results)[0]) => {
        onSelectFeature(res)
        setIsOpen(false)
        setQuery(res.title)
    }

    return (
        <div ref={searchRef} className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => {
                        if (query.trim().length >= 2) setIsOpen(true)
                    }}
                    placeholder="Search Survey No, Plot (pcl-101), Scheme, Village, District..."
                    className="h-9 w-full rounded-md border border-ink-200 bg-paper pl-9 pr-8 text-xs text-ink-900 placeholder:text-ink-400 shadow-xs focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('')
                            setIsOpen(false)
                        }}
                        className="absolute right-2.5 top-2.5 text-ink-400 hover:text-ink-700 cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && query.trim().length >= 2 && (
                <div className="absolute left-0 top-10.5 z-50 w-full rounded-xl border border-ink-200 bg-paper p-1.5 shadow-xl max-h-80 overflow-y-auto divide-y divide-ink-100 text-xs">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 p-4 text-ink-500">
                            <Loader2 className="h-4 w-4 animate-spin text-terracotta-600" />
                            <span>Locating spatial coordinates...</span>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-4 text-center text-ink-500 space-y-0.5">
                            <p className="font-semibold text-ink-800">No Spatial Features Found</p>
                            <p className="text-[11px] text-ink-400">Try searching by Survey Number (Sy. No. 42/1), Scheme code, or District.</p>
                        </div>
                    ) : (
                        results.map((res) => (
                            <button
                                key={`${res.type}-${res.id}`}
                                type="button"
                                onClick={() => handleSelect(res)}
                                className="w-full text-left flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-ink-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-start gap-2.5 min-w-0">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-ink-100 text-ink-700 group-hover:bg-terracotta-50 group-hover:text-terracotta-700 transition-colors mt-0.5">
                                        {res.type === 'project' ? (
                                            <Building2 className="h-3.5 w-3.5" />
                                        ) : res.type === 'parcel' ? (
                                            <Layers className="h-3.5 w-3.5" />
                                        ) : (
                                            <MapPin className="h-3.5 w-3.5" />
                                        )}
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-ink-900 group-hover:text-terracotta-700 transition-colors truncate">
                                                {res.title}
                                            </span>
                                            <span className="rounded bg-ink-100 px-1.5 py-0.2 text-[9px] font-mono font-semibold text-ink-600 uppercase">
                                                {res.type}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-ink-500 truncate">{res.subtitle}</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-ink-400 group-hover:text-ink-700 shrink-0" />
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
