type Props = {
  label: string
  value: string
  groupValue: string
  onClick?: (value: string) => void
}

/**
 * Default component used as children for the `Tab` component.
 *
 * @param label is used as the text for this item.
 * @param value is the value this item represents in a group of items.
 * @param groupValue is the currently selected value for
 * a group of items.
 * @param onClick is called whenever a user clicks on this item. The
 * value this callback will receive as a parameter is used to update
 * the currently selected `groupValue`.
 */
export function TabBarItem({ label, value, groupValue, onClick }: Props) {
  return (
    <button
      className={`tab-bar-item ${value == groupValue ? 'selected' : ''}`}
      type="button"
      onClick={() => onClick?.(value)}
    >
      {label}
    </button>
  )
}
