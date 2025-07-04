"use client"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function SearchBox({
  value,
  onChange,
  className = ""
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        placeholder="Cari artikel..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}