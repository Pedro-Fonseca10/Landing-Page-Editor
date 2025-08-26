// Função para gerar IDs únicos mais robustos
export const uid = () => {
  // Combina timestamp + random para maior unicidade
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 10)
  return `${timestamp}-${random}`
}
