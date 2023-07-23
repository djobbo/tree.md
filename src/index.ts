import { parseFile } from "./lib"
import { createFileStructure } from "./createFileStructure"
import { createMarkdownFromFilesAndFolders } from "./parseFileStructure"
import fs from "fs"

const main = async () => {
    // const filesAndFolders = await parseFile("./test.md")

    // createFileStructure(filesAndFolders, { baseFolder: "./.tmp" })

    fs.writeFileSync(
        "./tmp.md",
        createMarkdownFromFilesAndFolders(".", [
            ".git",
            ".tmp",
            "node_modules",
            "pnpm-lock.yaml",
            "tmp.md",
        ]),
        "utf-8",
    )

    const filesAndFolders = await parseFile("./tmp.md")
    createFileStructure(filesAndFolders, { baseFolder: "./.tmp" })
}

main()
