import { Box, BoxProps } from 'grommet';
import * as React from 'react';

export interface DataListBodyProps {
  children?: React.ReactNode;
  fill?: BoxProps['fill'];
  gap?: BoxProps['gap'];
}

const DataListBody = ({ children, fill, gap }: DataListBodyProps) => (
  <Box fill={fill || 'horizontal'}>
    {children}
  </Box>
);

export default DataListBody;
