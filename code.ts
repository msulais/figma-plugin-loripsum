type GeneratorType = 'word' | 'sentence' | 'paragraph'
type FigmaMessage = {
    type: string,
    count: number,
    generatorType: GeneratorType
}

const ALL_LOREM_IPSUM = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(' ')
const MIN_WORDS_PER_SENTENCE = 7
const MAX_WORDS_PER_SENTENCE = 20
const MIN_SENTENCE_PER_PARAGRAPH = 3
const MAX_SENTENCE_PER_PARAGRAPH = 6

function getRandomWord(): string {
    return ALL_LOREM_IPSUM[Math.ceil(Math.random() * (ALL_LOREM_IPSUM.length - 1))]
}

function getRandomSentence(): string {
    const text: string[] = []
    const range = MAX_WORDS_PER_SENTENCE - MIN_WORDS_PER_SENTENCE + 1
    for (let j = 0; j < MIN_WORDS_PER_SENTENCE + (Math.random() * range); j++) {
        text.push(getRandomWord())
    }

    const t = text.join(' ') + '.'
    return t.substring(0, 1).toUpperCase() + t.substring(1).toLowerCase()
}

function getRandomParagraph(): string {
    const text: string[] = []
    const range = MAX_SENTENCE_PER_PARAGRAPH - MIN_SENTENCE_PER_PARAGRAPH + 1
    for (let j = 0; j < MIN_SENTENCE_PER_PARAGRAPH + (Math.random() * range); j++) {
        text.push(getRandomSentence())
    }

    return text.join(' ')
}

async function generateLoremIpsumText(count: number, type: GeneratorType) {
    const textArr: string[] = []
    let separator = ' '
    for (let i = 0; i < count; i++) {
        sw: switch (type) {
        case "word":
            textArr.push(getRandomWord())
            break sw
        case "sentence":
            textArr.push(getRandomSentence())
            break sw
        case "paragraph":
            separator = '\n\n'
            textArr.push(getRandomParagraph())
            break sw
        }
    }

    const text = textArr.join(separator)
    const selection = figma.currentPage.selection
    const textNodes = selection.filter(node => node.type === "TEXT") as TextNode[]

    if (textNodes.length > 0) {
        for (const node of textNodes) {
            try {
                await figma.loadFontAsync(node.fontName as FontName)
                node.characters = text
            } catch (error) {
                console.error("Error loading font or setting text:", error)
            }
        }
    } else {
        const textNode = figma.createText()
        try {
            await figma.loadFontAsync(textNode.fontName as FontName)
            textNode.characters = text

            const {x, y, width, height} = figma.viewport.bounds
            textNode.x = x + width / 2
            textNode.y = y + height / 2
            figma.currentPage.selection = [textNode]
        } catch (error) {
            console.error("Error creating new text node:", error)
        }
    }
}

function initFigmaPluginMessage() {
    figma.ui.onmessage = ({ type, count, generatorType }: FigmaMessage) => {
        if (type === 'generate') {
            generateLoremIpsumText(count, generatorType)
        }
    }
}

function initFigmaWindow() {
    figma.showUI(__html__)

    const height = 256
    const titleBarHeight = 40
    figma.ui.resize(height + titleBarHeight, height)
}

function main() {
    initFigmaWindow()
    initFigmaPluginMessage()
}

main()