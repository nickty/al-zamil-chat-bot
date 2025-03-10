"use client"

import Link from "next/link"
import { useAuth } from "./AuthProvider"
import { Button } from "./ui/button"
import { signOut } from "@/utils/auth"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { LogOut, Settings, Calculator, DollarSign } from "lucide-react"

export default function Navbar() {
  const { user, loading, setUser } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold">
            ZHI Assistant
          </Link>
          {/* Only show admin links for admin users */}
          {user?.role === "admin" && (
            <>
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
                Admin Dashboard
              </Link>
              <Link href="/engineering" className="text-sm text-muted-foreground hover:text-foreground">
                Engineering Assistant
              </Link>
              <Link href="/production" className="text-sm text-muted-foreground hover:text-foreground">
                Production Intelligence
              </Link>
              <Link href="/estimation" className="text-sm text-muted-foreground hover:text-foreground">
                <span className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Estimation
                </span>
              </Link>
              <Link href="/finance" className="text-sm text-muted-foreground hover:text-foreground">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Finance</span>
                </div>
              </Link>
              <Link href="/custom-responses" className="text-sm text-muted-foreground hover:text-foreground">
                Manage Responses
              </Link>
            </>
          )}
        </div>
        <div>
          {loading ? (
            <Button variant="ghost" disabled>
              Loading...
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.picture} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="font-medium">{user.name}</DropdownMenuItem>
                <DropdownMenuItem className="text-muted-foreground">{user.email}</DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Only show admin options for admin users */}
                {user?.role === "admin" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/estimation" className="cursor-pointer">
                        <Calculator className="mr-2 h-4 w-4" />
                        <span>Estimation Tool</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/custom-responses" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Manage Responses</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </nav>
  )
}

