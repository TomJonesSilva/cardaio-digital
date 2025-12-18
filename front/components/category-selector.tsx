"use client"

import { useState } from "react"
import { Search, ChevronDown } from "lucide-react"
import { useCategorias } from "@/context/categoria-context"

interface CategorySelectorProps {
  onCategoryChange?: (category: string) => void
}

export default function CategorySelector({ onCategoryChange }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const { categorias } = useCategorias()

  // 🔹 Mostra apenas categorias ativas
  const activeCategories = categorias.filter((cat) => cat.ativo)

  // 🔹 Lista dinâmica com nome e id
  const categoryList = [{ id: "todas", nome: "Todas" }, ...activeCategories]

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category)
    setIsOpen(false)
    onCategoryChange?.(category)
  }

  return (
    <div className="bg-white px-4 py-4 border-b border-gray-200">
      <div className="flex gap-3">
        {/* Dropdown de categorias */}
        <div className="flex-1 relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:border-gray-400 transition"
          >
            <span className="text-sm font-medium">{selectedCategory}</span>
            <ChevronDown
              size={18}
              className={`text-gray-600 transition ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Menu de opções */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {categoryList.map((cat) => (
                <button
                  key={cat.id} // 🔹 ID único, evita erro de chave duplicada
                  onClick={() => handleSelectCategory(cat.nome)}
                  className={`w-full text-left px-4 py-3 hover:bg-red-50 transition ${
                    selectedCategory === cat.nome
                      ? "bg-red-100 text-red-600 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {cat.nome}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botão de busca (opcional) */}
        <button className="bg-white border border-gray-300 rounded-lg p-3 hover:border-gray-400 transition">
          <Search size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  )
}
