export const categoryConfig = [
  { 
    id: "all", 
    name: "All", 
    icon: "🌐", 
    color: "from-gray-500 to-gray-600"
  },
  { 
    id: "Creative Tools", 
    name: "Creative Tools", 
    icon: "🎨", 
    color: "from-pink-500 to-purple-500"
  },
  { 
    id: "Productivity", 
    name: "Productivity", 
    icon: "🚀", 
    color: "from-blue-500 to-cyan-500"
  },
  { 
    id: "Fun & Games", 
    name: "Fun & Games", 
    icon: "🎮", 
    color: "from-green-500 to-emerald-500"
  },
  { 
    id: "Developer Tools", 
    name: "Developer Tools", 
    icon: "🛠️", 
    color: "from-orange-500 to-red-500"
  },
  { 
    id: "AI-Powered", 
    name: "AI-Powered", 
    icon: "💡", 
    color: "from-yellow-500 to-orange-500"
  },
  { 
    id: "Side Projects", 
    name: "Side Projects", 
    icon: "🌱", 
    color: "from-green-400 to-blue-500"
  },
  { 
    id: "E-commerce", 
    name: "E-commerce", 
    icon: "🛒", 
    color: "from-purple-500 to-pink-500"
  },
  { 
    id: "Health & Fitness", 
    name: "Health & Fitness", 
    icon: "💪", 
    color: "from-red-500 to-orange-500"
  },
  { 
    id: "Education", 
    name: "Education", 
    icon: "📚", 
    color: "from-indigo-500 to-purple-500"
  }
]

export function getCategoryById(id: string) {
  return categoryConfig.find(cat => cat.id === id)
}

export function getCategoryByName(name: string) {
  return categoryConfig.find(cat => cat.name === name || cat.id === name)
}
