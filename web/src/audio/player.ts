export async function playAudio(blob: Blob): Promise<void> {
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  return new Promise((resolve, reject) => {
    audio.onended = () => { URL.revokeObjectURL(url); resolve() }
    audio.onerror = (e) => { URL.revokeObjectURL(url); reject(e) }
    audio.play().catch(reject)
  })
}
