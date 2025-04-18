const fs = require("node:fs")
const path = require("node:path")
const process = require("node:process")

// Configuration for packages to process
const packagesToProcess = [
  {
    basePackageName: "sqlite-graft",
    entrypointBaseName: "libgraft",
    destBaseName: "libgraft",
  },
  {
    basePackageName: "sqlite-vec",
    entrypointBaseName: "vec0",
    destBaseName: "libvec",
  },
]

const DEST_DIR = "dist-sqlite-ext" // Destination directory relative to project root (Note: This constant seems unused in the rest of the logic)

// Mapping from Node's process.platform/process.arch to package suffixes
const platformArchMapping = {
  "win32 arm64": "windows-arm64",
  "win32 x64": "windows-x64",
  "darwin arm64": "darwin-arm64", // macOS Apple Silicon
  "darwin x64": "darwin-x64", // macOS Intel
  "linux arm64": "linux-arm64",
  "linux x64": "linux-x64",
}

// Mapping from Node's process.platform to file extensions
const platformExtensionMapping = {
  win32: "dll",
  darwin: "dylib",
  linux: "so",
}

// Updated function to accept basePackageName and entrypointBaseName
function getPlatformInfo(basePackageName, entrypointBaseName, destBaseName) {
  const platformKey = `${process.platform} ${process.arch}`
  const suffix = platformArchMapping[platformKey]
  const extension = platformExtensionMapping[process.platform]

  if (!suffix || !extension) {
    // Add package name to the warning
    console.warn(
      `postinstall-${basePackageName}: Unsupported platform ${platformKey}. Skipping copy.`
    )
    return null
  }

  const packageName = `${basePackageName}-${suffix}`
  const sourceFileName = `${entrypointBaseName}.${extension}`
  const destFileName = `${destBaseName}.${extension}`

  return { packageName, sourceFileName, destFileName }
}

// Updated function to include basePackageName in logs
function findSourcePath(basePackageName, packageName, sourceFileName) {
  const pnpmDir = path.join(process.cwd(), "node_modules", ".pnpm")
  let packageVersionDir = ""

  // Add basePackageName to logs
  console.log(
    `postinstall-${basePackageName}: Searching for package directory starting with ${packageName}@ in ${pnpmDir}`
  )

  try {
    const entries = fs.readdirSync(pnpmDir)
    const prefix = `${packageName}@`
    packageVersionDir = entries.find((entry) => entry.startsWith(prefix))

    if (!packageVersionDir) {
      // Add basePackageName to logs
      console.error(
        `postinstall-${basePackageName}: Could not find directory starting with ${prefix} in ${pnpmDir}`
      )
      console.log(
        `postinstall-${basePackageName}: Listing entries in .pnpm:`,
        entries.slice(0, 20).join(", ") + "..."
      ) // Log first few entries for debugging
      return null
    }
    // Add basePackageName to logs
    console.log(
      `postinstall-${basePackageName}: Found package directory: ${packageVersionDir}`
    )
  } catch (e) {
    if (e.code === "ENOENT") {
      // Add basePackageName to logs
      console.error(
        `postinstall-${basePackageName}: .pnpm directory not found at ${pnpmDir}. Run pnpm install first?`
      )
    } else {
      // Add basePackageName to logs
      console.error(
        `postinstall-${basePackageName}: Failed to read .pnpm directory: ${pnpmDir}`,
        e
      )
    }
    return null // Indicate failure to find source path
  }

  // Construct the direct path to the nested file
  const fullNestedSourcePath = path.join(
    pnpmDir,
    packageVersionDir,
    "node_modules",
    packageName,
    sourceFileName
  )

  // Add basePackageName to logs
  console.log(
    `postinstall-${basePackageName}: Directly checking path: ${fullNestedSourcePath}`
  )
  if (fs.existsSync(fullNestedSourcePath)) {
    // Add basePackageName to logs
    console.log(`postinstall-${basePackageName}: File found at direct path.`)
    return fullNestedSourcePath // Found it!
  } else {
    // Add basePackageName to logs
    console.error(
      `postinstall-${basePackageName}: File not found at direct path: ${fullNestedSourcePath}`
    )
    return null
  }
}

// --- Main Script Logic ---
console.log("--- Starting postinstall script for native dependencies ---")
let overallSuccess = true

packagesToProcess.forEach((pkgConfig) => {
  console.log(`
--- Processing package: ${pkgConfig.basePackageName} ---`)
  const basePackageName = pkgConfig.basePackageName // For logging prefix

  const platformInfo = getPlatformInfo(
    pkgConfig.basePackageName,
    pkgConfig.entrypointBaseName,
    pkgConfig.destBaseName
  )

  if (!platformInfo) {
    console.log(
      `postinstall-${basePackageName}: Skipping copy due to unsupported platform or config issue.`
    )
    return // Continue to the next package
  }

  const { packageName, sourceFileName, destFileName } = platformInfo

  // Pass basePackageName for logging purposes
  const nestedSourceFilePath = findSourcePath(
    basePackageName,
    packageName,
    sourceFileName
  )
  if (!nestedSourceFilePath) {
    console.log(
      `postinstall-${basePackageName}: Source file not found for ${packageName}. Skipping copy.`
    )
    return // Continue to the next package
  }

  // Derive the source *directory* from the file path found
  // const sourceDir = path.dirname(nestedSourceFilePath); // No longer needed

  // Define the destination directory path in the root node_modules
  // The destination directory is named after the platform-specific package name
  // const destDir = path.join(process.cwd(), 'node_modules', packageName); // Old destination

  // Use the DEST_DIR constant and destFileName for the final path
  const finalDestDir = path.resolve(process.cwd(), DEST_DIR) // Ensure DEST_DIR is resolved relative to cwd
  const finalDestPath = path.join(finalDestDir, destFileName)

  try {
    // Add basePackageName to logs
    console.log(`postinstall-${basePackageName}: Preparing to copy file.`)
    console.log(
      `postinstall-${basePackageName}: Source file: ${nestedSourceFilePath}`
    )
    console.log(
      `postinstall-${basePackageName}: Destination file: ${finalDestPath}`
    )

    // Ensure the destination directory exists
    // Add basePackageName to logs
    console.log(
      `postinstall-${basePackageName}: Ensuring destination directory exists: ${finalDestDir}`
    )
    fs.mkdirSync(finalDestDir, { recursive: true })

    // Remove destination directory if it already exists to ensure a clean copy
    // if (fs.existsSync(destDir)) { // Old logic for removing directory
    //   // Add basePackageName to logs
    //   console.log(`postinstall-${basePackageName}: Removing existing destination directory: ${destDir}`);
    //   fs.rmSync(destDir, { recursive: true, force: true });
    // }

    // Recursively copy the entire package content // Old comment
    // Add basePackageName to logs
    // console.log(`postinstall-${basePackageName}: Copying directory content recursively...`); // Old log
    // fs.cpSync(sourceDir, destDir, { recursive: true }); // Old copy logic

    // Copy the file directly
    // Add basePackageName to logs
    console.log(`postinstall-${basePackageName}: Copying file...`)
    fs.copyFileSync(nestedSourceFilePath, finalDestPath)

    // Add basePackageName to logs
    // console.log(`postinstall-${basePackageName}: Successfully copied package content to ${destDir}.`); // Old log
    console.log(
      `postinstall-${basePackageName}: Successfully copied file to ${finalDestPath}.`
    )
  } catch (error) {
    // Add basePackageName to logs
    // console.error(`postinstall-${basePackageName}: Failed to copy directory for ${packageName}:`, error); // Old log
    console.error(
      `postinstall-${basePackageName}: Failed to copy file ${sourceFileName} for ${packageName}:`,
      error
    )
    overallSuccess = false // Mark overall process as failed if any package fails
    // Continue to the next package
  }
})

console.log("--- Postinstall script finished ---")
process.exit(overallSuccess ? 0 : 1) // Exit with 0 if all succeed, 1 otherwise
