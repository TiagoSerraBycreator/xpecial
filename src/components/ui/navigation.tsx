'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, LogOut } from 'lucide-react'

export default function Navigation() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-xl font-bold text-blue-600">Xpecial</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/vagas" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Vagas
            </Link>
            <Link href="/empresas" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Empresas
            </Link>
            
            {session ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => signOut()}
                  className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Entrar
                </Link>
                <Link href="/cadastro" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Cadastrar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link href="/vagas" className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">
              Vagas
            </Link>
            <Link href="/empresas" className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">
              Empresas
            </Link>
            
            {session ? (
              <>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">
                  Entrar
                </Link>
                <Link href="/cadastro" className="block bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}