/* Simple web RAG with Brave Search (optional API key) and Wikipedia fallback */
type Source = {
  title: string
  url: string
  snippet?: string
  content?: string
}

const truncate = (s: string, max = 1200) =>
  s.length > max ? s.slice(0, max - 3) + '...' : s

async function searchWithBrave(query: string): Promise<Source[]> {
  const token = import.meta.env.VITE_BRAVE_API_KEY
  if (!token) return []

  try {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=3`,
      { headers: { 'X-Subscription-Token': token } }
    )
    if (!res.ok) return []
    const data = await res.json()
    const results: any[] = data?.web?.results ?? []
    return results.slice(0, 3).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.description,
    }))
  } catch {
    return []
  }
}

async function searchWikipedia(query: string): Promise<Source[]> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(query)}&limit=3`
    )
    if (!res.ok) return []
    const data = await res.json()
    const pages: any[] = data?.pages ?? []
    const sources: Source[] = []
    for (const p of pages.slice(0, 3)) {
      const title = p.title
      const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
      // fetch plain text
      const textRes = await fetch(
        `https://en.wikipedia.org/w/rest.php/v1/page/${encodeURIComponent(title)}/plain`
      )
      const content = textRes.ok ? await textRes.text() : ''
      sources.push({ title, url, content: truncate(content, 1500) })
    }
    return sources
  } catch {
    return []
  }
}

export async function retrieveWebContext(query: string): Promise<{
  context: string
  sources: Source[]
}> {
  // Try Brave, fallback to Wikipedia
  const brave = await searchWithBrave(query)
  const sources = brave.length > 0 ? brave : await searchWikipedia(query)

  if (sources.length === 0) return { context: '', sources: [] }

  const context = sources
    .map((s, i) => {
      const body = s.snippet ?? s.content ?? ''
      return `Fonte ${i + 1}:
Título: ${s.title}
URL: ${s.url}
Trecho: ${truncate(body, 700)}`
    })
    .join('\n---\n')

  return { context, sources }
}
