import * as React from 'react'
import { NavLink } from 'react-router-dom'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

function NavbarExameple() {
  return (
    <header className="sticky top-0 z-50 border-b border-blue-700 bg-blue-700">
      <div className="mx-auto flex max-w-7xl items-center justify-start px-4 py-3 md:px-6">
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle({
                  className:
                    'bg-transparent text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white data-[active]:bg-blue-600 data-[active]:text-white',
                })}
              >
                <NavLink to="/visitas-medicas">Visitas Medicas</NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle({
                  className:
                    'bg-transparent text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white data-[active]:bg-blue-600 data-[active]:text-white',
                })}
              >
                <NavLink to="/ventas">Ventas</NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle({
                  className:
                    'bg-transparent text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white data-[active]:bg-blue-600 data-[active]:text-white',
                })}
              >
                <NavLink to="/dashboard">Dashboard</NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}

export default NavbarExameple
