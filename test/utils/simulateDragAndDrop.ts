import { nextTick } from 'vue'
import type { VueWrapper } from '@vue/test-utils'

type SimulateOptions = {
  /**
   * How many ticks to wait for vee-validate + Vue + auto-animate to settle.
   * Default: 3
   */
  settleTicks?: number
}

/**
 * Simulate HTML5 drag-and-drop by dispatching native DragEvents
 *
 * Tests the native drag-and-drop implementation in FormFieldArray:
 * - onDragStart/onDragEnd on drag handle
 * - onDragOver on target items
 * - Visual order updates during drag
 * - vee-validate move() on drop
 *
 * @param wrapper - Vue wrapper containing the array items
 * @param fromIndex - Source index of the item to move
 * @param toIndex - Target index where the item should be moved
 * @param opts - Configuration options
 *
 * @example
 * ```ts
 * await simulateDragAndDrop(wrapper, 0, 2)
 * ```
 */
export async function simulateDragAndDrop(
  wrapper: VueWrapper,
  fromIndex: number,
  toIndex: number,
  opts: SimulateOptions = {}
) {
  const { settleTicks = 3 } = opts

  // Find the array container - it's the grid container that holds the array items
  // Use a more robust selector that doesn't rely on directives
  const allItems = wrapper.findAll('.ff-array__item, .ff-array__item--simple')
  if (allItems.length === 0) {
    throw new Error('No array items found')
  }

  // Get the parent container of the first item
  const firstItemElement = allItems[0]!.element
  const arrayContainer = firstItemElement.parentElement!

  // Get only direct children of the array container to avoid nested arrays
  const directItemSelectors = arrayContainer.querySelectorAll(
    ':scope > .ff-array__item, :scope > .ff-array__item--simple'
  )

  // Map DOM elements back to DOMWrappers
  const items = Array.from(directItemSelectors).map((el) => {
    return allItems.find((w) => w.element === el)!
  })

  if (fromIndex < 0 || fromIndex >= items.length) {
    throw new Error(
      `simulateDragAndDrop: fromIndex ${fromIndex} out of range (0..${items.length - 1})`
    )
  }
  if (toIndex < 0 || toIndex >= items.length) {
    throw new Error(`simulateDragAndDrop: toIndex ${toIndex} out of range (0..${items.length - 1})`)
  }

  const sourceItem = items[fromIndex]!
  const targetItem = items[toIndex]!

  // Find the drag handle in the source item
  const dragHandle = sourceItem.find('.drag-handle')
  if (!dragHandle.exists()) {
    throw new Error('Drag handle not found. Is sortable enabled?')
  }

  // Create a mock DataTransfer object for jsdom
  const dataTransfer = {
    data: {} as Record<string, string>,
    effectAllowed: 'none',
    dropEffect: 'none',
    setData(format: string, data: string) {
      this.data[format] = data
    },
    getData(format: string) {
      return this.data[format] || ''
    },
    setDragImage() {},
    clearData() {
      this.data = {}
    }
  }

  // 1. Dispatch dragstart on the handle
  await dragHandle.trigger('dragstart', { dataTransfer })
  await nextTick()

  // 2. Dispatch dragover on target item (single call for clean state transition)
  await targetItem.trigger('dragover', { dataTransfer })
  await nextTick()

  // 3. Dispatch drop on target item
  await targetItem.trigger('drop', { dataTransfer })
  await nextTick()

  // 4. Dispatch dragend on the handle
  await dragHandle.trigger('dragend', { dataTransfer })

  // Wait for all reactive updates to settle
  for (let i = 0; i < settleTicks; i++) {
    await nextTick()
  }
}
