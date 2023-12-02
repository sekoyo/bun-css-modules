import { BunPlugin } from 'bun'
import { parse } from 'path'
import { transform, browserslistToTargets } from 'lightningcss'
import browserslist from 'browserslist'

const cssTextKey = 'cssText'

const defaultBrowserlist = [
  'last 3 chrome version',
  'last 3 firefox version',
  'last 2 safari version',
]

type Options = {
  browserlistQuery?: string | string[]
}

export function moduleCssLoader({ browserlistQuery = defaultBrowserlist }: Options = {}) {
  const pluginConfig: BunPlugin = {
    name: 'Module CSS Loader',
    async setup(build) {
      const { readFileSync } = await import('fs')

      build.onLoad({ filter: /\.module.css$/ }, args => {
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

        return {
          exports: Object.entries(exports || {}).reduce((o, [k, desc]) => {
            if (k === cssTextKey) {
              throw new Error(`${cssTextKey} is a reserved class name`)
            }

            if (desc.composes.length) {
              o[k] = `${desc.name} ${desc.composes.map(c => c.name).join(' ')}`
            } else {
              o[k] = desc.name
            }
            return o
          }, baseExport),
          loader: 'object',
        }
      })
    },
  }

  return pluginConfig
}
