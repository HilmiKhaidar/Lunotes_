import { 
  FileText, 
  Briefcase, 
  User, 
  Lightbulb, 
  CheckSquare, 
  BookOpen, 
  Target, 
  Laptop, 
  Home, 
  Palette,
  Heart,
  Star,
  Coffee,
  Music,
  Camera,
  Gamepad2,
  Plane,
  Car,
  ShoppingBag,
  Utensils,
  LucideIcon
} from 'lucide-react'

export interface IconOption {
  name: string
  component: LucideIcon
}

export const iconOptions: IconOption[] = [
  { name: 'FileText', component: FileText },
  { name: 'Briefcase', component: Briefcase },
  { name: 'User', component: User },
  { name: 'Lightbulb', component: Lightbulb },
  { name: 'CheckSquare', component: CheckSquare },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Target', component: Target },
  { name: 'Laptop', component: Laptop },
  { name: 'Home', component: Home },
  { name: 'Palette', component: Palette },
  { name: 'Heart', component: Heart },
  { name: 'Star', component: Star },
  { name: 'Coffee', component: Coffee },
  { name: 'Music', component: Music },
  { name: 'Camera', component: Camera },
  { name: 'Gamepad2', component: Gamepad2 },
  { name: 'Plane', component: Plane },
  { name: 'Car', component: Car },
  { name: 'ShoppingBag', component: ShoppingBag },
  { name: 'Utensils', component: Utensils }
]

export const getIconComponent = (iconName: string) => {
  const icon = iconOptions.find(icon => icon.name === iconName)
  return icon?.component || FileText
}

interface IconSelectorProps {
  selectedIcon: string
  onIconSelect: (iconName: string) => void
}

const IconSelector = ({ selectedIcon, onIconSelect }: IconSelectorProps) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {iconOptions.map((icon) => {
        const IconComponent = icon.component
        return (
          <button
            key={icon.name}
            onClick={() => onIconSelect(icon.name)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
              selectedIcon === icon.name 
                ? 'bg-yellow-400 shadow-md' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <IconComponent size={20} className="text-gray-700" />
          </button>
        )
      })}
    </div>
  )
}

export default IconSelector