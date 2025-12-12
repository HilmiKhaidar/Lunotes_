import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RichTextEditor from './RichTextEditor'
import IconSelector, { getIconComponent } from './IconSelector'
import { FolderOpen } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  category: string
  tags: string[]
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6')
  const [newCategoryIcon, setNewCategoryIcon] = useState('FileText')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [categoryDropdown, setCategoryDropdown] = useState<string | null>(null)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      setShowSidebar(window.innerWidth >= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setCategoryDropdown(null)
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false)
    }
    
    setDeferredPrompt(null)
  }

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  // Load data from localStorage
  useEffect(() => {
    if (!showSplash) {
      // Load notes
      const savedNotes = localStorage.getItem('lunotes-data')
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes)
        // Migrate old notes to new format
        const migratedNotes = parsedNotes.map((note: any) => ({
          ...note,
          category: note.category || 'general',
          tags: note.tags || []
        }))
        setNotes(migratedNotes)
        if (migratedNotes.length > 0 && !isMobile) {
          setSelectedNote(migratedNotes[0])
        }
      }

      // Load categories
      const savedCategories = localStorage.getItem('lunotes-categories')
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories))
      } else {
        // Default categories
        const defaultCategories = [
          { id: 'general', name: 'General', color: '#6B7280', icon: 'FileText' },
          { id: 'work', name: 'Work', color: '#3B82F6', icon: 'Briefcase' },
          { id: 'personal', name: 'Personal', color: '#10B981', icon: 'User' },
          { id: 'ideas', name: 'Ideas', color: '#F59E0B', icon: 'Lightbulb' },
          { id: 'todo', name: 'To-Do', color: '#EF4444', icon: 'CheckSquare' }
        ]
        setCategories(defaultCategories)
        localStorage.setItem('lunotes-categories', JSON.stringify(defaultCategories))
      }
    }
  }, [showSplash, isMobile])

  // Save data to localStorage
  useEffect(() => {
    if (!showSplash) {
      localStorage.setItem('lunotes-data', JSON.stringify(notes))
    }
  }, [notes, showSplash])

  useEffect(() => {
    if (!showSplash) {
      localStorage.setItem('lunotes-categories', JSON.stringify(categories))
    }
  }, [categories, showSplash])

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: selectedCategory === 'all' ? 'general' : selectedCategory,
      tags: []
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setIsEditing(true)
    
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  const updateNote = (id: string, content: string) => {
    // Extract title from HTML content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    const firstHeading = tempDiv.querySelector('h1, h2, h3')
    
    let title = 'New Note'
    if (firstHeading?.textContent) {
      title = firstHeading.textContent.trim()
    } else {
      // If no heading, use first paragraph but exclude it from preview
      const firstParagraph = tempDiv.querySelector('p')
      if (firstParagraph?.textContent) {
        title = firstParagraph.textContent.trim()
      }
    }
    
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, title: title.substring(0, 50), content, updatedAt: new Date().toISOString() }
        : note
    ))
    
    if (selectedNote?.id === id) {
      setSelectedNote({ ...selectedNote, title: title.substring(0, 50), content, updatedAt: new Date().toISOString() })
    }
  }

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id)
    setNotes(updatedNotes)
    
    if (selectedNote?.id === id) {
      const nextNote = updatedNotes.length > 0 ? updatedNotes[0] : null
      setSelectedNote(nextNote)
      if (isMobile && !nextNote) {
        setShowSidebar(true)
      }
    }
  }

  const selectNote = (note: Note) => {
    setSelectedNote(note)
    setIsEditing(false)
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  const goBackToList = () => {
    setShowSidebar(true)
    setSelectedNote(null)
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString()
  }

  const createCategory = () => {
    if (!newCategoryName.trim()) return
    
    if (editingCategory) {
      // Update existing category
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: newCategoryName.trim(), color: newCategoryColor, icon: newCategoryIcon }
          : cat
      ))
    } else {
      // Create new category
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: newCategoryIcon
      }
      setCategories([...categories, newCategory])
    }
    
    setNewCategoryName('')
    setNewCategoryColor('#3B82F6')
    setNewCategoryIcon('FileText')
    setEditingCategory(null)
    setShowCategoryModal(false)
  }

  const editCategory = (category: Category) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setNewCategoryColor(category.color)
    setNewCategoryIcon(category.icon)
    setShowCategoryModal(true)
  }

  const deleteCategory = (categoryId: string) => {
    // Move all notes from this category to 'general'
    setNotes(notes.map(note => 
      note.category === categoryId 
        ? { ...note, category: 'general', updatedAt: new Date().toISOString() }
        : note
    ))
    
    // Remove category
    setCategories(categories.filter(cat => cat.id !== categoryId))
    
    // Reset selected category if it was deleted
    if (selectedCategory === categoryId) {
      setSelectedCategory('all')
    }
    
    setShowDeleteConfirm(null)
  }

  const updateNoteCategory = (noteId: string, categoryId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, category: categoryId, updatedAt: new Date().toISOString() } : note
    ))
    
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, category: categoryId, updatedAt: new Date().toISOString() })
    }
  }

  const addTagToNote = (noteId: string, tag: string) => {
    const cleanTag = tag.trim().toLowerCase().replace(/\s+/g, '-')
    if (!cleanTag) return
    
    setNotes(notes.map(note => {
      if (note.id === noteId && !note.tags.includes(cleanTag)) {
        return { ...note, tags: [...note.tags, cleanTag], updatedAt: new Date().toISOString() }
      }
      return note
    }))
    
    if (selectedNote?.id === noteId && !selectedNote.tags.includes(cleanTag)) {
      setSelectedNote({ 
        ...selectedNote, 
        tags: [...selectedNote.tags, cleanTag], 
        updatedAt: new Date().toISOString() 
      })
    }
  }

  const removeTagFromNote = (noteId: string, tag: string) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, tags: note.tags.filter(t => t !== tag), updatedAt: new Date().toISOString() }
        : note
    ))
    
    if (selectedNote?.id === noteId) {
      setSelectedNote({ 
        ...selectedNote, 
        tags: selectedNote.tags.filter(t => t !== tag), 
        updatedAt: new Date().toISOString() 
      })
    }
  }

  const getAllTags = () => {
    const allTags = notes.flatMap(note => note.tags)
    return Array.from(new Set(allTags)).sort()
  }

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id)
  }

  const filteredNotes = notes.filter(note => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory
    
    // Tags filter
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => note.tags.includes(tag))
    
    return matchesSearch && matchesCategory && matchesTags
  })

  // Splash Screen
  if (showSplash) {
    return (
      <div className="h-screen bg-yellow-400 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Floating circles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/10 rounded-full"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 20 - 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          
          {/* Animated dots pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-12 gap-4 h-full w-full p-8">
              {[...Array(48)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center relative z-10"
        >
          <motion.div
            initial={{ y: 20, rotate: -10 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
            className="mb-6"
          >
            <motion.div 
              className="w-24 h-24 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-2xl"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-6xl md:text-7xl font-black text-white mb-3 tracking-tight"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            LUNOTES
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-white/90 text-xl font-semibold"
          >
            Clarity in every word
          </motion.p>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="text-white/70 text-sm mt-2"
          >
            v1.0.0 by Lunetix
          </motion.p>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="mt-10 flex justify-center"
          >
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-3 h-3 bg-white rounded-full shadow-lg"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobile && showSidebar && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {(showSidebar || !isMobile) && (
          <motion.div
            initial={isMobile ? { x: -320 } : false}
            animate={{ x: 0 }}
            exit={isMobile ? { x: -320 } : {}}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`${
              isMobile 
                ? 'fixed left-0 top-0 h-full z-50 shadow-2xl' 
                : 'relative'
            } w-80 bg-white border-r border-gray-200 flex flex-col`}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
                <button
                  onClick={createNewNote}
                  className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors shadow-lg hover:shadow-xl active:scale-95"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Categories</h3>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  title="Add Category"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                    selectedCategory === 'all' 
                      ? 'bg-yellow-100 text-yellow-800 font-medium' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <FolderOpen size={18} className="text-gray-600" />
                  <span className="flex-1">All Notes</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {notes.length}
                  </span>
                </button>
                
                {categories.map((category) => {
                  const IconComponent = getIconComponent(category.icon)
                  
                  return (
                    <div key={category.id} className="relative group">
                      <div className="flex items-center">
                        <button
                          onClick={() => setSelectedCategory(category.id)}
                          className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                            selectedCategory === category.id 
                              ? 'bg-yellow-100 text-yellow-800 font-medium' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <IconComponent 
                            size={18} 
                            style={{ color: category.color }}
                          />
                          <span className="flex-1">{category.name}</span>
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                            {notes.filter(note => note.category === category.id).length}
                          </span>
                        </button>
                        
                        {/* Only show dropdown for non-default categories */}
                        {!['general', 'work', 'personal', 'ideas', 'todo'].includes(category.id) && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setCategoryDropdown(categoryDropdown === category.id ? null : category.id)
                              }}
                              className="p-1 ml-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                              </svg>
                            </button>
                            
                            {categoryDropdown === category.id && (
                              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    editCategory(category)
                                    setCategoryDropdown(null)
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setShowDeleteConfirm(category.id)
                                    setCategoryDropdown(null)
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tags */}
            {getAllTags().length > 0 && (
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {getAllTags().map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag))
                        } else {
                          setSelectedTags([...selectedTags, tag])
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-yellow-400 text-black'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotes.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">
                    {searchQuery ? 'No notes found' : 'No notes yet'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchQuery ? 'Try a different search term' : 'Tap + to create your first note'}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 mb-2 rounded-xl cursor-pointer transition-all group ${
                        selectedNote?.id === note.id 
                          ? 'bg-yellow-50 border-2 border-yellow-200 shadow-md' 
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                      onClick={() => selectNote(note)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 truncate flex-1 text-lg">
                          {note.title || 'New Note'}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNote(note.id)
                          }}
                          className="ml-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                          </svg>
                        </button>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {(() => {
                          const tempDiv = document.createElement('div')
                          tempDiv.innerHTML = note.content
                          
                          // Remove the first heading if it matches the title
                          const firstHeading = tempDiv.querySelector('h1, h2, h3')
                          if (firstHeading && firstHeading.textContent?.trim() === note.title) {
                            firstHeading.remove()
                          }
                          
                          const textContent = tempDiv.textContent || tempDiv.innerText || ''
                          return textContent.trim().substring(0, 120) + (textContent.trim().length > 120 ? '...' : '')
                        })()}
                      </p>
                      {/* Category and Tags */}
                      <div className="flex items-center gap-2 mb-2">
                        {(() => {
                          const category = getCategoryById(note.category)
                          if (!category) return null
                          const IconComponent = getIconComponent(category.icon)
                          return (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: category.color + '20', 
                                color: category.color 
                              }}
                            >
                              <IconComponent size={12} />
                              <span>{category.name}</span>
                            </span>
                          )
                        })()}
                        
                        {note.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                        
                        {note.tags.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{note.tags.length - 2} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400 font-medium">
                          {formatDate(note.updatedAt)}
                        </p>
                        <div className="flex items-center text-xs text-gray-400">
                          <span>{(() => {
                            const tempDiv = document.createElement('div')
                            tempDiv.innerHTML = note.content
                            const textContent = tempDiv.textContent || tempDiv.innerText || ''
                            return textContent.split(' ').filter(word => word.length > 0).length
                          })()} words</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Install Prompt */}
            {showInstallPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mx-4 mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-black text-sm">Install Lunotes</h4>
                    <p className="text-black/80 text-xs">Add to home screen for quick access</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowInstallPrompt(false)}
                      className="px-3 py-1 text-xs text-black/60 hover:text-black"
                    >
                      Later
                    </button>
                    <button
                      onClick={handleInstallClick}
                      className="px-3 py-1 bg-black/20 text-black text-xs font-medium rounded-lg hover:bg-black/30"
                    >
                      Install
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-center text-sm text-gray-500 font-medium">
                {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
              </div>
              <div className="text-center text-xs text-gray-400 mt-1">
                Lunotes v1.0.0 by Lunetix
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {isMobile && (
                    <button
                      onClick={goBackToList}
                      className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      isEditing 
                        ? 'bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isEditing ? 'Done' : 'Edit'}
                  </button>
                  
                  <span className="text-sm text-gray-500 font-medium">
                    {formatDate(selectedNote.updatedAt)}
                  </span>
                </div>
                
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                  </svg>
                </button>
              </div>

              {/* Category and Tags Controls */}
              <div className="space-y-3">
                {/* Category Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedNote.category}
                    onChange={(e) => updateNoteCategory(selectedNote.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedNote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTagFromNote(selectedNote.id, tag)}
                          className="ml-1 text-yellow-600 hover:text-yellow-800"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add tag and press Enter..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTagToNote(selectedNote.id, e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 bg-white overflow-hidden">
              {isEditing ? (
                <div className="h-full overflow-y-auto p-4">
                  <RichTextEditor
                    content={selectedNote.content}
                    onChange={(content) => updateNote(selectedNote.id, content)}
                    placeholder="Start writing your note..."
                  />
                </div>
              ) : (
                <div 
                  className="p-6 h-full overflow-y-auto cursor-text"
                  onClick={() => setIsEditing(true)}
                >
                  {selectedNote.content ? (
                    <div 
                      className="prose prose-sm max-w-none text-gray-900 leading-relaxed prose-headings:mb-4 prose-p:mb-4"
                      dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                          </svg>
                        </div>
                        <p className="text-gray-400 font-medium">Tap to start writing...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center max-w-sm mx-auto p-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Lunotes</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                {isMobile 
                  ? 'Tap the menu button to see your notes or create a new one'
                  : 'Select a note from the sidebar to start reading, or create a new note to begin writing'
                }
              </p>
              {isMobile && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-500 transition-colors shadow-lg"
                >
                  View Notes
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      {isMobile && !showSidebar && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={createNewNote}
          className="fixed bottom-6 right-6 w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl hover:bg-yellow-500 active:scale-95 transition-all z-30"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </motion.button>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <IconSelector
                  selectedIcon={newCategoryIcon}
                  onIconSelect={setNewCategoryIcon}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newCategoryColor === color ? 'ring-2 ring-gray-400 ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setEditingCategory(null)
                  setNewCategoryName('')
                  setNewCategoryColor('#3B82F6')
                  setNewCategoryIcon('FileText')
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Category</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this category? All notes in this category will be moved to "General".
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteCategory(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default App