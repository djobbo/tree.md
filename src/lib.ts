import { marked } from "marked"
import { readFile } from "fs/promises"

export type File = {
    type: "file"
    name: string
    content?: string
    href?: string
}

export type Folder = {
    type: "folder"
    name: string
    children: FileOrFolder[]
}

export type FileOrFolder = File | Folder

const parseList = (list: marked.Tokens.List) => {
    const fileOrFolder = list.items.map<FileOrFolder>((item) => {
        const tokens = item.tokens

        const fileOrFolder = Array.from(tokens).reduce<FileOrFolder>(
            (acc, token, i): FileOrFolder => {
                switch (token.type) {
                    case "text": {
                        if (i !== 0) {
                            throw new Error(
                                "filename must be the first element",
                            )
                        }

                        // @ts-expect-error token.tokens is not in the type
                        const tokens = token.tokens

                        if (tokens.length !== 1) {
                            switch (tokens[1].type) {
                                case "image":
                                    return {
                                        type: "file",
                                        name: tokens[0].text.trim(),
                                        href: tokens[1].href,
                                    }
                                default:
                                    throw new Error("invalid token")
                            }
                        }

                        return {
                            type: "folder",
                            name: token.text,
                            children: [],
                        }
                    }
                    case "code":
                        if (i !== 1) {
                            throw new Error(
                                "code block must be the second element",
                            )
                        }

                        return {
                            type: "file",
                            name: acc.name,
                            content: token.text,
                        }
                    case "list":
                        if (acc.type !== "folder") {
                            throw new Error("list must be inside a folder")
                        }

                        return {
                            type: "folder",
                            name: acc.name,
                            children: [...acc.children, ...parseList(token)],
                        }
                    default:
                        throw new Error("invalid token")
                }
            },
            {
                type: "folder",
                name: "",
                children: [],
            },
        )

        return fileOrFolder
    })

    return fileOrFolder
}

export const parse = (markdown: string) => {
    const lexer = new marked.Lexer({})
    const tokens = lexer.lex(markdown)

    return tokens
        .map((token) => {
            switch (token.type) {
                case "list":
                    return parseList(token)
                default:
                    break
            }
        })
        .filter(Boolean)
        .flat() as FileOrFolder[]
}

export const parseFile = async (filePath: string) => {
    const file = await readFile(filePath, "utf-8")
    return parse(file)
}
