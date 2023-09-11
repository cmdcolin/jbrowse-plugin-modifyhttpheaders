import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'
import { version } from '../package.json'
import {
  BaseInternetAccountConfig,
  InternetAccountType,
} from '@jbrowse/core/pluggableElementTypes'

import { InternetAccount } from '@jbrowse/core/pluggableElementTypes/models'
import { UriLocation } from '@jbrowse/core/util'
import { types } from 'mobx-state-tree'
import {
  ConfigurationReference,
  ConfigurationSchema,
} from '@jbrowse/core/configuration'

const stateModelFactory = () => {
  return InternetAccount.named('ModifyHTTPHeadersInternetAccount')
    .props({
      type: types.literal('ModifyHTTPHeadersInternetAccount'),

      configuration: ConfigurationReference(configSchema),
    })

    .actions((self) => {
      const superGetFetcher = self.getFetcher
      return {
        /**
         * #action
         * Get a fetch method that will add any needed authentication headers to
         * the request before sending it. If location is provided, it will be
         * checked to see if it includes a token in it's pre-auth information.
         *
         * @param loc - UriLocation of the resource
         * @returns A function that can be used to fetch
         */
        getFetcher(loc?: UriLocation) {
          const fetcher = superGetFetcher(loc)
          return async (input: RequestInfo, init?: RequestInit) => {
            return fetcher(input, {
              ...init,
              headers: { ...init?.headers, ExtraHTTPHeader: 'Wow' },
            })
          }
        },
        getTokenFromUser(resolve: (toke: string) => void) {
          // this is a random function that shouldn't be needed, but all internet accounts require this currently
          resolve('unused')
        },
      }
    })
}

// blank
const configSchema = ConfigurationSchema(
  'ModifyHTTPHeadersInternetAccount',
  {},
  {
    baseConfiguration: BaseInternetAccountConfig,
    explicitlyTyped: true,
  },
)
export default class ModifyHTTPHeadersPlugin extends Plugin {
  name = 'ModifyHTTPHeadersPlugin'
  version = version

  install(pluginManager: PluginManager) {
    pluginManager.addInternetAccountType(() => {
      return new InternetAccountType({
        name: 'ModifyHTTPHeadersInternetAccount',
        configSchema,
        stateModel: stateModelFactory(),
      })
    })
  }

  configure(pluginManager: PluginManager) {}
}
