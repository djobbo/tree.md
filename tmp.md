- .eslintrc.js
    ```js
    module.exports = {
        parser: "@typescript-eslint/parser",
        parserOptions: {
            ecmaVersion: 12,
            sourceType: "module",
        },
        extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
        plugins: ["prettier"],
        rules: {
            "prettier/prettier": "error",
        },
        env: {
            es2021: true,
            node: true,
        },
    }
    
    ```
- .prettierrc
    ```json
    {
      "semi": false,
      "printWidth": 80,
      "tabWidth": 4,
      "trailingComma": "all"
    }
    ```
- README.md
    ```md
    # Create file tree from markdown
    
    ## Example
    
    - hello
        - index.js
            ```js
            console.log("hello")
            ```
        - nezuko.webp
            ![](https://static.wikia.nocookie.net/4807c599-a06a-481c-af42-b442ab058d36/scale-to-width/755)
        - package.json
            ```json
            {
                "name": "hello",
                "version": "1.0.0",
                "description": "",
                "main": "index.js",
                "scripts": {
                    "test": "echo \"Error: no test specified\" && exit 1"
                },
                "keywords": [],
                "author": "",
                "license": "ISC"
            }
            ```
        - world
            - main.py
                ```py
                print("world")
                ```
    - ontesteici
        - index.ts
            ```ts
            console.log("ontesteici")
            //salut les boss
            ```
    
    ```
- jest.config.js
    ```js
    /** @type {import('ts-jest').JestConfigWithTsJest} */
    module.exports = {
        preset: "ts-jest",
        testEnvironment: "node",
    }
    
    ```
- package.json
    ```json
    {
      "name": "mdir",
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "scripts": {
        "dev": "tsnd --respawn src/index.ts",
        "test": "jest --watchAll --verbose",
        "lint": "eslint --ext .js,.jsx,.ts,.tsx .",
        "lint:fix": "eslint --fix --ext .js,.jsx,.ts,.tsx ."
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "devDependencies": {
        "@types/jest": "^29.5.3",
        "@types/jsdom": "^21.1.1",
        "@types/markdown-it": "^12.2.3",
        "@types/marked": "^5.0.1",
        "@types/node": "^20.4.2",
        "@typescript-eslint/eslint-plugin": "^6.1.0",
        "@typescript-eslint/parser": "^6.1.0",
        "eslint": "^8.45.0",
        "eslint-plugin-prettier": "^5.0.0",
        "jest": "^29.6.1",
        "prettier": "^3.0.0",
        "ts-jest": "^29.1.1",
        "ts-node-dev": "^2.0.0",
        "typescript": "^5.1.6"
      },
      "dependencies": {
        "jsdom": "^22.1.0",
        "markdown-it": "^13.0.1",
        "marked": "^5.1.1",
        "minimatch": "^9.0.3"
      }
    }
    ```
- src
    - createFileStructure.ts
        ```ts
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
        
        ```
    - index.ts
        ```ts
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
        
        ```
    - lib.test.ts
        ```ts
        import { parse } from "./lib"
        
        it("renders list", () => {
            const md = `
        - hello
            - index.js
                \`\`\`js
                console.log("hello")
                \`\`\`
            - package.json
                \`\`\`js
                {}
                \`\`\`
            - world
                - main.py
                    \`\`\`py main.py
                    print("world")
                    \`\`\`
        `
        
            const parsed = parse(md)
        
            expect(parsed).toEqual([
                {
                    type: "folder",
                    name: "hello",
                    children: [
                        {
                            type: "file",
                            name: "index.js",
                            content: 'console.log("hello")',
                        },
                        {
                            type: "file",
                            name: "package.json",
                            content: "{}",
                        },
                        {
                            type: "folder",
                            name: "world",
                            children: [
                                {
                                    type: "file",
                                    name: "main.py",
                                    content: 'print("world")',
                                },
                            ],
                        },
                    ],
                },
            ])
        })
        
        ```
    - lib.ts
        ```ts
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
        
        ```
    - parseFileStructure.ts
        ```ts
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
        
        ```

- tsconfig.json
    ```json
    {
      "compilerOptions": {
        "target": "es5",
        "lib": [
          "dom",
          "dom.iterable",
          "esnext"
        ],
        "allowJs": true,
        "skipLibCheck": true,
        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true,
        "esModuleInterop": true,
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "jsx": "preserve",
        "incremental": true,
        "downlevelIteration": true,
      },
      "include": [
        "**/*.ts",
      ],
      "exclude": [
        "node_modules"
      ]
    }
    ```
