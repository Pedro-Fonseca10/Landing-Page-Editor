/*
  Funções para registrar e recuperar eventos analíticos.
  Armazena eventos no localStorage com informações como tipo, timestamp, IDs de visitante/sessão, URL, parâmetros UTM e dados do dispositivo.
*/

import { getVisitorId, getSessionId } from "./session"

const K_EVENTS = "plp:events"

const utmFromUrl = () => {
  try {
    const p = new URLSearchParams(window.location.search)
    const o = {}
    ;["utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach(k=>{
      const v = p.get(k); if (v) o[k] = v
    })
    return o
  } catch { return {} }
}

const deviceInfo = () => ({
  ua: navigator.userAgent,
  lang: navigator.language,
  width: window.innerWidth,
  height: window.innerHeight,
})

export function logEvent(type, extra = {}) {
  const events = JSON.parse(localStorage.getItem(K_EVENTS) || "[]")
  const base = {
    id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    type,
    timestamp: new Date().toISOString(),
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    url: window.location.href,
    ...utmFromUrl(),
    ...deviceInfo(),
  }
  events.push({ ...base, ...extra })
  localStorage.setItem(K_EVENTS, JSON.stringify(events))
}

export function getEvents() {
  return JSON.parse(localStorage.getItem(K_EVENTS) || "[]")
}

export function clearEvents() {
  localStorage.removeItem(K_EVENTS)
}
