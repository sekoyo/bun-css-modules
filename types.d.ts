declare module '*.module.css' {
  const styles: { [className: string]: string }
  const css: string
  export { styles, css }
}
