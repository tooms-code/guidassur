"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/frontend/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/frontend/hooks/useAuth";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/comprendre", label: "Comprendre" },
  { href: "/#tarifs", label: "Tarifs" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 py-4 border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-500 hover:text-gray-900"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop nav */}
          <nav className="flex-1 hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/assets/logo.svg"
              alt="Guidassur"
              width={150}
              height={60}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop right side */}
          <div className="flex-1 hidden md:flex items-center justify-end gap-6">
            {!isLoading && user ? (
              <>
                <Link
                  href="/compte"
                  className="relative text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150 whitespace-nowrap flex items-center gap-2 after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-emerald-500 after:transition-all after:duration-150 hover:after:w-full"
                >
                  <User size={16} />
                  {user.fullName || "Mon compte"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="relative text-sm text-gray-500 hover:text-red-500 transition-colors duration-150 whitespace-nowrap flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="relative text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150 whitespace-nowrap after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-emerald-500 after:transition-all after:duration-150 hover:after:w-full"
                >
                  Se connecter
                </Link>
                <Link href="/questionnaire">
                  <Button size="sm">Analyser gratuitement</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile CTA */}
          <div className="md:hidden">
            {!isLoading && user ? (
              <Link href="/compte">
                <Button size="sm" variant="secondary">
                  <User size={16} />
                </Button>
              </Link>
            ) : (
              <Link href="/questionnaire">
                <Button size="sm">Analyser</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 z-50">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="px-3 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-gray-100 my-2" />
            {!isLoading && user ? (
              <>
                <Link
                  href="/compte"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <User size={18} className="text-gray-400" />
                  {user.fullName || "Mon compte"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left w-full"
                >
                  <LogOut size={18} className="text-gray-400" />
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <User size={18} className="text-gray-400" />
                Se connecter
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
