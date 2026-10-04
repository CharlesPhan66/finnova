import { Fragment, jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime'
import { wrapProps } from './wrap'

export { Fragment }
export type { JSX } from 'react/jsx-runtime'
export const jsx: typeof _jsx = (type, props, key) => _jsx(type, wrapProps(type, props as Record<string, unknown>) as typeof props, key)
export const jsxs: typeof _jsxs = (type, props, key) => _jsxs(type, wrapProps(type, props as Record<string, unknown>) as typeof props, key)
