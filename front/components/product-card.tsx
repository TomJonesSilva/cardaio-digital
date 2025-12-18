"use client"

interface Product {
  id: string
  title: string
  description: string
  price: string
  image: string
  category: string
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition cursor-pointer">
      <div className="flex gap-4">
        {/* Content */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{product.description}</p>
          <p className="font-bold text-gray-900 text-lg">{product.price}</p>
        </div>

        {/* Image */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
            <img src={product.image || "/placeholder.svg"} alt={product.title} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  )
}
