"use client"

import { motion } from "framer-motion"
import { TypeIcon as type, type LucideIcon } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: LucideIcon
  gradient: string
  emoji: string
  playable: boolean
}

interface CategoryMenuProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (categoryId: string) => void
}

export default function CategoryMenu({ categories, selectedCategory, onSelectCategory }: CategoryMenuProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1 px-2 md:px-4 bg-black/50 backdrop-blur-md sticky top-0 z-20">
      <div className="flex space-x-3 md:space-x-4 justify-center">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm md:text-base font-medium transition-colors duration-200 ${
              selectedCategory === category.id
                ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg`
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}
