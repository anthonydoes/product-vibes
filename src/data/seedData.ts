// Seed data script for populating the database with sample products
import { supabase } from '../lib/supabase'

export const seedProducts = [
  {
    name: "Focus Flow",
    description: "A minimal productivity app that helps you maintain deep focus with ambient sounds and timer features.",
    logo_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
    website_url: "https://focusflow.app",
    category: "Productivity",
    is_trending: true,
  },
  {
    name: "CodeSnap AI",
    description: "Transform your code screenshots into beautiful, shareable images with syntax highlighting and themes.",
    logo_url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
    website_url: "https://codesnap.ai",
    category: "Developer Tools",
  },
  {
    name: "Palette Genius",
    description: "Generate stunning color palettes from images using AI. Perfect for designers and creative projects.",
    logo_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    website_url: "https://palettegenius.co",
    category: "Creative Tools",
  },
  {
    name: "Meeting Buddy",
    description: "AI-powered meeting assistant that takes notes, summarizes key points, and tracks action items automatically.",
    logo_url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop",
    website_url: "https://meetingbuddy.app",
    category: "AI-Powered",
    is_trending: true,
  },
  {
    name: "Retro Games Hub",
    description: "Play classic arcade games in your browser. Nostalgic pixel-perfect gaming experience with modern features.",
    logo_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop",
    website_url: "https://retrogameshub.com",
    category: "Fun & Games",
  },
  {
    name: "Plant Care AI",
    description: "Smart plant monitoring system that uses computer vision to detect diseases and suggest care routines.",
    logo_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    website_url: "https://plantcare.ai",
    category: "Side Projects",
  }
]

export async function insertSeedProducts(userId: string) {
  const productsWithCreator = seedProducts.map(product => ({
    ...product,
    creator_id: userId,
    upvotes: Math.floor(Math.random() * 500) + 10, // Random upvotes between 10-510
  }))

  const { data, error } = await supabase
    .from('products')
    .insert(productsWithCreator)
    .select()

  if (error) {
    console.error('Error inserting seed products:', error)
    return { success: false, error }
  }

  console.log('Successfully inserted seed products:', data)
  return { success: true, data }
}
