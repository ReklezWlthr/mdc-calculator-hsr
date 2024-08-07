import { UseQueryOptions } from '@tanstack/react-query'
import { QueryKeyT, useFetch } from './common/react_query'
import { AxiosError } from 'axios'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export const useGetData = (uid: string, options?: UseQueryOptions<any, AxiosError, any, QueryKeyT>) => {
  return useFetch<any>(`${publicRuntimeConfig.BASE_PATH}/api/getHSRUser`, { uid }, { staleTime: 60 * 1000, ...options })
}
