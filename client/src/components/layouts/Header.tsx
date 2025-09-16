import { useState } from "react";
import { Link, useLocation } from "wouter";
import { FaSearch, FaBars, FaUser, FaSun, FaMoon } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Switch,
} from "@/components/ui/switch";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { name: "Products", path: "/" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-background text-foreground border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold">
              Car Parts Hub
            </Link>
          </div>
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={
                  location === item.path
                    ? "text-foreground font-medium"
                    : "hover:text-foreground/80"
                }
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {user ? (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ) : (
                  <button type="button" className="p-0 border-none bg-transparent hover:text-foreground/80">
                    <FaUser className="h-5 w-5" />
                  </button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {user ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="cursor-pointer"
                    >
                      Log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Welcome</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/seller-register">Register</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center space-x-2">
              <span className="sr-only">Toggle theme</span>
              <FaSun className={`h-4 w-4 ${isDark ? 'text-muted-foreground' : 'text-foreground'}`} />
              <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
                aria-label="Toggle dark mode"
              />
              <FaMoon className={`h-4 w-4 ${isDark ? 'text-foreground' : 'text-muted-foreground'}`} />
            </div>

            <button
              onClick={toggleMobileMenu}
              className="md:hidden focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"} bg-background border-t border-border`}>
        <div className="container mx-auto px-4 py-3 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={
                location === item.path
                  ? "block text-foreground font-medium"
                  : "block hover:text-foreground/80"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
