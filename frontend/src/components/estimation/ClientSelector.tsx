"use client"

import { useState, useEffect } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { getClients, type Client } from "@/utils/api"
import { ClientDialog } from "./ClientDialog"

interface ClientSelectorProps {
  selectedClientId: string
  onSelect: (clientId: string) => void
}

export function ClientSelector({ selectedClientId, onSelect }: ClientSelectorProps) {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [clientDialogOpen, setClientDialogOpen] = useState(false)

  const fetchClients = async () => {
    try {
      setLoading(true)
      const data = await getClients()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleClientCreated = (newClient: Client) => {
    setClients([...clients, newClient])
    onSelect(newClient._id)
  }

  const selectedClient = clients.find((client) => client._id === selectedClientId)

  return (
    <>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
              {selectedClient ? selectedClient.name : "Select client..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Search clients..." />
              <CommandList>
                <CommandEmpty>{loading ? "Loading clients..." : "No clients found."}</CommandEmpty>
                <CommandGroup>
                  {clients.map((client) => (
                    <CommandItem
                      key={client._id}
                      value={client._id}
                      onSelect={() => {
                        onSelect(client._id)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", selectedClientId === client._id ? "opacity-100" : "opacity-0")}
                      />
                      {client.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="icon" onClick={() => setClientDialogOpen(true)} title="Add New Client">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ClientDialog open={clientDialogOpen} onOpenChange={setClientDialogOpen} onClientCreated={handleClientCreated} />
    </>
  )
}

