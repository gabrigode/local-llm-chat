import { useRef } from 'react'
import { Upload, FileText, X } from 'lucide-react'

interface FileUploaderProps {
  fileName?: string
  onFileLoaded: (fileName: string, fileContent: string) => void
  onRemoveFile: () => void
}

function FileUploader({
  fileName,
  onFileLoaded,
  onRemoveFile,
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'text/plain') {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          onFileLoaded(file.name, content)
        }
        reader.readAsText(file)
      } else {
        alert('Por favor, selecione um arquivo .txt')
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    onRemoveFile()
  }

  return (
    <div className="mb-4 p-3 bg-gray-900/50 rounded-lg flex items-center justify-between">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt"
      />
      {!fileName ? (
        <>
          <span className="text-gray-400">
            Nenhum arquivo de contexto carregado.
          </span>
          <button
            onClick={handleButtonClick}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Carregar .txt
          </button>
        </>
      ) : (
        <div className="flex items-center gap-3 text-green-400">
          <FileText className="h-5 w-5" />
          <span className="font-medium">{fileName}</span>
          <button
            onClick={handleRemoveFile}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default FileUploader
