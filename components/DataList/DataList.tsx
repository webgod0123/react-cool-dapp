import { Box, BoxProps, GridSizeType, ResponsiveContext } from 'grommet'
import { ItemKey, SortDirection } from 'lib/hooks/sort/types'
import * as React from 'react'
import { DataListBody, DataListHeader } from '.'
import { DataListHeaderProps } from './DataListHeader'
import DataListTitle, { DataListTitleProps } from './DataListTitle'

export interface IDataListColumn {
  title: string
  size: GridSizeType
  display?: boolean
  tooltip?: React.ReactNode
  jusitfy?: BoxProps['justify']
  sortable?: boolean
  sortLabel?: string
  number?: boolean
}

export interface DataListProps<T> {
  background?: BoxProps['background']
  children?: React.ReactNode
  columns: IDataListColumn[]
  sortKey?: ItemKey<T>
  sortDirection?: SortDirection
  handleSortChange?: (sort: string) => void
  title?: DataListTitleProps
}

function DataList<T>({
  background,
  children,
  columns,
  sortKey,
  sortDirection,
  handleSortChange,
  title,
}: DataListProps<T>) {
  const size = React.useContext(ResponsiveContext)

  return (
    <Box align="center" round="8px" fill="horizontal">
      {title && <DataListTitle title={title} />}
      {size !== 'small' && (
        <DataListHeader {...({ columns, sortKey, sortDirection, handleSortChange } as DataListHeaderProps<T>)} />
      )}
      <DataListBody>{children}</DataListBody>
    </Box>
  )
}

export default DataList
