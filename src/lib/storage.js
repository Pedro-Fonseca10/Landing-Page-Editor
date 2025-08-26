const k = (name) => `plp:${name}`

export const load = (name, fallback=[]) => {
  try { 
    const data = localStorage.getItem(k(name))
    console.log(`Carregando ${name}:`, data)
    const parsed = JSON.parse(data ?? "null") ?? fallback
    console.log(`Dados parseados para ${name}:`, parsed)
    return parsed
  }
  catch (error) { 
    console.error(`Erro ao carregar ${name}:`, error)
    return fallback 
  }
}

export const save = (name, data) => {
  console.log(`Salvando ${name}:`, data)
  localStorage.setItem(k(name), JSON.stringify(data))
}
