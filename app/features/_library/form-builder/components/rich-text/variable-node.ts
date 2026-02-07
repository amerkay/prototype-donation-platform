import { Node, mergeAttributes } from '@tiptap/vue-3'

export interface VariableNodeOptions {
  HTMLAttributes: Record<string, unknown>
}

export const VariableNode = Node.create<VariableNodeOptions>({
  name: 'variableNode',
  group: 'inline',
  inline: true,
  atom: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-variable')
      }
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-variable]' }]
  },

  renderHTML({
    node,
    HTMLAttributes
  }: {
    node: { attrs: Record<string, string> }
    HTMLAttributes: Record<string, unknown>
  }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-variable': node.attrs.id
      }),
      `{{ ${node.attrs.id} }}`
    ]
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addCommands(): any {
    const nodeName = this.name
    return {
      insertVariable:
        (id: string) =>
        ({ commands }: { commands: { insertContent: (content: unknown) => boolean } }) =>
          commands.insertContent({ type: nodeName, attrs: { id } })
    }
  }
})
