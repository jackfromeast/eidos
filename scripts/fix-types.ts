import fs from "node:fs/promises"

// Adjusted the path to reflect the new script location inside the scripts directory
const filePath = "./packages/types/index.d.ts"

// Read the file
const fileContent = await fs.readFile(filePath, "utf-8")
const lines = fileContent.split('\n')

const outputLines: string[] = []
let inModuleToRemove = false
let braceCount = 0

const moduleDeclareRegex = /^\s*declare module "([^"]+)"\s*\{/

for (const line of lines) {
    const match = line.match(moduleDeclareRegex)

    if (match) {
        const modulePath = match[1]
        // Check if the module path does NOT start with "packages/"
        if (!modulePath.startsWith("packages/")) {
            inModuleToRemove = true
            // Start counting braces. Assume the opening brace is on this line.
            // If the opening brace is on the next line, this needs adjustment.
            braceCount = (line.match(/\{/g) || []).length
             // If the closing brace is also on this line adjust count
            braceCount -= (line.match(/\}/g) || []).length

            // If the block starts and ends on the same line
            if (braceCount <= 0) {
                inModuleToRemove = false
            }
            // Skip the `declare module` line itself
            continue
        }
        // If it starts with "packages/", treat it as a normal line (falls through to adding it)
    }

    if (inModuleToRemove) {
        // Count braces to find the end of the module block
        braceCount += (line.match(/\{/g) || []).length
        braceCount -= (line.match(/\}/g) || []).length

        // If braceCount reaches 0 or less, we've found the closing brace
        if (braceCount <= 0) {
            inModuleToRemove = false
            braceCount = 0 // Reset count
            // Skip the closing brace line itself
            continue
        }
        // If still inside the module to remove, skip the current line
        continue
    }

    // If not in a module to remove, add the line to the output
    outputLines.push(line)
}

// Join the kept lines back into a single string
let processedContent = outputLines.join('\n')


// replace  "worker/web-worker/sdk/index" => "@eidos.space/types"
// Apply the original replacement (ensure it's still needed and correct)
processedContent = processedContent.replace(
  // packages/worker/web-worker/sdk/index
  /"packages\/worker\/web-worker\/sdk\/index"/g,
  '"@eidos.space/types"'
)

console.log("Fixing types: Removing non-package modules and applying replacements.")
// Adjusted the path here as well
await fs.writeFile(filePath, processedContent)

console.log("fix types success")
