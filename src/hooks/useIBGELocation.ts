import { useState, useEffect, useCallback } from 'react'

interface Estado {
  id: number
  sigla: string
  nome: string
}

interface Municipio {
  id: number
  nome: string
}

export function useIBGELocation() {
  const [estados, setEstados] = useState<Estado[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [loadingEstados, setLoadingEstados] = useState(false)
  const [loadingMunicipios, setLoadingMunicipios] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar estados
  useEffect(() => {
    const fetchEstados = async () => {
      setLoadingEstados(true)
      setError(null)
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
        if (!response.ok) {
          throw new Error('Erro ao carregar estados')
        }
        const data = await response.json()
        setEstados(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoadingEstados(false)
      }
    }

    fetchEstados()
  }, [])

  // Função para carregar municípios por estado
  const fetchMunicipios = useCallback(async (estadoId: number) => {
    setLoadingMunicipios(true)
    setError(null)
    setMunicipios([])
    
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios?orderBy=nome`)
      if (!response.ok) {
        throw new Error('Erro ao carregar municípios')
      }
      const data = await response.json()
      setMunicipios(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoadingMunicipios(false)
    }
  }, [])

  return {
    estados,
    municipios,
    loadingEstados,
    loadingMunicipios,
    error,
    fetchMunicipios
  }
}