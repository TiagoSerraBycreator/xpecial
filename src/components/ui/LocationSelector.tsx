'use client'

import { useEffect, useState } from 'react'
import { useIBGELocation } from '@/hooks/useIBGELocation'
import { MapPin, ChevronDown } from 'lucide-react'

interface LocationSelectorProps {
  value?: string
  onChange: (location: string) => void
  error?: string
  placeholder?: string
  required?: boolean
}

export default function LocationSelector({
  value = '',
  onChange,
  error,
  placeholder = 'Selecione a localização',
  required = false
}: LocationSelectorProps) {
  const { estados, municipios, loadingEstados, loadingMunicipios, fetchMunicipios } = useIBGELocation()
  const [selectedEstado, setSelectedEstado] = useState('')
  const [selectedMunicipio, setSelectedMunicipio] = useState('')
  const [isRemote, setIsRemote] = useState(false)

  // Parse do valor inicial
  useEffect(() => {
    if (value) {
      if (value.toLowerCase().includes('remoto') || value.toLowerCase().includes('home office')) {
        setIsRemote(true)
        setSelectedEstado('')
        setSelectedMunicipio('')
      } else {
        // Tentar extrair estado e município do valor
        const parts = value.split(',')
        if (parts.length >= 2) {
          const estadoPart = parts[parts.length - 1].trim()
          const municipioPart = parts[0].trim()
          
          // Encontrar estado pela sigla ou nome
          const estado = estados.find(e => 
            e.sigla.toLowerCase() === estadoPart.toLowerCase() ||
            e.nome.toLowerCase() === estadoPart.toLowerCase()
          )
          
          if (estado) {
            setSelectedEstado(estado.id.toString())
            // Carregar municípios e depois selecionar
            fetchMunicipios(estado.id).then(() => {
              // Este efeito será executado quando os municípios forem carregados
            })
          }
        }
      }
    }
  }, [value, estados, fetchMunicipios])

  // Selecionar município quando os municípios forem carregados
  useEffect(() => {
    if (value && selectedEstado && municipios.length > 0) {
      const parts = value.split(',')
      if (parts.length >= 1) {
        const municipioPart = parts[0].trim()
        const municipio = municipios.find(m => 
          m.nome.toLowerCase() === municipioPart.toLowerCase()
        )
        if (municipio) {
          setSelectedMunicipio(municipio.id.toString())
        }
      }
    }
  }, [municipios, value, selectedEstado])

  const handleEstadoChange = (estadoId: string) => {
    setSelectedEstado(estadoId)
    setSelectedMunicipio('')
    
    if (estadoId) {
      fetchMunicipios(parseInt(estadoId))
    }
    
    // Se só tem estado selecionado, atualizar o valor
    if (estadoId && !selectedMunicipio) {
      const estado = estados.find(e => e.id.toString() === estadoId)
      if (estado) {
        onChange(`${estado.nome}, ${estado.sigla}`)
      }
    }
  }

  const handleMunicipioChange = (municipioId: string) => {
    setSelectedMunicipio(municipioId)
    
    if (municipioId && selectedEstado) {
      const estado = estados.find(e => e.id.toString() === selectedEstado)
      const municipio = municipios.find(m => m.id.toString() === municipioId)
      
      if (estado && municipio) {
        onChange(`${municipio.nome}, ${estado.sigla}`)
      }
    }
  }

  const handleRemoteChange = (remote: boolean) => {
    setIsRemote(remote)
    
    if (remote) {
      setSelectedEstado('')
      setSelectedMunicipio('')
      onChange('Remoto')
    } else {
      onChange('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Opção Remoto */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="remote-work"
          checked={isRemote}
          onChange={(e) => handleRemoteChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="remote-work" className="text-sm font-medium text-gray-700">
          Trabalho Remoto / Home Office
        </label>
      </div>

      {/* Seletores de localização */}
      {!isRemote && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seletor de Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado {required && '*'}
            </label>
            <div className="relative">
              <select
                value={selectedEstado}
                onChange={(e) => handleEstadoChange(e.target.value)}
                disabled={loadingEstados}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                  error ? 'border-red-500' : 'border-gray-300'
                } ${loadingEstados ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Selecione o estado</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nome} ({estado.sigla})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {loadingEstados && (
              <p className="mt-1 text-sm text-gray-500">Carregando estados...</p>
            )}
          </div>

          {/* Seletor de Município */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade {required && '*'}
            </label>
            <div className="relative">
              <select
                value={selectedMunicipio}
                onChange={(e) => handleMunicipioChange(e.target.value)}
                disabled={!selectedEstado || loadingMunicipios}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                  error ? 'border-red-500' : 'border-gray-300'
                } ${(!selectedEstado || loadingMunicipios) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Selecione a cidade</option>
                {municipios.map((municipio) => (
                  <option key={municipio.id} value={municipio.id}>
                    {municipio.nome}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {loadingMunicipios && (
              <p className="mt-1 text-sm text-gray-500">Carregando cidades...</p>
            )}
            {selectedEstado && !loadingMunicipios && municipios.length === 0 && (
              <p className="mt-1 text-sm text-gray-500">Nenhuma cidade encontrada</p>
            )}
          </div>
        </div>
      )}

      {/* Visualização do valor atual */}
      {value && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Localização: {value}
          </span>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}