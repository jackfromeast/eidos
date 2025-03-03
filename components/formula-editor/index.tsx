import { CodeMirrorFormulaEditor } from "./codemirror-editor"

export const FormulaEditor = ({
  value,
  onChange,
  onSave,
  language = "javascript",
  udfs = [],
}: {
  value: string
  language: string
  onChange: (value: string) => void
  onSave?: (value: string) => void
  udfs?: { name: string; code: string }[]
}) => {
  return (
    <CodeMirrorFormulaEditor
      value={value}
      onChange={onChange}
      onSave={onSave}
      language={language}
      udfs={udfs}
    />
  )
}
