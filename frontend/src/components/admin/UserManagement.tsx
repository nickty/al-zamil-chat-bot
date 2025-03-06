"use client"

import { useState, useEffect } from "react"
import { getAllUsers, updateUserSuspension, updateUserRole, type User } from "@/utils/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreVertical, Shield, UserIcon, UserX, UserCheck, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/AuthProvider"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<{
    userId: string
    action: "suspend" | "unsuspend" | "makeAdmin" | "removeAdmin"
    userName: string
  } | null>(null)
  const { user: currentUser } = useAuth()

  const fetchUsers = async () => {
    try {
      setRefreshing(true)
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    try {
      await updateUserSuspension(userId, suspend)
      setUsers(users.map((user) => (user._id === userId ? { ...user, suspended: suspend } : user)))
      toast.success(`User ${suspend ? "suspended" : "unsuspended"} successfully`)
    } catch (error) {
      console.error("Error updating user suspension:", error)
      toast.error(`Failed to ${suspend ? "suspend" : "unsuspend"} user`)
    }
  }

  const handleUpdateRole = async (userId: string, role: "user" | "admin") => {
    try {
      await updateUserRole(userId, role)
      setUsers(users.map((user) => (user._id === userId ? { ...user, role } : user)))
      toast.success(`User role updated to ${role} successfully`)
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error(`Failed to update user role`)
    }
  }

  const handleConfirmAction = () => {
    if (!selectedAction) return

    const { userId, action, userName } = selectedAction

    switch (action) {
      case "suspend":
        handleSuspendUser(userId, true)
        break
      case "unsuspend":
        handleSuspendUser(userId, false)
        break
      case "makeAdmin":
        handleUpdateRole(userId, "admin")
        break
      case "removeAdmin":
        handleUpdateRole(userId, "user")
        break
    }

    setConfirmDialogOpen(false)
    setSelectedAction(null)
  }

  const promptAction = (
    userId: string,
    action: "suspend" | "unsuspend" | "makeAdmin" | "removeAdmin",
    userName: string,
  ) => {
    setSelectedAction({ userId, action, userName })
    setConfirmDialogOpen(true)
  }

  const getActionTitle = () => {
    if (!selectedAction) return ""

    switch (selectedAction.action) {
      case "suspend":
        return `Suspend ${selectedAction.userName}'s Account`
      case "unsuspend":
        return `Unsuspend ${selectedAction.userName}'s Account`
      case "makeAdmin":
        return `Make ${selectedAction.userName} an Admin`
      case "removeAdmin":
        return `Remove Admin Rights from ${selectedAction.userName}`
    }
  }

  const getActionDescription = () => {
    if (!selectedAction) return ""

    switch (selectedAction.action) {
      case "suspend":
        return `${selectedAction.userName} will no longer be able to log in to the system. Are you sure you want to suspend this account?`
      case "unsuspend":
        return `${selectedAction.userName} will be able to log in to the system again. Are you sure you want to unsuspend this account?`
      case "makeAdmin":
        return `${selectedAction.userName} will have full administrative access to the system. Are you sure you want to grant admin rights?`
      case "removeAdmin":
        return `${selectedAction.userName} will no longer have administrative access. Are you sure you want to remove admin rights?`
    }
  }

  const getActionButtonText = () => {
    if (!selectedAction) return ""

    switch (selectedAction.action) {
      case "suspend":
        return "Suspend Account"
      case "unsuspend":
        return "Unsuspend Account"
      case "makeAdmin":
        return "Grant Admin Rights"
      case "removeAdmin":
        return "Remove Admin Rights"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading user data...</div>
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.picture} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "outline"}>
                        {user.role === "admin" ? (
                          <Shield className="h-3 w-3 mr-1" />
                        ) : (
                          <UserIcon className="h-3 w-3 mr-1" />
                        )}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.suspended ? "destructive" : "success"}>
                        {user.suspended ? "Suspended" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</TableCell>
                    <TableCell>
                      {user._id !== currentUser?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.suspended ? (
                              <DropdownMenuItem
                                onClick={() => promptAction(user._id, "unsuspend", user.name)}
                                className="text-green-600"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Unsuspend Account
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => promptAction(user._id, "suspend", user.name)}
                                className="text-destructive"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Suspend Account
                              </DropdownMenuItem>
                            )}

                            {user.role === "admin" ? (
                              <DropdownMenuItem onClick={() => promptAction(user._id, "removeAdmin", user.name)}>
                                <UserIcon className="mr-2 h-4 w-4" />
                                Remove Admin Rights
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => promptAction(user._id, "makeAdmin", user.name)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getActionTitle()}</AlertDialogTitle>
            <AlertDialogDescription>{getActionDescription()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                selectedAction?.action === "suspend" || selectedAction?.action === "removeAdmin"
                  ? "bg-destructive text-destructive-foreground"
                  : ""
              }
            >
              {getActionButtonText()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

