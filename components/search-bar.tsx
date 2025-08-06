"use client"

import { Search } from 'lucide-react'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  placeholder: string
}

export default function SearchBar({ searchQuery, onSearchChange, placeholder }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md mx-auto mb-8 md:mb-12">
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-5 py-3 pr-12 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-base md:text-lg"
      />
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    </div>
  )
}
