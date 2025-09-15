import { useRef, useState } from "react"

export default function PublicImageSaver({ lp }) {
  const fileInputRef = useRef(null)
  const [status, setStatus] = useState("")
  const [savedPath, setSavedPath] = useState("")
  const [saving, setSaving] = useState(false)

  const chooseFile = () => fileInputRef.current?.click()

  const suggestName = (file) => {
    const base = (lp?.slug || lp?.id || "lp").toString().slice(0, 24)
    const stem = `hero-${base}`
    const ext = (file.name.split(".").pop() || "png").toLowerCase()
    return `${stem}.${ext}`
  }

  const saveViaFSA = async (file) => {
    // File System Access API flow
    if (!window.showDirectoryPicker) {
      throw new Error("API não suportada. Use Chrome/Edge e ative HTTPS/localhost.")
    }
    // Ask user to pick the project public/ directory
    const dir = await window.showDirectoryPicker({
      id: "plp-public-folder",
      mode: "readwrite",
      startIn: "documents",
    })
    const targetName = suggestName(file)
    const handle = await dir.getFileHandle(targetName, { create: true })
    const writable = await handle.createWritable()
    await writable.write(file)
    await writable.close()
    return `/${targetName}`
  }

  const fallbackDownload = (file) => {
    // Fallback: trigger a regular browser download so the user can move it to public/
    const a = document.createElement("a")
    a.href = URL.createObjectURL(file)
    a.download = suggestName(file)
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(a.href)
    return `/${a.download}`
  }

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = "" // reset input for next use
    if (!file) return
    setSaving(true)
    setStatus("")
    setSavedPath("")
    try {
      let path = ""
      try {
        path = await saveViaFSA(file)
        setStatus("Imagem salva na pasta public.")
      } catch (err) {
        console.warn("FSA indisponível, usando download de arquivo.", err)
        path = fallbackDownload(file)
        setStatus("Baixei o arquivo. Mova-o para a pasta public.")
      }
      setSavedPath(path)
    } catch (err) {
      console.error(err)
      setStatus("Erro ao salvar imagem.")
    } finally {
      setSaving(false)
    }
  }

  const copyUrl = async () => {
    if (!savedPath) return
    try {
      await navigator.clipboard.writeText(savedPath)
      setStatus("URL copiada para a área de transferência.")
    } catch {
      setStatus("Não foi possível copiar a URL.")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      <button
        className="border rounded px-3 py-1"
        type="button"
        onClick={chooseFile}
        disabled={saving}
        title="Upload Imagem"
      >
        {saving ? "Salvando..." : "Upload Imagem"}
      </button>
      {savedPath && (
        <div className="flex items-center gap-2 text-sm">
          <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">{savedPath}</code>
          <button className="border rounded px-2 py-1" type="button" onClick={copyUrl}>Copiar URL</button>
        </div>
      )}
      {status && (
        <span className="text-xs text-slate-600 dark:text-slate-300">{status}</span>
      )}
    </div>
  )
}

