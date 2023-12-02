declare module '*.module.css' {
  const styles: {
    cssText: string
    [className: string]: string
  }
  export default styles
}
