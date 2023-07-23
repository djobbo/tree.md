import { FileOrFolder } from "./lib"
import { join } from "path"
import { writeFileSync, mkdirSync, createWriteStream } from "fs"
import https from "https"

export const createFileStructure = async (
    filesAndFolders: FileOrFolder[],
    { baseFolder }: { baseFolder: string },
) => {
    filesAndFolders.forEach((fileOrFolder) => {
        const path = join(baseFolder, fileOrFolder.name)
        switch (fileOrFolder.type) {
            case "file":
                console.log(`creating file ${path}...`)
                if (fileOrFolder.href) {
                    console.log(`downloading content for ${fileOrFolder.href}`)
                    // Download content from fileOrFolder.href
                    https.get(fileOrFolder.href, (res) => {
                        const stream = createWriteStream(path)
                        res.pipe(stream)

                        stream.on("finish", () => {
                            console.log(
                                `finished downloading ${fileOrFolder.href}`,
                            )
                        })
                    })
                }
                if (fileOrFolder.content) {
                    writeFileSync(path, fileOrFolder.content, {
                        encoding: "utf-8",
                    })
                }
                break
            case "folder":
                console.log(`creating folder ${path}...`)
                mkdirSync(path, { recursive: true })
                createFileStructure(fileOrFolder.children, { baseFolder: path })
                break
        }
    })
}
