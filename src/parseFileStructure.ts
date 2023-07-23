import { readdirSync, statSync, readFileSync } from "fs"
import { FileOrFolder } from "./lib"
import { minimatch } from "minimatch"
import { join } from "path"

const commonFileLang: Record<string, string> = {
    ".gitignore": "gitignore",
    ".npmignore": "gitignore",
    ".prettierignore": "gitignore",
    ".eslintignore": "gitignore",
    ".dockerignore": "gitignore",
    ".gitattributes": "gitattributes",
    ".gitmodules": "gitmodules",
    ".gitkeep": "gitkeep",
    ".prettierrc": "json",
    ".eslintrc": "json",
    ".babelrc": "json",
}

export const parseFileStructure = (
    path: string,
    ignore: string[] = [],
): FileOrFolder[] => {
    // get files and folders using fs
    const filesAndFolders = readdirSync(path)

    // parse files and folders
    const parsedFilesAndFolders = filesAndFolders.map<FileOrFolder | null>(
        (fileOrFolder) => {
            if (ignore.some((pattern) => minimatch(fileOrFolder, pattern))) {
                return null
            }

            const fullPath = join(path, fileOrFolder)
            const isDir = statSync(fullPath).isDirectory()

            if (isDir) {
                return {
                    type: "folder",
                    name: fileOrFolder,
                    children: parseFileStructure(fileOrFolder),
                } as const
            }

            // TODO: use another method for images and other files?

            return {
                type: "file",
                name: fileOrFolder,
                content: readFileSync(fullPath, { encoding: "utf-8" }),
            } as const
        },
    )

    return parsedFilesAndFolders.filter(Boolean) as FileOrFolder[]
}

const parseFileStructureToMarkdown = (
    fileOrFolder: FileOrFolder,
    depth = 0,
): string => {
    const indent = "    ".repeat(depth)

    switch (fileOrFolder.type) {
        case "file": {
            const contentIndent = "    ".repeat(depth + 1)
            const lang =
                commonFileLang[fileOrFolder.name] ||
                fileOrFolder.name.split(".").pop()
            return `${indent}- ${fileOrFolder.name}
${contentIndent}\`\`\`${lang}
${contentIndent}${fileOrFolder.content?.replaceAll("\n", "\n" + contentIndent)}
${contentIndent}\`\`\`
`
        }
        case "folder":
            return `${indent}- ${fileOrFolder.name}
${fileOrFolder.children
    .map((child) => parseFileStructureToMarkdown(child, depth + 1))
    .join("")}
`
    }
}

export const createMarkdownFromFilesAndFolders = (
    path: string,
    ignore: string[] = [],
): string => {
    const filesAndFolders = parseFileStructure(path, ignore)

    return filesAndFolders
        .map((fileOrFolder) => parseFileStructureToMarkdown(fileOrFolder))
        .join("")
}
