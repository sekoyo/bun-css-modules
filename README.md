# bun-css-modules

Allows you to import CSS Modules directly into Bun.

This loader uses the incredibly fast Rust based [Lightning CSS](https://lightningcss.dev/) under the hood.

## Installation

To install dependencies:

```bash
bun add -D bun-css-modules
```

Create a `bunfig.toml` if you don't have one and add:

```ts
import { plugin } from 'bun'
import { moduleCssLoader } from 'bun-css-modules'

plugin(moduleCssLoader())
```

## Example Usage

Example using [Hono JSX](https://hono.dev/guides/jsx):

```css
/* Button.module.css */
.buttonBase {
  appearance: none;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  border-radius: 4px;
}

.primary {
  composes: buttonBase;
  background: blue;
  color: white;
  border: 1px solid purple;
}
```

```jsx
import styles from './Button.module.css'

export function PrimaryButton({ children }) {
  return <button class={styles.primary}>{children}</button>
}
```

Include styles once in your head via the special `cssString` property.

```jsx
import buttonStyles from 'src/components/Button/Button.module.css'
import tableStyles from 'src/components/Table/Table.module.css'

export function Layout({ title, children }: LayoutProps) {
  return (
    <html>
      <head>
        <title>{title}</title>
        <style>{buttonStyles.cssString}</style>
        <style>{tableStyles.cssString}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

```jsx
import { PrimaryButton } from 'src/components/Button'
import styles from './SignUpPage.module.css'

function SignUpPage() {
  return (
    <div class={styles.container}>
      <h1>Sign up</h1>
      <PrimaryButton>Sign up</PrimaryButton>
      {/* One-off page styling can just be included here */}
      <style>{styles}</style>
    </div>
  )
}
```
