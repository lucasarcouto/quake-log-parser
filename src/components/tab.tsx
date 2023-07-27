import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

/**
 * Default tab component for the application.
 * Make sure to not add any gap between the `children`
 * because this component will override their styles in
 * order to create the correct visuals that are expected.
 *
 * @param children contains one or more components used as the
 * content for this tab.
 */
export function Tab({ children }: Props) {
  return <div className="tab">{children}</div>
}
