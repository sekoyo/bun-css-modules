import { BunPlugin } from 'bun'
import { parse } from 'path'
import { transform, browserslistToTargets } from 'lightningcss'
import browserslist from 'browserslist'

const cssTextKey = 'cssText'

const defaultBrowserlist = [
  'last 4 chrome version',
  'last 4 firefox version',
  'last 2 safari version',
]

type Options = {
  filePattern?: RegExp
  browserlistQuery?: string | string[]
}

export function moduleCssLoader({
  filePattern = /\.module.css$/,
  browserlistQuery = defaultBrowserlist,
}: Options = {}) {
  const pluginConfig: BunPlugin = {
    name: 'Module CSS Loader',
    async setup(build) {
      const { readFileSync } = await import('fs')

      build.onLoad({ filter: filePattern }, args => {
        const cssText = readFileSync(args.path, 'utf8')

        const { code, exports } = transform({
          filename: parse(args.path).name,
          cssModules: true,
          code: Buffer.from(cssText),
          targets: browserslistToTargets(browserslist(browserlistQuery)),
        })

        const baseExport: { [className: string]: string } = {
          [cssTextKey]: new TextDecoder().decode(code),
        }

        const styleObj = Object.entries(exports || {}).reduce((o, [k, desc]) => {
          if (k === cssTextKey) {
            throw new Error(`${cssTextKey} is a reserved class name`)
          }
          if (k === 'default') {
            // This is the only I managed to allow default `import styles`
            // with bun object loader
            throw new Error(`default is a reserved class name`)
          }

          if (desc.composes.length) {
            o[k] = `${desc.name} ${desc.composes.map(c => c.name).join(' ')}`
          } else {
            o[k] = desc.name
          }
          return o
        }, baseExport)

        // Undocumented prop which allows importing as default
        // @ts-ignore
        styleObj.default = styleObj

        return {
          default: { penny: 'a' },
          exports: styleObj,
          loader: 'object',
        }
      })
    },
  }

  return pluginConfig
}
