"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, ExternalLink, Building2 } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { type ISidebarLink, sidebarLinks } from "@/config/sidebar"
import type { Session } from "next-auth"
import { signOut } from "next-auth/react"
import { NotificationMenu } from "../NotificationMenu"
import { UserDropdownMenu } from "../UserDropdownMenu"
import { OrderNotification } from "@/actions/notifications"


interface SidebarProps {
  session: Session
  notifications?: OrderNotification[]
}

export default function Sidebar({ session, notifications = [] }: SidebarProps) {
  const router = useRouter()
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null)
  const pathname = usePathname()
  const user = session.user

  // Helper function to check if user has permission
  const hasPermission = (permission: string): boolean => {
    return user.permissions?.includes(permission) ?? false
  }

  // Filter sidebar links based on permissions
  const filterSidebarLinks = (links: ISidebarLink[]): ISidebarLink[] => {
    return links
      .filter((link) => hasPermission(link.permission))
      .map((link) => ({
        ...link,
        dropdownMenu: link.dropdownMenu?.filter((item) => hasPermission(item.permission)),
      }))
      .filter((link) => !link.dropdown || (link.dropdownMenu && link.dropdownMenu.length > 0))
  }

  const filteredLinks = filterSidebarLinks(sidebarLinks)

  async function handleLogout() {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="fixed top-0 left-0 h-full w-[220px] lg:w-[280px] border-r border-border bg-background hidden md:block overflow-y-auto shadow-sm">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex flex-shrink-0 h-14 items-center border-b border-border px-4 lg:h-[60px] lg:px-6 bg-background">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-sky-600" />
            <span className="font-bold text-lg text-sky-600">WalterProjects</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationMenu notifications={notifications} />
          </div>
        </div>

        <div className="flex-1">
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-2">Main Navigation</p>
          </div>
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
            {filteredLinks.map((item, i) => {
              const Icon = item.icon
              const isHrefIncluded = item.dropdownMenu && item.dropdownMenu.some((link) => link.href === pathname)

              const isOpen = openDropdownIndex === i

              return (
                <div key={i}>
                  {item.dropdown ? (
                    <Collapsible open={isOpen}>
                      <CollapsibleTrigger
                        onClick={() => setOpenDropdownIndex(isOpen ? null : i)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-accent hover:text-accent-foreground w-full",
                          (isHrefIncluded || isOpen) && "bg-accent text-accent-foreground font-medium",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.title}
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 ml-auto flex shrink-0 items-center justify-center" />
                        ) : (
                          <ChevronRight className="h-4 w-4 ml-auto flex shrink-0 items-center justify-center" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="rounded mt-1 pl-4">
                        {item.dropdownMenu?.map((menuItem, i) => (
                          <Link
                            key={i}
                            href={menuItem.href}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-foreground transition-all hover:bg-accent hover:text-accent-foreground text-xs ml-4",
                              pathname === menuItem.href && "bg-primary/10 text-primary font-medium",
                            )}
                          >
                            <div
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                pathname === menuItem.href ? "bg-primary" : "bg-foreground/40",
                              )}
                            ></div>
                            {menuItem.title}
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <Link
                      href={item.href ?? "#"}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href && "bg-primary/10 text-primary font-medium",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  )}
                </div>
              )
            })}

            <div className="mt-6 px-4 py-2">
              <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-2">External Links</p>
            </div>

            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
              target="_blank"
            >
              <ExternalLink className="h-4 w-4" />
              Live Website
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-border">
          <UserDropdownMenu
            username={session?.user?.name ?? ""}
            email={session?.user?.email ?? ""}
            avatarUrl={
              session?.user?.image ??
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(54)-NX3G1KANQ2p4Gupgnvn94OQKsGYzyU.png"
            }
          />
        </div>
      </div>
    </div>
  )
}
