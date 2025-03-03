import { IField } from "@/lib/store/interface"

export const getDynamicallyTypes = (fields: IField<any>[]) => {
  let typeDefine = ``
  fields.forEach((field) => {
    typeDefine += `const ${field.name} = '${field.name}'\n`
  })
  return typeDefine
}

export const getUDFs = (functions: { name: string; code: string }[]) => {
  let udfs = ``
  functions.forEach((func) => {
    udfs += func.code
  })
  return udfs
}
