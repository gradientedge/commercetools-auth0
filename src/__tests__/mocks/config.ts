import { CommercetoolsAuth0Config } from '../../types'
import { Region } from '@gradientedge/commercetools-utils'

export const mockConfig: CommercetoolsAuth0Config = {
  commercetools: {
    projectKey: 'test-project-key',
    region: Region.EUROPE_GCP,
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
  },
}
