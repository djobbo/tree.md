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
